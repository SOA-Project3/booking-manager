const express = require("express");
const { PubSub } = require('@google-cloud/pubsub');
const sql = require("mssql");

const keyFilename = process.env.keyfile;
const pubsub = new PubSub({
    keyFilename: keyFilename,
  });
const pubsubHelper = require("./helpers/PubSub.js");

const app = express();

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

// Set up a subscription to listen for messages
const availableScheduleSlots_sub_name = 'booking-backend-getAllScheduleLots';
const userSchedulesLots_sub_name = 'booking-backend-userSchedulesLots';
const allScheduleSlots_sub_name = 'booking-backend-allScheduleSlots';
const bookedScheduleSlots_sub_name = 'booking-backend-bookedScheduleSlots';


const availableScheduleSlots_sub = pubsub.subscription(availableScheduleSlots_sub_name);
const userSchedulesLots_sub = pubsub.subscription(userSchedulesLots_sub_name);
const allScheduleSlots_sub = pubsub.subscription(allScheduleSlots_sub_name);
const bookedScheduleSlots_sub = pubsub.subscription(bookedScheduleSlots_sub_name);

// Start listening for messages
availableScheduleSlots_sub.on('message', pubsubHelper.handleMessage_availableScheduleSlots);
userSchedulesLots_sub.on('message', pubsubHelper.handleMessage_userSchedulesLots);
allScheduleSlots_sub.on('message', pubsubHelper.handleMessage_allScheduleSlots);
bookedScheduleSlots_sub.on('message', pubsubHelper.handleMessage_bookedScheduleSlots);

module.exports = {
    app
};