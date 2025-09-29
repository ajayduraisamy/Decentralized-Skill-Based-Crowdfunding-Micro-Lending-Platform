from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3
import mysql.connector
from deploy import Blockchain, CONTRACTS_DIR
import hashlib
import json
import random
import pandas as pd
import joblib
from dotenv import load_dotenv
import os

# -------------------------------
# LOAD ENV VARIABLES
# -------------------------------

load_dotenv()

GANACHE_URL = os.getenv("GANACHE_URL")
BACKEND_PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("ACCOUNT_KEY")


# -------------------------------
# FLASK SETUP
# -------------------------------
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY") or "supersecretkey"
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)


# -------------------------------
# DATABASE CONFIG
# -------------------------------
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "Micro_db"
}

def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


# -------------------------------
# BLOCKCHAIN SIMULATION
# -------------------------------
blockchain = Blockchain()


# -------------------------------
# WEB3 + SMART CONTRACT
# -------------------------------
w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
if not w3.is_connected:
    raise Exception("Cannot connect to Ganache")

if not all([GANACHE_URL, BACKEND_PRIVATE_KEY, CONTRACT_ADDRESS]):
    raise EnvironmentError("Missing environment variables.")

backend_account = w3.eth.account.from_key(BACKEND_PRIVATE_KEY)

with open(f"{CONTRACTS_DIR}/contract_abi.json", "r") as f:
    CONTRACT_ABI = json.load(f)

contract_instance = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

balance = w3.eth.get_balance(backend_account.address)
print("Backend balance:", w3.from_wei(balance, 'ether'), "ETH")

# -------------------------------
# UTILITIES
# -------------------------------
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# -------------------------------
# Load Ml Model & Trust Score
# -------------------------------

model = joblib.load("trust_score_model.pkl")


