from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3
import mysql.connector
from contracts import Blockchain, CONTRACTS_DIR
import hashlib
import json

# -------------------------------
# CONFIG
# -------------------------------
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "crowdfund_db"
}

GANACHE_URL = "http://127.0.0.1:8545"
BACKEND_PRIVATE_KEY = "0xf56b1e196098fe50040616cbe1df406c348d024c9d002f50d3211f22c5a32277"
CONTRACT_ADDRESS = "0x0bF93B7A224Aa365c06aDF81Ebdb1C43CC7b1272"

# -------------------------------
# LOAD CONTRACT ABI
# -------------------------------
with open(f"{CONTRACTS_DIR}/contract_abi.json", "r") as f:
    CONTRACT_ABI = json.load(f)

# -------------------------------
# FLASK SETUP
# -------------------------------
app = Flask(__name__)
CORS(app)

# -------------------------------
# DATABASE CONNECTION
# -------------------------------
def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

# -------------------------------
# PYTHON BLOCKCHAIN
# -------------------------------
blockchain = Blockchain()

# -------------------------------
# WEB3 + SOLIDITY CONTRACT
# -------------------------------
w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
if not w3.is_connected:
    raise Exception("Cannot connect to Ganache")

backend_account = w3.eth.account.from_key(BACKEND_PRIVATE_KEY)
contract_instance = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

# -------------------------------
# USER AUTHENTICATION
# -------------------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    number = data.get("number")
    password = data.get("password")
    role = data.get("role")  # borrower / investor
    blockchain_address = data.get("address")

    hashed_pw = hashlib.sha256(password.encode()).hexdigest()

    # Add user block
    block_data = {"name": name, "email": email, "number": number, "address": blockchain_address, "role": role}
    new_block = blockchain.add_block(block_data)
    block_hash = new_block.hash

    # Save in MySQL
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (name, email, number, password, role, blockchain_address, block_hash)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (name,email,number,hashed_pw,role,blockchain_address,block_hash))
    conn.commit()
    cursor.close()
    conn.close()

    # Register user on Solidity contract
    try:
        tx = contract_instance.functions.registerUser(blockchain_address, name).build_transaction({
            'from': backend_account.address,
            'nonce': w3.eth.get_transaction_count(backend_account.address),
            'gas': 3000000,
            'gasPrice': w3.toWei('20', 'gwei')
        })
        signed_tx = backend_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True
    except Exception as e:
        print("Solidity registration failed:", e)
        on_chain = False

    return jsonify({"message":"User registered","block_hash":block_hash,"on_chain":on_chain})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    hashed_pw = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, hashed_pw))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        return jsonify({"message":"Login successful","user":user})
    else:
        return jsonify({"message":"Invalid credentials"}), 401

# -------------------------------
# PROJECTS
# -------------------------------
@app.route("/create_project", methods=["POST"])
def create_project():
    data = request.json
    name = data.get("name")
    borrower_id = data.get("borrower_id")

    # Save project in MySQL
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO projects (name, borrower_id, total_funded, current_milestone) VALUES (%s,%s,%s,%s)",
                   (name, borrower_id, 0, 0))
    project_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    # Solidity contract
    try:
        tx = contract_instance.functions.createProject(name).build_transaction({
            'from': backend_account.address,
            'nonce': w3.eth.get_transaction_count(backend_account.address),
            'gas': 3000000,
            'gasPrice': w3.toWei('20','gwei')
        })
        signed_tx = backend_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True
    except Exception as e:
        print("Solidity project creation failed:", e)
        on_chain = False

    return jsonify({"message":"Project created","project_id":project_id,"on_chain":on_chain})

# -------------------------------
# MILESTONES
# -------------------------------
@app.route("/add_milestone", methods=["POST"])
def add_milestone():
    data = request.json
    project_id = data.get("project_id")
    description = data.get("description")
    fund_amount = data.get("fund_amount")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO milestones (project_id, description, fund_amount, approved) VALUES (%s,%s,%s,%s)",
                   (project_id, description, fund_amount, False))
    milestone_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    # Add block
    block_data = {"project_id": project_id, "description": description, "fund_amount": fund_amount}
    new_block = blockchain.add_block(block_data)

    return jsonify({"message":"Milestone added","milestone_id":milestone_id,"block_hash":new_block.hash})

