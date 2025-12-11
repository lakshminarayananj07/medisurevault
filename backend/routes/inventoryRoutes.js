const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem'); // Import the model from Step 1

// 1. GET ALL ITEMS (For a specific pharmacist)
router.get('/:pharmacistId', async (req, res) => {
  try {
    const items = await InventoryItem.find({ pharmacistId: req.params.pharmacistId });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching inventory", error });
  }
});

// 2. ADD NEW ITEM
router.post('/add', async (req, res) => {
  try {
    // req.body contains the data sent from your React form
    const newItem = new InventoryItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Failed to add item", error });
  }
});

// 3. UPDATE ITEM
router.put('/update/:id', async (req, res) => {
  try {
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // Return the updated document
    );
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to update item", error });
  }
});

// 4. DELETE ITEM
router.delete('/delete/:id', async (req, res) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item", error });
  }
});

module.exports = router;