def calculate_trust_score(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT u.id, u.role, COUNT(p.id) as num_projects, 
               COALESCE(AVG(m.fund_amount), 0) as avg_milestone_completion
        FROM users u
        LEFT JOIN projects p ON u.id = p.borrower_id
        LEFT JOIN milestones m ON p.id = m.project_id
        WHERE u.id = %s
        GROUP BY u.id, u.role
    """, (user_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not row or row["role"] != "borrower":
        return 40 

    num_projects = max(1, row["num_projects"])
    avg_completion = max(0.5, row["avg_milestone_completion"])

    features = pd.DataFrame([{
        "num_projects": num_projects,
        "avg_milestone_completion": avg_completion,
        "skill_score": random.randint(70, 100),
        "gpa": random.uniform(7.0, 10.0),
        "repayment_rate": random.uniform(0.7, 1.0)
    }])
    probability = model.predict_proba(features)[0][1]
    return max(70, int(probability * 100))  





# -------------------------------
# USER ROUTES
# -------------------------------
@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "API is running"})

print(w3.eth.get_balance(backend_account.address))


#------------------------------
# User Register
#--------------------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    number = data.get("number")
    password = data.get("password")
    role = data.get("role")

    # Generate blockchain account
    new_account = w3.eth.account.create()
    blockchain_address = new_account.address
    private_key = new_account.key.hex() 

    hashed_pw = hash_password(password)

    # Blockchain simulation
    block_data = {
        "name": name,
        "email": email,
        "number": number,
        "address": blockchain_address,
        "role": role
    }
    new_block = blockchain.add_block(block_data)
    block_hash = new_block.hash

    # Save user in MySQL
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (name, email, number, password, role, blockchain_address, block_hash)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (name, email, number, hashed_pw, role, blockchain_address, block_hash))
    conn.commit()
    cursor.close()
    conn.close()

    # Solidity registration
    on_chain = False
    try:
        tx = contract_instance.functions.registerUser(blockchain_address, name).build_transaction({
            'from': backend_account.address,
            'nonce': w3.eth.get_transaction_count(backend_account.address),
            'gas': 3000000,
            'gasPrice': Web3.to_wei(20, 'gwei')
        })
        signed_tx = backend_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True
    except Exception as e:
        print("Solidity registration failed:", e)

    return jsonify({
        "message": "User registered",
        "blockchain_address": blockchain_address,
        "block_hash": block_hash,
        "on_chain": on_chain
    })


#------------------------------
# User Login 
#--------------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    hashed_pw = hash_password(password)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, hashed_pw))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        user["trust_score"] = calculate_trust_score(user["id"])
        print(user["id"])
        print(user["trust_score"])
        print(user["blockchain_address"])
        return jsonify({"message":"Login successful","user":user})
    else:
        return jsonify({"message":"Invalid credentials"}), 401
    

# -------------------------------
# PROJECT ROUTES
# -------------------------------
@app.route("/create_project", methods=["POST"])
def create_project():
    data = request.json
    name = data.get("name")
    borrower_id = data.get("borrower_id")

    if not name or not borrower_id:
        return jsonify({"message": "Project name and borrower ID required"}), 400

    # Insert project into MySQL
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO projects (name, borrower_id, total_funded, current_milestone) VALUES (%s,%s,%s,%s)",
        (name, borrower_id, 0, 0)
    )
    project_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    on_chain = False
    try:
        # Build transaction
        tx = contract_instance.functions.createProject(name).build_transaction({
            'from': backend_account.address,
            'nonce': w3.eth.get_transaction_count(backend_account.address),
            'gas': 3000000,
            'gasPrice': w3.to_wei(20, 'gwei')
        })

        # Sign transaction
        signed_tx = backend_account.sign_transaction(tx)
        print("Signed transaction ready:", signed_tx)

        # Send raw transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        print("Transaction sent, hash:", tx_hash.hex())

        # Wait for mining
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print("Transaction mined, receipt:", receipt)

        on_chain = True
    except Exception as e:
        print("Solidity project creation failed:", e)
        on_chain = False

    return jsonify({
    "message": "Project created",
    "project_id": project_id,
    "on_chain": on_chain,
    "tx_hash": tx_hash.hex() if on_chain else None  
})


#------------------------------
# Add  Milestone
#--------------------------------

@app.route("/add_milestone", methods=["POST"])
def add_milestone():
    data = request.json
    project_id = data.get("project_id")
    description = data.get("description")
    fund_amount = data.get("fund_amount")

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Insert milestone
    cursor.execute(
        "INSERT INTO milestones (project_id, description, fund_amount, approved) VALUES (%s,%s,%s,%s)",
        (project_id, description, fund_amount, False)
    )
    milestone_id = cursor.lastrowid
    
    # Update total_funded in projects table
    cursor.execute(
        "UPDATE projects SET total_funded = total_funded + %s WHERE id = %s",
        (fund_amount, project_id)
    )

    conn.commit()
    cursor.close()
    conn.close()

    # Add to blockchain
    block_data = {"project_id": project_id, "description": description, "fund_amount": fund_amount}
    new_block = blockchain.add_block(block_data)

    return jsonify({"message":"Milestone added","milestone_id":milestone_id,"block_hash":new_block.hash})


#------------------------------
# Fetch Milestones
#--------------------------------
@app.route("/get_pending_milestones", methods=["GET"])
def get_pending_milestones():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, project_id, description, fund_amount, approved 
        FROM milestones 
        WHERE approved = FALSE
    """)
    milestones = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify({"milestones": milestones})


#------------------------------
# Update Fund to Project
#--------------------------------

@app.route("/fund_project", methods=["POST"])
def fund_project():
    data = request.json
    project_id = data.get("project_id")
    investor_address = data.get("investor_address")
    amount = float(data.get("amount"))

    # Convert amount to Wei
    amount_wei = w3.toWei(amount, 'ether')

    # Check investor balance
    balance = w3.eth.get_balance(investor_address)
    if balance < amount_wei:
        return jsonify({"message": "Insufficient balance for funding"}), 400

    # Update project funding in MySQL
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE projects SET total_funded = total_funded + %s WHERE id=%s",
        (amount, project_id)
    )
    conn.commit()
    cursor.close()
    conn.close()

    # Send funds via Web3
    on_chain = False
    try:
        # Sign transaction with backend account
        tx = {
            'from': backend_account.address,
            'to': investor_address,  
            'value': amount_wei,
            'gas': 3000000,
            'gasPrice': w3.to_wei(20, 'gwei'),
            'nonce': w3.eth.get_transaction_count(backend_account.address)
        }

        signed_tx = backend_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True
    except Exception as e:
        print("Funding failed:", e)

    return jsonify({"message": "Project funded", "on_chain": on_chain})