# -------------------------------
# FUND PROJECT
# -------------------------------
@app.route("/fund_project", methods=["POST"])
def fund_project():
    data = request.json
    project_id = data.get("project_id")
    investor_address = data.get("investor_address")
    amount = data.get("amount")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE projects SET total_funded = total_funded + %s WHERE id=%s", (amount, project_id))
    conn.commit()
    cursor.close()
    conn.close()

    try:
        tx = contract_instance.functions.fundProject(project_id).build_transaction({
            'from': investor_address,
            'value': w3.toWei(amount,'ether'),
            'nonce': w3.eth.get_transaction_count(investor_address),
            'gas': 3000000,
            'gasPrice': w3.toWei('20','gwei')
        })
        # For simplicity, assuming investor_address is unlocked in Ganache
        tx_hash = w3.eth.send_transaction(tx)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True
    except Exception as e:
        print("Funding failed:", e)
        on_chain = False

    return jsonify({"message":"Project funded","on_chain":on_chain})

# -------------------------------
# APPROVE MILESTONE
# -------------------------------
@app.route("/approve_milestone", methods=["POST"])
def approve_milestone():
    data = request.json
    milestone_id = data.get("milestone_id")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE milestones SET approved = TRUE WHERE id=%s", (milestone_id,))
    conn.commit()
    cursor.close()
    conn.close()

    block_data = {"milestone_id": milestone_id, "approved": True}
    new_block = blockchain.add_block(block_data)

    return jsonify({"message":"Milestone approved","block_hash":new_block.hash})

# -------------------------------
# RUN FLASK
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3
import mysql.connector
from contracts import Blockchain, CONTRACTS_DIR
import hashlib
import json

# -------------------------------
# CONFIG
# -------------------------------
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "crowdfund_db"
}

GANACHE_URL = "http://127.0.0.1:8545"
BACKEND_PRIVATE_KEY = "0xf56b1e196098fe50040616cbe1df406c348d024c9d002f50d3211f22c5a32277"
CONTRACT_ADDRESS = "0x0bF93B7A224Aa365c06aDF81Ebdb1C43CC7b1272"

# -------------------------------
# LOAD CONTRACT ABI
# -------------------------------
with open(f"{CONTRACTS_DIR}/contract_abi.json", "r") as f:
    CONTRACT_ABI = json.load(f)

# -------------------------------
# FLASK SETUP
# -------------------------------
app = Flask(__name__)
CORS(app)

# -------------------------------
# DATABASE CONNECTION
# -------------------------------
def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)

# -------------------------------
# PYTHON BLOCKCHAIN
# -------------------------------
blockchain = Blockchain()

# -------------------------------
# WEB3 + SOLIDITY CONTRACT
# -------------------------------
w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
if not w3.is_connected:
    raise Exception("Cannot connect to Ganache")

backend_account = w3.eth.account.from_key(BACKEND_PRIVATE_KEY)
contract_instance = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)


#-------------------------------
# Api checking
#--------------------------------
@app.route("/", methods=["GET", "POST"])
def index():
    return jsonify({"message": "API is running"})

