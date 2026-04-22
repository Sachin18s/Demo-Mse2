const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// @route   GET /api/expenses
// @desc    Get all expenses for a user (with optional category filter)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = { userId: req.user._id };
    
    // Optional category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/expenses
// @desc    Add a new expense
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount,
      category,
      date: date || Date.now()
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure the logged in user matches the expense user
    if (expense.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await expense.deleteOne();

    res.json({ id: req.params.id, message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