#------------------------------
# Investoer Approve Milestone
#--------------------------------
@app.route("/approve_milestone", methods=["POST"])
def approve_milestone():
    data = request.json
    milestone_id = data.get("milestone_id")

    # Connect to DB
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Approve milestone in MySQL
    cursor.execute("UPDATE milestones SET approved = TRUE WHERE id=%s", (milestone_id,))
    conn.commit()

    # Get milestone details
    cursor.execute("SELECT project_id, fund_amount FROM milestones WHERE id=%s", (milestone_id,))
    milestone = cursor.fetchone()

    # Update project's current milestone
    cursor.execute(
        "UPDATE projects SET current_milestone = current_milestone + 1 WHERE id=%s",
        (milestone["project_id"],)
    )
    conn.commit()

    cursor.close()
    conn.close()

   
    block_data = {"milestone_id": milestone_id, "approved": True}
    new_block = blockchain.add_block(block_data)

    # Initialize transaction variables
    tx_hash = None
    on_chain = False

    # Send transaction to Solidity contract
    try:
        tx = contract_instance.functions.approveMilestone(
            milestone["project_id"], 0
        ).build_transaction({
            'from': backend_account.address,
            'nonce': w3.eth.get_transaction_count(backend_account.address),
            'gas': 3000000,
            'gasPrice': Web3.to_wei(20, 'gwei')
        })

        signed_tx = backend_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True
    except Exception as e:
        print("Fund release failed:", e)

    
    return jsonify({
        "message": "Milestone approved and project updated",
        "block_hash": new_block.hash,
        "on_chain": on_chain,
        "tx_hash": tx_hash.hex() if tx_hash else None
    })


# -------------------------------
# Driven Project Recommendations
# -------------------------------

@app.route("/recommend_projects/<int:user_id>", methods=["GET"])
def recommend_projects(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM projects ORDER BY total_funded ASC LIMIT 5")
    projects = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"recommendations": projects})


#------------------------------
# Barrower Projects
#--------------------------------
@app.route("/my_projects/<int:borrower_id>", methods=["GET"])
def my_projects(borrower_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM projects WHERE borrower_id=%s ORDER BY created_at DESC", (borrower_id,))
    projects = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"projects": projects})


#------------------------------
# Investor Investment Projects
#--------------------------------

@app.route("/investor_investments/<int:user_id>", methods=["GET"])
def investor_investments(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.id, p.name, p.borrower_id, p.total_funded, p.current_milestone,
               u.name AS borrower_name, l.amount AS funded_amount
        FROM projects p
        JOIN users u ON p.borrower_id = u.id
        JOIN loans l ON l.project_id = p.id
        WHERE l.lender_id = %s
    """, (user_id,))
    projects = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"projects": projects})


#------------------------------
# All Projects
#--------------------------------
@app.route("/investor/projects", methods=["GET"])
def get_all_projects():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
    SELECT p.id, p.name, p.borrower_id, p.total_funded, p.current_milestone,
           u.name as borrower_name
    FROM projects p
    LEFT JOIN users u ON p.borrower_id = u.id
""")

    projects = cursor.fetchall()
    print(projects)
    cursor.close()
    conn.close()
    return jsonify({"projects": projects})



