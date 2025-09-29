import os
import json
import hashlib
import time
from solcx import compile_standard, install_solc
from web3 import Web3

# -------------------------------
# CONFIGURATION
# -------------------------------
CONTRACTS_DIR = "contracts"
GANACHE_URL = "http://127.0.0.1:8545"  # Ganache RPC URL
install_solc("0.8.20") 

# -------------------------------
# ENSURE CONTRACTS FOLDER EXISTS
# -------------------------------
if not os.path.exists(CONTRACTS_DIR):
    os.makedirs(CONTRACTS_DIR)

# -------------------------------
# PYTHON BLOCKCHAIN SIMULATION
# -------------------------------
class Block:
    def __init__(self, index, timestamp, data, previous_hash, hash=None):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = hash or self.compute_hash()

    def compute_hash(self):
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def save(self):
        filename = f"{CONTRACTS_DIR}/block_{self.index}.json"
        with open(filename, "w") as f:
            json.dump({
                "index": self.index,
                "timestamp": self.timestamp,
                "data": self.data,
                "previous_hash": self.previous_hash,
                "hash": self.hash
            }, f, indent=4)

class Blockchain:
    def __init__(self):
        self.chain = []
        self.load_chain()

    def load_chain(self):
        files = sorted(os.listdir(CONTRACTS_DIR))
        for file in files:
            if file.endswith(".json") and file.startswith("block_"):
                with open(f"{CONTRACTS_DIR}/{file}", "r") as f:
                    block_data = json.load(f)
                    self.chain.append(Block(**block_data))
        if not self.chain:
            self.create_genesis_block()

    def create_genesis_block(self):
        genesis_block = Block(0, time.time(), {"message": "Genesis Block"}, "0")
        genesis_block.save()
        self.chain.append(genesis_block)

    def get_last_block(self):
        return self.chain[-1]

    def add_block(self, data):
        last_block = self.get_last_block()
        new_block = Block(
            index=last_block.index + 1,
            timestamp=time.time(),
            data=data,
            previous_hash=last_block.hash
        )
        new_block.save()
        self.chain.append(new_block)
        return new_block

# -------------------------------
# SOLIDITY CONTRACT DEPLOYMENT
# -------------------------------
def compile_and_deploy_solidity():
    sol_file_path = f"{CONTRACTS_DIR}/MicroLendingPlatform.sol"

    if not os.path.exists(sol_file_path):
        raise FileNotFoundError(f"{sol_file_path} not found. Add your Solidity contract.")

    with open(sol_file_path, "r") as file:
        contract_source_code = file.read()

    # Compile contract
    compiled_sol = compile_standard({
        "language": "Solidity",
        "sources": {"MicroLendingPlatform.sol": {"content": contract_source_code}},
        "settings": {"outputSelection": {"*": {"*": ["abi", "metadata", "evm.bytecode"]}}}
    }, solc_version="0.8.20")

    # Get bytecode and ABI
    contract_data = compiled_sol['contracts']['MicroLendingPlatform.sol']['MicroLendingPlatform']
    bytecode = contract_data['evm']['bytecode']['object']
    abi = contract_data['abi']

    # Save ABI to JSON for later use in app.py
    with open(f"{CONTRACTS_DIR}/contract_abi.json", "w") as f:
        json.dump(abi, f, indent=4)

    # Connect to Ganache
    w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
    if not w3.is_connected:
        raise ConnectionError("Cannot connect to Ganache on port 8545")

    # Set default account
    w3.eth.default_account = w3.eth.accounts[0]

    # Deploy contract
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    tx_hash = contract.constructor().transact()
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    print(f"Contract deployed at address: {tx_receipt.contractAddress}")
    return contract, abi, tx_receipt.contractAddress

# -------------------------------
# MAIN
# -------------------------------
if __name__ == "__main__":
    # Initialize Python blockchain
    blockchain = Blockchain()
    blockchain.add_block({"borrower": "Alice", "milestone": "Design Phase", "fund": 100})
    blockchain.add_block({"borrower": "Alice", "milestone": "Development Phase", "fund": 200})
    print("JSON blocks created in contracts/ folder")

    # Compile and deploy Solidity contract on Ganache
    contract, abi, address = compile_and_deploy_solidity()
