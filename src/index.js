const express = require("express");
const { PubSub } = require('@google-cloud/pubsub');
const sql = require("mssql");
const bodyParser = require('body-parser');
const port = 3000; 

const keyFilename = process.env.keyfile;
const pubsub = new PubSub({
    keyFilename: keyFilename,
  });
const pubsubHelper = require("./helpers/PubSub.js");


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
router.get("/allScheduleSlots", booking.allScheduleSlots); 
router.get("/availableScheduleSlots", booking.availableScheduleSlots); 
router.get("/bookedScheduleSlots", booking.bookedScheduleSlots); 
router.get("/bookedScheduleSlots", booking.bookedScheduleSlots); 
router.get("/userScheduleSlots", booking.userScheduleSlots); 

// Set up a subscription to listen for messages
const bookScheduleSlot_sub_name = 'booking-backend-bookScheduleSlot';
const cancelScheduleSlot_sub_name = 'booking-backend-cancelScheduleSlot';
const updateScheduleSlotQuantity_sub_name = 'booking-backend-updateScheduleSlotQuantity';
const deleteScheduleSlot_sub_name = 'booking-backend-deleteScheduleSlot';
//const createScheduleSlot_sub_name = 'booking-backend-createScheduleSlot';

const bookScheduleSlot_sub = pubsub.subscription(bookScheduleSlot_sub_name);
const cancelScheduleSlot_sub = pubsub.subscription(cancelScheduleSlot_sub_name);
const updateScheduleSlotQuantity_sub = pubsub.subscription(updateScheduleSlotQuantity_sub_name);
const deleteScheduleSlot_sub = pubsub.subscription(deleteScheduleSlot_sub_name);
//const createScheduleSlot_sub = pubsub.subscription(createScheduleSlot_sub_name);


// Start listening for messages
bookScheduleSlot_sub.on('message', pubsubHelper.handleMessage_bookScheduleSlot);
cancelScheduleSlot_sub.on('message', pubsubHelper.handleMessage_cancelScheduleSlot);
updateScheduleSlotQuantity_sub.on('message', pubsubHelper.handleMessage_updateScheduleSlotQuantity);
deleteScheduleSlot_sub.on('message', pubsubHelper.handleMessage_deleteScheduleSlot);
//createScheduleSlot_sub.on('message', pubsubHelper.handleMessage_createScheduleSlot);

app.use(router); 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = {
    app
};