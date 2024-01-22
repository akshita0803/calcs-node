const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const leadSchema = require('./schemas/leadSchema.json');
const cors = require('cors');
app.use(bodyParser.json());
const crypto = require('crypto');
const CryptoJS = require('crypto-js')


//npm install cors


const dataFilePath = path.join(__dirname,  '/data/leadData.json');

const allowedOrigins = ['http://localhost:8090'];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

// Enable CORS with options
app.use(cors(corsOptions));


// HMAC Middleware
// app.use((req, res, next) => {
//   // console.log(req.get('X-Signature'));
  
//   // Ensure the 'x-signature' header is present in the request
//   const receivedSignature = req.get('X-Signature');
//   const timestamp = req.get('X-Timestamp');
//   console.log(receivedSignature);
//   console.log("bodyyrecvd",req.body);
//   if (!receivedSignature) {
//     return res.status(400).json({ error: 'Signature missing' });
//   }
//   else{
    
    
    
//     // Generate HMAC from the request body using the secret key
    
//     const message = `${timestamp}.${JSON.stringify(req.body)}`;
//     const hmac = crypto.createHmac('sha256', secretKey)
//     const calculatedSignature = hmac.update(message).digest('hex');
//     console.log("calculatedSignature : ", calculatedSignature);
    
//     // Compare the calculated HMAC with the received signature
//     if (receivedSignature !== calculatedSignature) {
//       return res.status(401).json({ error: 'Invalid signature' });
//     }
    
//     // Continue to the next middleware
//     next();
//   }
// });
/////////////////////////////////////////////////


// HMAC Middleware 2
app.use((req, res, next) => {
  // console.log(req.get('X-Signature'));
  
  // Ensure the 'x-signature' header is present in the request
  console.log(req.body);
  const receivedSignature = req.get('X-Signature');
  const timestamp = req.get('X-Timestamp');

  if (!receivedSignature) {
    return res.status(400).json({ error: 'Signature missing' });
  }
  else{
    
    
    
    // Generate HMAC from the request body using the secret key
    
    const message = `${timestamp}.${JSON.stringify(req.body)}`;
     const hmacResult = CryptoJS.HmacSHA256(message, xswedcvfr);
   const calculatedSignature = CryptoJS.enc.Hex.stringify(hmacResult);

    console.log("calculatedSignature : ", calculatedSignature);
    
    // Compare the calculated HMAC with the received signature
    if (receivedSignature !== calculatedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Continue to the next middleware
    next();
  }
});







function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}
function readData() {
  return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
}


app.post('/', (req, res) => {
  // Access the request body data
  // console.log("Received Headers:", req.headers);
  // console.log(req.body);
  const requestData = req.body;
  const users = readData();
  const newUser = {
      id: Date.now(),
      Name: req.body.Name,
      Phone: req.body.Phone,
  };

  users.push(newUser);
  writeData(users);




  // Send a response back to the client
  res.json({ message: 'Data received successfully', data: requestData });
});


app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
