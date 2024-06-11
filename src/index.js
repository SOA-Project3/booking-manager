const express = require("express");
const sql = require("mssql");
const bodyParser = require('body-parser');
const port = 3000; 
const verifyToken = require("./helpers/verifyToken");

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

// Connect to SQL Server
sql.connect(config, err => {
  if (err) {
      throw err;
  }
  console.log("Connection Successful!");
});


const booking = require("./controllers/bookingController");
router.get("/allScheduleSlots",verifyToken, booking.allScheduleSlots); 
router.get("/availableScheduleSlots",verifyToken, booking.availableScheduleSlots); 
router.get("/getScheduleSlotsByAdminId",verifyToken, booking.getScheduleSlotsByAdminId); 
router.get("/userScheduleSlots",verifyToken, booking.userScheduleSlots); 
router.get("/bookedScheduleSlots",verifyToken, booking.bookedScheduleSlots); 
router.put("/bookScheduleSlot",verifyToken, booking.bookScheduleSlot); 
router.put("/cancelScheduleSlot",verifyToken, booking.cancelScheduleSlot); 
router.put("/updateScheduleSlotQuantity",verifyToken, booking.updateScheduleSlotQuantity); 
router.delete("/deleteScheduleSlot",verifyToken, booking.deleteScheduleSlot); 
router.post("/createScheduleSlot",verifyToken, booking.createScheduleSlot); 

app.use(router); 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = {
    app
};