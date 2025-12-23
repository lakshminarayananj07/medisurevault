// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MediSure {
    
    struct Prescription {
        uint256 id;
        string dataHash;      // The "Fingerprint" of the data
        uint256 expiryDate;   // When access expires
        address doctor;       // Doctor who issued it
        bool exists;
    }

    struct DispenseRecord {
        uint256 timestamp;
        address pharmacist;
        string note;
    }

    // Storage
    mapping(uint256 => Prescription) public prescriptions;
    
    // This stores the HISTORY of every time medicine was dispensed for a specific ID
    mapping(uint256 => DispenseRecord[]) public dispenseHistory;

    // Events
    event PrescriptionIssued(uint256 indexed id, address indexed doctor);
    event MedicineDispensed(uint256 indexed id, address indexed pharmacist, uint256 timestamp);

    // 1. DOCTOR: Issue a new prescription
    function issuePrescription(uint256 _id, string memory _hash, uint256 _expiryDate) public {
        require(!prescriptions[_id].exists, "Prescription ID already exists");
        
        prescriptions[_id] = Prescription({
            id: _id,
            dataHash: _hash,
            expiryDate: _expiryDate,
            doctor: msg.sender,
            exists: true
        });

        emit PrescriptionIssued(_id, msg.sender);
    }

    // 2. PHARMACIST: Verify Integrity & Expiry
    // This checks if the Rx is valid. It DOES NOT check if it was used before (allowing re-use).
    function verifyPrescription(uint256 _id, string memory _currentHash) public view returns (bool isValid, string memory reason) {
        if (!prescriptions[_id].exists) {
            return (false, "Not Found");
        }

        // Check 1: Expiry Date
        if (block.timestamp > prescriptions[_id].expiryDate) {
            return (false, "Expired");
        }

        // Check 2: Data Integrity (Hash Match)
        if (keccak256(bytes(prescriptions[_id].dataHash)) != keccak256(bytes(_currentHash))) {
            return (false, "Tampered (Hash Mismatch)");
        }

        return (true, "Valid");
    }

    // 3. PHARMACIST: Dispense & Log
    // This records the transaction but does NOT lock the prescription.
    function dispenseMedicine(uint256 _id, string memory _note) public {
        require(prescriptions[_id].exists, "Prescription does not exist");
        require(block.timestamp <= prescriptions[_id].expiryDate, "Prescription is Expired");

        // Log the transaction permanently into the history array
        dispenseHistory[_id].push(DispenseRecord({
            timestamp: block.timestamp,
            pharmacist: msg.sender,
            note: _note
        }));

        emit MedicineDispensed(_id, msg.sender, block.timestamp);
    }
    
    // Helper: Get History (Useful if you want to show "Previous Dispenses" on the dashboard)
    function getDispenseHistory(uint256 _id) public view returns (DispenseRecord[] memory) {
        return dispenseHistory[_id];
    }
}