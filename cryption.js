const CryptoJS = require("crypto-js");

const decryptFERequest = (encryptedData) => {
  console.log("STARTING",encryptedData)
  const decyrptPayload = CryptoJS.AES.decrypt(encryptedData, "ABFSLP!#$");
  console.log("DECRP",decyrptPayload)
  return JSON.parse(decyrptPayload.toString(CryptoJS.enc.Utf8));
};

const encryptFEResponse = (Data) => {
  const encrypt = CryptoJS.AES.encrypt(Data, "Test@123");
  return encrypt.toString();
};

module.exports = {
  decryptFERequest,
  encryptFEResponse,
};
