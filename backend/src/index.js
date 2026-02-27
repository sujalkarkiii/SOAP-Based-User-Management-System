require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
const soap       = require('soap');
const fs         = require('fs');
const path       = require('path');
const http       = require('http');
const bodyParser = require('body-parser');

const userService = require('./service/service');
const User        = require('./schema/userschema');

const app  = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/soap_mern';

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(bodyParser.raw({ type: 'text/xml', limit: '5mb' }));
app.use(bodyParser.text({ type: 'text/xml', limit: '5mb' }));
app.use(express.json());

// ─── REST API ─────────────────────────────────────────────────────────────────
const proxyRouter = express.Router();

proxyRouter.get('/users', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(limit).lean();
    const total = await User.countDocuments();
    res.json({ users, total, page, limit });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

proxyRouter.get('/users/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const users = await User.find({
      $or: [
        { name:  { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).lean();
    res.json({ users, total: users.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

proxyRouter.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

proxyRouter.post('/users', async (req, res) => {
  try {
    const saved = await new User(req.body).save();
    res.status(201).json(saved);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

proxyRouter.put('/users/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

proxyRouter.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, message: `User ${deleted.name} deleted` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.use('/api', proxyRouter);

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SOAP MERN Server',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ─── WSDL ─────────────────────────────────────────────────────────────────────
app.get('/soap', (req, res, next) => {
  if (req.query.wsdl !== undefined) {
    const wsdl = fs.readFileSync(path.join(__dirname, 'user.wsdl'), 'utf8');
    res.set('Content-Type', 'text/xml');
    return res.send(wsdl);
  }
  next();
});

// ─── Explicit OPTIONS handler for SOAP ────────────────────────────────────────
app.options('/soap', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, SOAPAction, Authorization');
  res.sendStatus(200);
});

// ─── Start ────────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGO_URI);

    const server = http.createServer();

    const wsdl = fs.readFileSync(path.join(__dirname, 'user.wsdl'), 'utf8');
    soap.listen(server, '/soap', userService, wsdl);

    const listeners = server.listeners('request').slice();
    server.removeAllListeners('request');

    server.on('request', (req, res) => {
      if (req.url.startsWith('/soap')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, SOAPAction, Authorization');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        listeners.forEach(l => l.call(server, req, res));
        return;
      }

      app(req, res);
    });

    server.listen(PORT, () => {
      console.log(`🚀 Server running   → http://localhost:${PORT}`);
      console.log(`🧼 SOAP service     → http://localhost:${PORT}/soap`);
      console.log(`📄 WSDL             → http://localhost:${PORT}/soap?wsdl`);
      console.log(`🌐 REST API         → http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
