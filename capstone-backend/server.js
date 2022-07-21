const https = require('https');
const fs = require('fs');
const app = require("./app")

const PORT = process.env.port || 3001

const options = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem'),
};

https.createServer(options, app).listen(PORT);