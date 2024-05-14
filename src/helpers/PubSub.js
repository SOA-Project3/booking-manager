const { PubSub } = require('@google-cloud/pubsub');
const keyFilename = process.env.keyfile;
const pubSubClient = new PubSub({
  keyFilename: keyFilename,
}); 
const bookingController = require("../controllers/bookingController");


async function publishMessage(topicName, data) {    
    let message = data;
    if (!data || data.length === 0 || !data.message === 0) {
      message = JSON.stringify({message: 'data is empty', status: 404});
      console.log('No messages to publish');
    }
    console.log(message);
    const dataBuffer = Buffer.from(message);  
    try {
      const messageId = await pubSubClient
        .topic(topicName)
        .publishMessage({data: dataBuffer});
      console.log(`Message ${messageId} published.`);
    } catch (error) {
      console.error(`Received error while publishing: ${error.message}`);
      process.exitCode = 1;
    }
};

const handleMessage_bookScheduleSlot = async (message) => {
  try {
    // Process the received message
    const data = message.data.toString();
    console.log('Received message:', data);
    await bookingController.bookScheduleSlot(data);
    message.ack();
  } catch (error) {
    console.error('Error processing message:', error);
  }
};

const handleMessage_cancelScheduleSlot = async (message) => {
  try {
    // Process the received message
    const data = message.data.toString();
    console.log('Received message:', data);
    await bookingController.cancelScheduleSlot(data);
    message.ack();
  } catch (error) {
    console.error('Error processing message:', error);
  }
};

const handleMessage_updateScheduleSlotQuantity = async (message) => {
  try {
    // Process the received message
    const data = message.data.toString();
    console.log('Received message:', data);
    await bookingController.updateScheduleSlotQuantity(data);
    message.ack();
  } catch (error) {
    console.error('Error processing message:', error);
  }
};

const handleMessage_createScheduleSlot = async (message) => {
  try {
    // Process the received message
    const data = message.data.toString();
    console.log('Received message:', data);
    await bookingController.createScheduleSlot(data);
    message.ack();
  } catch (error) {
    console.error('Error processing message:', error);
  }
};

const handleMessage_deleteScheduleSlot = async (message) => {
  try {
    // Process the received message
    const data = message.data.toString();
    console.log('Received message:', data);
    await bookingController.deleteScheduleSlot(data);
    message.ack();
  } catch (error) {
    console.error('Error processing message:', error);
  }
};



  
module.exports = {
    handleMessage_bookScheduleSlot,
    handleMessage_cancelScheduleSlot,
    handleMessage_updateScheduleSlotQuantity,
    handleMessage_createScheduleSlot,
    handleMessage_deleteScheduleSlot
}