const express = require('express');
const User = require('../schema/userschema');

const apiRouter = express.Router();

apiRouter.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).lean(),
      User.countDocuments()
    ]);

    res.json({ users, total, page, limit });
  } catch (err) {
    console.error('Error GET /users:', err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/users/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).lean();

    res.json({ users, total: users.length });
  } catch (err) {
    console.error('Error GET /users/search:', err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    console.error('Error GET /users/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/users', async (req, res) => {
  try {
    const saved = await new User(req.body).save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error POST /users:', err);
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/users/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error PUT /users/:id:', err);
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, message: `User ${deleted.name} deleted` });
  } catch (err) {
    console.error('Error DELETE /users/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = apiRouter;