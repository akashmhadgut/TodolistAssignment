const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

const { body, validationResult } = require('express-validator');

function formatValidationErrors(errors) {
  return errors.array().map(e => ({ field: e.param, message: e.msg }));
}

// Create task
router.post('/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
    body('description').optional().isString().withMessage('Description must be a string')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: formatValidationErrors(errors) });
    }
    try {
      const { title, description } = req.body;
      const task = new Task({ user: req.user.id, title, description });
      await task.save();
      res.json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get tasks with optional search
router.get('/', auth, async (req, res) => {
  try {
    const q = req.query.q || '';
    const filter = { user: req.user.id };
    if (q) filter.title = { $regex: q, $options: 'i' };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Not found' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id',
  auth,
  [
    body('title').optional().isString().isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('completed').optional().isBoolean().withMessage('Completed must be boolean')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: formatValidationErrors(errors) });
    }
    try {
      const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
      if (!task) return res.status(404).json({ message: 'Not found' });
      const { title, description, completed } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (completed !== undefined) task.completed = completed;
      await task.save();
      res.json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