# -------------------------------
# USER AUTHENTICATION
# -------------------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    number = data.get("number")
    password = data.get("password")
    role = data.get("role")  # borrower / investor
    blockchain_address = data.get("address")

    hashed_pw = hashlib.sha256(password.encode()).hexdigest()

    # Add user block
    block_data = {"name": name, "email": email, "number": number, "address": blockchain_address, "role": role}
    new_block = blockchain.add_block(block_data)
    block_hash = new_block.hash

    # Save in MySQL
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (name, email, number, password, role, blockchain_address, block_hash)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (name,email,number,hashed_pw,role,blockchain_address,block_hash))
    conn.commit()
    cursor.close()
    conn.close()

    # Register user on Solidity contract
    try:
        tx = contract_instance.functions.registerUser(blockchain_address, name).build_transaction({
            'from': backend_account.address,
            'nonce': w3.eth.get_transaction_count(backend_account.address),
            'gas': 3000000,
            'gasPrice': w3.toWei('20', 'gwei')
        })
        signed_tx = backend_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True
    except Exception as e:
        print("Solidity registration failed:", e)
        on_chain = False

    return jsonify({"message":"User registered","block_hash":block_hash,"on_chain":on_chain})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    hashed_pw = hashlib.sha256(password.encode()).hexdigest()

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, hashed_pw))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        return jsonify({"message":"Login successful","user":user})
    else:
        return jsonify({"message":"Invalid credentials"}), 401

# -------------------------------
# PROJECTS
# -------------------------------
@app.route("/create_project", methods=["POST"])
def create_project():
    data = request.json
    name = data.get("name")
    borrower_id = data.get("borrower_id")

    # Save project in MySQL
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO projects (name, borrower_id, total_funded, current_milestone) VALUES (%s,%s,%s,%s)",
                   (name, borrower_id, 0, 0))
    project_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    # Solidity contract
    try:
        tx = contract_instance.functions.createProject(name).build_transaction({
            'from': backend_account.address,
            'nonce': w3.eth.get_transaction_count(backend_account.address),
            'gas': 3000000,
            'gasPrice': w3.toWei('20','gwei')
        })
        signed_tx = backend_account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True
    except Exception as e:
        print("Solidity project creation failed:", e)
        on_chain = False

    return jsonify({"message":"Project created","project_id":project_id,"on_chain":on_chain})

# -------------------------------
# MILESTONES
# -------------------------------
@app.route("/add_milestone", methods=["POST"])
def add_milestone():
    data = request.json
    project_id = data.get("project_id")
    description = data.get("description")
    fund_amount = data.get("fund_amount")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO milestones (project_id, description, fund_amount, approved) VALUES (%s,%s,%s,%s)",
                   (project_id, description, fund_amount, False))
    milestone_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    # Add block
    block_data = {"project_id": project_id, "description": description, "fund_amount": fund_amount}
    new_block = blockchain.add_block(block_data)

    return jsonify({"message":"Milestone added","milestone_id":milestone_id,"block_hash":new_block.hash})

# -------------------------------
# FUND PROJECT
# -------------------------------
@app.route("/fund_project", methods=["POST"])
def fund_project():
    data = request.json
    project_id = data.get("project_id")
    investor_address = data.get("investor_address")
    amount = data.get("amount")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE projects SET total_funded = total_funded + %s WHERE id=%s", (amount, project_id))
    conn.commit()
    cursor.close()
    conn.close()

    try:
        tx = contract_instance.functions.fundProject(project_id).build_transaction({
            'from': investor_address,
            'value': w3.toWei(amount,'ether'),
            'nonce': w3.eth.get_transaction_count(investor_address),
            'gas': 3000000,
            'gasPrice': w3.toWei('20','gwei')
        })
        # For simplicity, assuming investor_address is unlocked in Ganache
        tx_hash = w3.eth.send_transaction(tx)
        w3.eth.wait_for_transaction_receipt(tx_hash)
        on_chain = True
    except Exception as e:
        print("Funding failed:", e)
        on_chain = False

    return jsonify({"message":"Project funded","on_chain":on_chain})

# -------------------------------
# APPROVE MILESTONE
# -------------------------------
@app.route("/approve_milestone", methods=["POST"])
def approve_milestone():
    data = request.json
    milestone_id = data.get("milestone_id")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE milestones SET approved = TRUE WHERE id=%s", (milestone_id,))
    conn.commit()
    cursor.close()
    conn.close()

    block_data = {"milestone_id": milestone_id, "approved": True}
    new_block = blockchain.add_block(block_data)

    return jsonify({"message":"Milestone approved","block_hash":new_block.hash})

# -------------------------------
# RUN FLASK
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
