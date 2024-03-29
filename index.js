const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 5000;
const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const axios = require("axios");
const addFormats = require("ajv-formats");
const leadSchema = require("./schemas/leadSchema.json");
const cors = require("cors");
const CryptoJS = require("crypto-js");
app.use(bodyParser.json());

//ac
const crypto = require("crypto");

const dataFilePath = path.join(__dirname, "/data/leadData.json");

// Allow requests from any origin
const corsOptions = {
  origin: "http://localhost:3002",
};

// Enable CORS with options
app.use(cors(corsOptions));
// const xswedcvfr = '1234';

//ac

// HMAC Middleware 2
app.use((req, res, next) => {
  // console.log(req.get('X-Signature'));

  // Ensure the 'x-signature' header is present in the request
  // console.log(req.body);
  const xswedcvfr = "1234";
  const receivedSignature = req.get("X-Signature");
  const timestamp = req.get("X-Timestamp");

  if (!receivedSignature) {
    return res.status(400).json({ error: "Signature missing" });
  } else {
    // Generate HMAC from the request body using the secret key

    const message = `${timestamp}.${JSON.stringify(req.body)}`;
    const hmacResult = CryptoJS.HmacSHA256(message, xswedcvfr);
    const calculatedSignature = CryptoJS.enc.Hex.stringify(hmacResult);

    console.log("calculatedSignature : ", calculatedSignature);

    // Compare the calculated HMAC with the received signature
    if (receivedSignature !== calculatedSignature) {
      // console.log(receivedSignature, 'wwwww',calculatedSignature);
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Continue to the next middleware
    next();
  }
});

function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

function readData() {
  return JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
}

function splitFullName(fullName) {
  // Split the full name into words
  const words = fullName.split(/\s+/);

  // Initialize variables for firstName, middleName, and lastName
  let firstName = "";
  let middleName = "";
  let lastName = "";

  // Assign values based on the number of words
  if (words.length === 1) {
    // If there's only one word, assign it to firstName
    firstName = words[0];
  } else if (words.length === 2) {
    // If there are two words, assign the first to firstName and the second to lastName
    firstName = words[0];
    lastName = words[1];
  } else if (words.length >= 3) {
    // If there are three or more words, assign them to firstName, middleName, and lastName
    firstName = words[0];
    middleName = words[1];
    lastName = words[words.length - 1]; // Join the remaining words as lastName
  }

  // Return an object with first, middle, and last names
  return { firstName, middleName, lastName };
}

app.post("/", (req, res) => {
  // Access the request body data
  const requestData = req.body;

  const users = readData();
  const newUser = {
    id: Date.now(),
    Name: req.body.Name,
    Phone: req.body.Phone,
    Calc: req.body.Calculator,
  };

  const fullName = req.body.Name;

  const { firstName, middleName, lastName } = splitFullName(fullName);

  const userData = {
    Lead: [
      {
        LeadId: "",
        ExistingCustomerFlag: "No",
        ExistingCustomerName: "",
        FirstName: "",
        MiddleName: "",
        LastName: "",
        Gender: "",
        DOB: "",
        Mobile: "",
        Email: "",
        AnnualPremium: "0",
        SumAssured: "",
        Product: "",
        ClickToCall: "",
        Source: "D2C",
        SubSource: "",
        Stage: "Lead Submission",
        SubStage: "Lead Submission",
        LeadDropped: "",
        LeadDroppedPage: "",
        StatusOfAadhar: "",
        AadharNumber: "",
        StatusOfPan: "",
        PanNumber: "",
        DropOfUrl: "",
        DropUrlClicked: "",
        DropDateTime: "",
        LeadQualified: "",
        JunkLead: "",
        CId: "",
        Gclid: "",
        ApplicationNumber: "",
        SmokerNonSmoker: "",
        Nationality: "",
        Browser: "",
        Device: "",
        RefDetails: "",
        Member: [
          {
            MemberId: "",
            FirstName: "",
            MiddleName: "",
            LastName: "",
            Address: "",
            Gender: "",
            MobileNumber: "",
            EmailId: "",
            Pincode: "",
            State: "",
            City: "",
            DOB: "",
            Nationality: "",
            TypeOfAddress: "",
            Proposer: "",
            Medical: [],
            Document: [],
          },
        ],
      },
    ],
  };
  userData.Lead[0].FirstName = firstName;
  userData.Lead[0].MiddleName = middleName;
  userData.Lead[0].LastName = lastName;
  userData.Lead[0].Mobile = req.body.Phone;
  switch (req.body.Calc) {
    case "hlv":
      userData.Lead[0].Product = "Human Life Value";
      userData.Lead[0].SubSource = "Direct - Human Life Value Calculator";
      break;
    case "gratuity":
      userData.Lead[0].Product = "Gratuity";
      userData.Lead[0].SubSource = "Direct - Gratuity Calculator";
      break;
  }

  console.log(
    "seeeeeee ..........................................................................................................................userData",
    userData
  );
  //post call
  axios
    .post(
      "http://workdev.bsli.in:9080/MM_CRMCreateLead_ESBWeb/BSLI/WPS/CRMCreateLeadService/CRMCreateLead",
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      console.log("Response:", response.data);
      // res.send("data sd");
      res.json({ message: "Data received successfully", data: requestData });
    })
    .catch((error) => {
      console.error("Error:", error);
      // res.send("456");
    });

  // users.push(newUser);
  // writeData(users);
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
