require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const bodyParser = require('body-parser');

const apiRouter = require('./Routes/restrouting');
const setupSoap = require('./Routes/soaprouting');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/soap_mern';

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'SOAPAction'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/xml' }));
app.use(bodyParser.raw({ type: 'text/xml' }));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});


app.use('/api', apiRouter);


app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SOAP MERN Server',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});


mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGO_URI);

    const server = http.createServer(app);
    setupSoap(server, app);

    server.listen(PORT, () => {
      console.log(` Server running  -> http://localhost:${PORT}`);
      console.log(` SOAP service    -> http://localhost:${PORT}/soap`);
      console.log(` WSDL            -> http://localhost:${PORT}/soap?wsdl`);
      console.log(` REST API        -> http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });