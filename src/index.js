const express = require("express");
const sql = require("mssql");
const bodyParser = require('body-parser');
const port = 3000; 
const verifyToken = require("./helpers/verifyToken");
const crypto = require('crypto');

const app = express(); //Main express app
const router = express.Router(); 
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json());

// SQL Server configuration
var config = {
  "user": "sqlserver", // Database username
  "password": "computines", // Database password
  "server": "34.69.60.15", // Server IP address
  "database": "restec-db", // Database name
  "options": {
      "encrypt": false // Disable encryption
  }
};

const algorithm = 'aes-256-cbc'; // Using AES encryption
const key = crypto.randomBytes(32); // Generate a 32 byte key

function decrypt(iv, encryptedText) {
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const iv = 'b14e97e1857e62b9ebf3d251484e8053';
const encryptedText = '6e9b8ee0b29d9e07d0680e844aee4465';

const decrypted = decrypt(iv, encryptedText);

console.log("Decrypted password:", decrypted);

// Connect to SQL Server
sql.connect(config, err => {
  if (err) {
      throw err;
  }
  console.log("Connection Successful!");
});


const booking = require("./controllers/bookingController");
router.get("/allScheduleSlots", booking.allScheduleSlots); 
router.get("/availableScheduleSlots", booking.availableScheduleSlots); 
router.get("/getScheduleSlotsByAdminId", booking.getScheduleSlotsByAdminId); 
router.get("/userScheduleSlots", booking.userScheduleSlots); 
router.get("/bookedScheduleSlots", booking.bookedScheduleSlots); 
router.put("/bookScheduleSlot", booking.bookScheduleSlot); 
router.put("/cancelScheduleSlot", booking.cancelScheduleSlot); 
router.put("/updateScheduleSlotQuantity", booking.updateScheduleSlotQuantity); 
router.delete("/deleteScheduleSlot", booking.deleteScheduleSlot); 
router.post("/createScheduleSlot", booking.createScheduleSlot); 

app.use(router); 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = {
    app
};