require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

const User = require('./schema/userschema'); // Your Mongoose schema
const userService = require('./service/service'); // Your SOAP service implementation

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/soap_mern';

// ── Middleware ───────────────────────────────
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'SOAPAction'],
  credentials: true
}));

// Parse JSON and XML bodies
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/xml'}));
app.use(bodyParser.raw({ type: 'text/xml'}));

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// ── REST API ───────────────────────────────
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

app.use('/api', apiRouter);

// ── Health Check ─────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SOAP MERN Server',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ── Start Server + SOAP ──────────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGO_URI);

    const wsdl = fs.readFileSync(path.join(__dirname, 'user.wsdl'), 'utf8');
    const soapPath = '/soap';

    // Handle SOAP preflight manually
    app.options(soapPath, (req, res) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');
      res.sendStatus(200);
    });

    // Handle SOAP POST manually
    app.post(soapPath, (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');
      next();
    });

    const server = http.createServer(app);
    soap.listen(server, soapPath, userService, wsdl);

    server.listen(PORT, () => {
      console.log(`🚀 Server running → http://localhost:${PORT}`);
      console.log(`🧼 SOAP service → http://localhost:${PORT}${soapPath}`);
      console.log(`📄 WSDL → http://localhost:${PORT}${soapPath}?wsdl`);
      console.log(`🌐 REST API → http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  })
