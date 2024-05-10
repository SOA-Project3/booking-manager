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

const handleMessage_getAllScheduleLots = async (message) => {
    try {
      // Process the received message
      const data = message.data.toString();
      console.log('Received message:', data);
  
      // Get recommendation response from recommendation service
      const getAllScheduleLots_response = await bookingController.getAllScheduleLots();
  
      // Publish the recommendation response
      await publishMessage("recommendation-service", getAllScheduleLots_response);
  
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
  
module.exports = {
    handleMessage_getAllScheduleLots,
    handleMessage_userSchedulesLots
}