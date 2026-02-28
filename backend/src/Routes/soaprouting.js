const soap = require('soap');
const fs = require('fs');
const path = require('path');
const userService = require('../service/service');

/**
 * Registers the SOAP service on the given HTTP server and Express app.
 * @param {import('http').Server} server - The raw HTTP server instance
 * @param {import('express').Application} app - The Express app
 */
function setupSoap(server, app) {
  const wsdl = fs.readFileSync(path.join(__dirname, '..', 'user.wsdl'), 'utf8');
  const soapPath = '/soap';

  // Handle SOAP preflight
  app.options(soapPath, (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');
    res.sendStatus(200);
  });

  // Attach CORS headers to SOAP POST responses
  app.post(soapPath, (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, SOAPAction');
    next();
  });

  soap.listen(server, soapPath, userService, wsdl);
}

module.exports = setupSoap;