# -------------------------------
# P2P LOANS
# -------------------------------
@app.route("/create_loan", methods=["POST"])
def create_loan():
    data = request.json
    borrower_id = data.get("borrower_id")
    lender_id = data.get("lender_id")
    project_id = data.get("project_id")
    amount = float(data.get("amount"))

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get blockchain addresses of borrower & lender
    cursor.execute("SELECT blockchain_address FROM users WHERE id=%s", (borrower_id,))
    borrower_row = cursor.fetchone()
    cursor.execute("SELECT blockchain_address FROM users WHERE id=%s", (lender_id,))
    lender_row = cursor.fetchone()
    if not borrower_row or not lender_row:
        return jsonify({"message": "Invalid borrower or lender ID"}), 400

    borrower_address = borrower_row["blockchain_address"]
    lender_address = lender_row["blockchain_address"]

    # Save to MySQL
    cursor.execute(
        "INSERT INTO loans (borrower_id, lender_id, project_id, amount, repaid) VALUES (%s,%s,%s,%s,%s)",
        (borrower_id, lender_id, project_id, amount, False)
    )
    loan_id = cursor.lastrowid
    conn.commit()

    # Blockchain transaction
    on_chain = False
    tx_hash = None
    try:
        amount_wei = int(amount * 1e18)  # Convert ETH to Wei
        tx = contract_instance.functions.createLoan(
            borrower_address,
            lender_address,
            project_id,
            amount_wei
        ).build_transaction({
            'from': backend_account.address,
            'nonce': w3.eth.get_transaction_count(backend_account.address),
            'gas': 3000000,
            'gasPrice': Web3.to_wei(20, 'gwei')
        })

        signed_tx = backend_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True

    except Exception as e:
        print("Solidity loan creation failed:", e)

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Loan created",
        "loan_id": loan_id,
        "on_chain": on_chain,
        "tx_hash": tx_hash.hex() if tx_hash else None
    })

#------------------------------
# Fetch loans
#--------------------------------
@app.route("/get_loans/<int:borrower_id>", methods=["GET"])
def get_loans(borrower_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    

    cursor.execute(
        "SELECT id, project_id, lender_id, amount, repaid "
        "FROM loans WHERE borrower_id=%s",
        (borrower_id,)
    )
    loans = cursor.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify({"loans": loans})


#------------------------------
# Repay Loan Barrower
#--------------------------------

@app.route("/repay_loan", methods=["POST"])
def repay_loan():
    data = request.json
    loan_id = data.get("loan_id")
    amount = data.get("amount")
    if amount is None:
        return jsonify({"message": "Amount is required"}), 400

    try:
       amount = float(amount)
    except ValueError:
           return jsonify({"message": "Invalid amount"}), 400


    # ------------------- DB part -------------------
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, borrower_id, lender_id, amount, repaid FROM loans WHERE id=%s", 
        (loan_id,)
    )
    loan = cursor.fetchone()

    if not loan:
        cursor.close()
        conn.close()
        return jsonify({"message":"Loan not found"}), 404

    if loan["repaid"]:
        cursor.close()
        conn.close()
        return jsonify({"message":"Loan already repaid"}), 400

    # Check if amount matches loan
    if amount != float(loan["amount"]):
        cursor.close()
        conn.close()
        return jsonify({"message":"Repayment amount does not match loan amount"}), 400

    # Mark as repaid in DB
    cursor.execute("UPDATE loans SET repaid = TRUE WHERE id=%s", (loan_id,))
    conn.commit()
    cursor.close()
    conn.close()

    # ---------------- Blockchain part ----------------
    on_chain = False
    tx_hash = None

    try:
        # Convert amount to Wei
        amount_wei = int(amount * 10**18)

        # Build transaction
        tx = contract_instance.functions.repayLoan(loan_id).build_transaction({
            'from': backend_account.address,
            'value': amount_wei,
            'nonce': w3.eth.get_transaction_count(backend_account.address),
            'gas': 300000,
            'gasPrice': w3.to_wei(20, 'gwei')
        })

        # Sign transaction
        signed_tx = backend_account.sign_transaction(tx)

        
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True

    except Exception as e:
        print("Blockchain repayment failed:", e)

    return jsonify({
        "message": "Loan repaid successfully",
        "loan_id": loan_id,
        "on_chain": on_chain,
        "tx_hash": tx_hash.hex() if tx_hash else None
    })


# -------------------------------
# RUN FLASK
# -------------------------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)
