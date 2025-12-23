const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// 1. Load the ABI (The instructions on how to talk to the contract)
// We use 'path.resolve' to make sure we find the file correctly from the root
const artifactPath = path.resolve(__dirname, "../../artifacts/contracts/MediSure.sol/MediSure.json");
const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

// 2. CONFIGURATION
// ------------------------------------------------------------------
// PASTE YOUR TERMINAL 2 ADDRESS BELOW vvv
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
// ------------------------------------------------------------------

const LOCAL_RPC_URL = "http://127.0.0.1:8545";

// 3. Connect to the Local Blockchain
const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);

// 4. Setup the "Wallet" (The Doctor/System Admin)
// This is Account #0 from the 'npx hardhat node' list. 
// It has 10,000 fake ETH to pay for transaction fees.
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; 
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 5. Create the Contract Instance
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractArtifact.abi, wallet);

const blockchainService = {
    // FUNCTION 1: Add Prescription to Blockchain
    async issuePrescriptionOnChain(id, dataHash, expiryDateString) {
        try {
            console.log(`[Blockchain] Attempting to issue Rx ID: ${id}...`);
            
            // Convert Date to Unix Timestamp (seconds)
            const expiryTimestamp = Math.floor(new Date(expiryDateString).getTime() / 1000);
            
            // Send the transaction
            const tx = await contract.issuePrescription(id, dataHash, expiryTimestamp);
            
            // Wait for it to be "mined" (confirmed)
            await tx.wait(); 
            
            console.log(`[Blockchain] Success! Tx Hash: ${tx.hash}`);
            return tx.hash;
        } catch (error) {
            console.error("[Blockchain Error]", error);
            throw error;
        }
    },

    // FUNCTION 2: Check if Prescription is Valid
    async verifyPrescription(id, currentHash) {
        try {
            const [isValid, reason] = await contract.verifyPrescription(id, currentHash);
            return { isValid, reason };
        } catch (error) {
            console.error("[Blockchain Verify Error]", error);
            return { isValid: false, reason: "Blockchain Connection Failed" };
        }
    },

    // FUNCTION 3: Dispense Medicine (Write to Blockchain)
    async dispensePrescriptionOnChain(id, note = "Dispensed by Pharmacist") {
        try {
            console.log(`[Blockchain] Dispensing Rx ID: ${id}...`);
            
            // Call the Smart Contract function
            const tx = await contract.dispenseMedicine(id, note);
            
            // Wait for confirmation
            await tx.wait();
            
            console.log(`[Blockchain] Rx #${id} marked as dispensed! Tx: ${tx.hash}`);
            return tx.hash;
        } catch (error) {
            // Check if error is because it's already dispensed
            // Note: Error messages depend on how Hardhat returns the revert reason
            const errorMessage = error.message || "";
            
            if (errorMessage.includes("Already Dispensed")) {
                throw new Error("This prescription has ALREADY been used.");
            }
            if (errorMessage.includes("Expired")) {
                throw new Error("This prescription is EXPIRED.");
            }
            if (errorMessage.includes("Hash Mismatch")) {
                throw new Error("Invalid Prescription Data (Hash Mismatch).");
            }

            console.error("[Blockchain Dispense Error]", error);
            throw error;
        }
    }
};

module.exports = blockchainService;