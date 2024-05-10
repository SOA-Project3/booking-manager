const { PubSub } = require('@google-cloud/pubsub');
const keyFilename = process.env.keyfile;
const pubSubClient = new PubSub({
  keyFilename: keyFilename,
}); 
const bookingController = require("../controllers/bookingController");


async function publishMessage(topicName, data) {    
    const dataBuffer = Buffer.from(data);  
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

const handleMessage_availableScheduleSlots = async (message) => {
    try {
      // Get recommendation response from recommendation service
      const availableScheduleSlots_response = await bookingController.availableScheduleSlots();
  
      // Publish the recommendation response
      await publishMessage("recommendation-service", availableScheduleSlots_response);
  
      // Acknowledge the message to remove it from the subscription
      message.ack();
    } catch (error) {
      console.error('Error processing message:', error);
    }
};

const handleMessage_userSchedulesLots = async (message) => {
    try {
      // Process the received message
      const data = message.data.toString();
      console.log('Received message:', data);
  
      // Get recommendation response from recommendation service
      const userSchedulesLots_response = await bookingController.userSchedulesLots(data);
  
      // Publish the recommendation response
      await publishMessage("recommendation-service", userSchedulesLots_response);
  
      // Acknowledge the message to remove it from the subscription
      message.ack();
    } catch (error) {
      console.error('Error processing message:', error);
    }
};

const handleMessage_allScheduleSlots = async (message) => {
  try {
    // Get recommendation response from recommendation service
    const allScheduleSlots_response = await bookingController.allScheduleSlots();
    // Publish the recommendation response
    await publishMessage("recommendation-service", allScheduleSlots_response);

    // Acknowledge the message to remove it from the subscription
    message.ack();
  } catch (error) {
    console.error('Error processing message:', error);
  }
};

  
module.exports = {
    handleMessage_availableScheduleSlots,
    handleMessage_userSchedulesLots,
    handleMessage_allScheduleSlots
}