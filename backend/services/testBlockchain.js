const blockchainService = require("./blockchainService");

async function runTest() {
    console.log("🚀 Starting Blockchain Integration Test...");

    // 1. Fake Data
    const fakeId = 999;
    const fakeHash = "test_hash_123";
    const fakeExpiry = "2025-12-30";

    try {
        console.log(`\nAttempting to issue Prescription #${fakeId}...`);
        
        // 2. Call the function we wrote in blockchainService.js
        const txHash = await blockchainService.issuePrescriptionOnChain(fakeId, fakeHash, fakeExpiry);
        
        console.log("✅ SUCCESS! Transaction confirmed.");
        console.log(`   Tx Hash: ${txHash}`);
        
        // 3. Verify it instantly
        console.log("\nVerifying data on-chain...");
        const verification = await blockchainService.verifyPrescription(fakeId, fakeHash);
        
        if (verification.isValid) {
            console.log("✅ VERIFICATION PASSED: The blockchain remembers our data.");
        } else {
            console.error("❌ VERIFICATION FAILED:", verification.reason);
        }

    } catch (error) {
        console.error("❌ TEST CRASHED:", error);
    }
}

runTest();