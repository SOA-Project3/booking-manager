const express = require('express');
const bodyParser = require('body-parser');
const sql = require("mssql");
const emailer = require("../helpers/emailHelper");
const statusCodes = require("../constants/statusCodes");


const router = express.Router();
router.use(bodyParser.json());

const allScheduleSlots = (req, res) => {
    const request = new sql.Request();
    request.query("SELECT * FROM ScheduleSlots", (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error executing query" });
        } else {
            if (result.recordset.length === 0) {
                return res.status(statusCodes.OK).json({ message: "No schedule slots found" });
            } else {
                return res.status(statusCodes.OK).json({ message: result.recordset });
            }
        }
    });
};

const availableScheduleSlots = (req, res) => {
    // Execute a SELECT query
    new sql.Request().query("SELECT * FROM ScheduleSlots WHERE IsBooked = 'No'", (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error executing query" });
        } else {
            if (result.recordset.length === 0) {
                return res.status(statusCodes.OK).json({ message: "No available schedule slots found" });
            } else {
                return res.status(statusCodes.OK).json({ message: result.recordset });
            }
        }
    });
};


const bookedScheduleSlots = (req, res) => {
    // Execute a SELECT query
    const request = new sql.Request();
    request.query("SELECT * FROM ScheduleSlots WHERE IsBooked = 'Yes'", (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error executing query" });
        } else {
            if (result.recordset.length === 0) {
                return res.status(statusCodes.OK).json({ message: "No booked schedule slots found" });
            } else {
                return res.status(statusCodes.OK).json({ message: result.recordset });
            }
        }
    });
};

const userScheduleSlots = (req, res) => {
    const { userId } = req.query;

    // Ejecutar una consulta SELECT
    new sql.Request().query(`SELECT * FROM ScheduleSlots WHERE UserId = '${userId}'`, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error executing query" });
        } else {
            if (result.recordset.length === 0) {
                return res.status(statusCodes.OK).json({ message: "No schedule slots found for the specified user" });
            } else {
                return res.status(statusCodes.OK).json({ message: result.recordset });
            }
        }
    });
};

const bookScheduleSlot = (jsonString) => {
    const { userId, scheduleSlotId, peopleQuantity } = JSON.parse(jsonString);

    // Check if the schedule slot is available (IsBooked is No)
    const checkQuery = `SELECT DateTime, IsBooked FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
    const checkRequest = new sql.Request();
    checkRequest.query(checkQuery, (checkErr, checkResult) => {
        if (checkErr) {
            console.log("Error executing check query:", checkErr);
            const subject = `Error Creating Reservation Number ${scheduleSlotId}`;
            const message = "An error occurred while checking reservation details.";
            emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
        } else {
            if (checkResult.recordset.length === 0) {
                const subject = `Error Creating Reservation Number ${scheduleSlotId}`;
                const message = "User is not authorized to update this reservation. Schedule slot not found.";
                console.log(message);
                emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
            } else if (checkResult.recordset[0].IsBooked === 'Yes') {
                const subject = `Error Creating Reservation Number ${scheduleSlotId}`;
                const message = "User is not authorized to update this reservation. Schedule slot is already booked.";
                console.log(message);
                emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
            } else {
                const slotInfo = checkResult.recordset[0];
                // Execute an UPDATE query
                const request = new sql.Request();
                request.query(`UPDATE ScheduleSlots SET UserId = '${userId}', IsBooked = 'Yes', PeopleQuantity = ${peopleQuantity} WHERE Id = ${scheduleSlotId}`, (err, result) => {
                    if (err) {
                        console.log("Error executing query:", err);
                        const subject = `Error Creating Reservation Number ${scheduleSlotId}`;
                        const message = "An error occurred while updating reservation details.";
                        console.log(message);
                        emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    } else {
                        // Send email notification
                        const subject = "Reservation Created";
                        const message = `Reservation created successfully for User: ${userId}. Details: Date: ${slotInfo.DateTime.toLocaleDateString()}, Time: ${slotInfo.DateTime.toLocaleTimeString()}, People Quantity: ${peopleQuantity}`;
                        console.log(message);
                        emailer.sendEmail(subject, message, userId);
                    }
                });
            }
        }
    });
};


const cancelScheduleSlot = (jsonString) => {
    const { scheduleSlotId, userId } = JSON.parse(jsonString);

    // Check if the schedule slot is booked (IsBooked is Yes) by the specified user
    const checkQuery = `SELECT DateTime, PeopleQuantity, IsBooked, UserId FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
    const checkRequest = new sql.Request();
    checkRequest.query(checkQuery, (checkErr, checkResult) => {
        if (checkErr) {
            console.log("Error executing check query:", checkErr);
            const subject = `Error Canceling Reservation Number ${scheduleSlotId}`;
            const message = "An error occurred while checking reservation details.";
            emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
        } else {
            if (checkResult.recordset.length === 0) {
                const subject = `Error Canceling Reservation Number ${scheduleSlotId}`;
                const message = "User is not authorized to update this reservation. Schedule slot not found.";
                console.log(message);
                emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
            } else if (checkResult.recordset[0].IsBooked !== 'Yes') {
                const subject = `Error Canceling Reservation Number ${scheduleSlotId}`;
                const message = "User is not authorized to update this reservation. Schedule slot not found.";
                console.log(message);
                emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
            } else if (checkResult.recordset[0].UserId !== userId) {
                const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                const message = "User is not authorized to update this reservation. It is not under user id: " +  `${userId}` ;
                console.log(message);
                emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
            } else {
                const { DateTime, PeopleQuantity, UserId } = checkResult.recordset[0];
                // Execute the cancellation query
                const request = new sql.Request();
                request.query(`UPDATE ScheduleSlots SET UserId = NULL, IsBooked = 'No', PeopleQuantity = 0 WHERE Id = ${scheduleSlotId}`, (err, result) => {
                    if (err) {
                        console.log("Error executing query:", err);
                        const subject = `Error Canceling Reservation Number ${scheduleSlotId}`;
                        const message = "An error occurred while canceling reservation";
                        console.log(message);
                        emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    } else {
                        // Send email notification
                        const dateTime = new Date(DateTime).toLocaleString();
                        const subject = `Canceled Reservation Number ${scheduleSlotId}`;
                        const message = `Reservation canceled successfully. Details: Date: ${dateTime}, People Quantity: ${PeopleQuantity}`;
                        console.log(message);
                        emailer.sendEmail(subject, message, UserId);
                    }
                });
            }
        }
    });
};

const updateScheduleSlotQuantity = (jsonString) => {
    const { scheduleSlotId, peopleQuantity, userId } = JSON.parse(jsonString);

    // Check if the schedule slot is booked by the specified user
    const checkQuery = `SELECT IsBooked, UserId FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
    const checkRequest = new sql.Request();
    checkRequest.query(checkQuery, (checkErr, checkResult) => {
        if (checkErr) {
            console.log("Error executing check query:", checkErr);
            const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
            const message = "An error occurred while checking reservation details.";
            console.log(message);
            emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
        } else {
            if (checkResult.recordset.length === 0) {
                const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                const message = "User is not authorized to update this reservation. Schedule slot not found.";
                console.log(message);
                emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
            } else if (checkResult.recordset[0].IsBooked !== 'Yes') {
                const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                const message = "User is not authorized to update this reservation. Schedule slot is not booked";
                console.log(message);
                emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
            } else if (checkResult.recordset[0].UserId !== userId) {
                const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                const message = "User is not authorized to update this reservation. It is not under user id: " +  `${userId}` ;
                console.log(message);
                emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
            } else {
                // Retrieve reservation details
                const reservationQuery = `SELECT s.DateTime, s.PeopleQuantity, u.Fullname
                                          FROM ScheduleSlots s
                                          INNER JOIN UserData u ON s.UserId = u.Id
                                          WHERE s.Id = ${scheduleSlotId}`;
                const reservationRequest = new sql.Request();
                reservationRequest.query(reservationQuery, (reservationErr, reservationResult) => {
                    if (reservationErr) {
                        console.log("Error executing reservation query:", reservationErr);
                        const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                        const message = "An error occurred while retrieving reservation details.";
                        console.log(message);
                        emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    } else {
                        const reservationInfo = reservationResult.recordset[0];
                        const { DateTime, PeopleQuantity, Fullname } = reservationInfo;
                        // Execute the update query
                        const request = new sql.Request();
                        request.query(`UPDATE ScheduleSlots SET PeopleQuantity = ${peopleQuantity} WHERE Id = ${scheduleSlotId}`, (err, result) => {
                            if (err) {
                                console.log("Error executing query:", err);
                                const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                                const message = "An error occurred while updating reservation people quantity.";
                                console.log(message);
                                emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                            } else {
                                // Send email notification
                                const subject = `Update Reservation Number ${scheduleSlotId}`;
                                const message = `Reservation people quantity updated successfully for ${Fullname}. Details: Time: ${DateTime.toLocaleString()}, People Quantity: ${PeopleQuantity}`;
                                console.log(message);
                                emailer.sendEmail(subject, message, userId);
                            }
                        });
                    }
                });
            }
        }
    });
};

const createScheduleSlot = async (jsonString) => {
    const { datetime } = JSON.parse(jsonString); // Assuming you pass a single datetime field in your JSON
    const sqlDateTime = new Date(datetime).toISOString().slice(0, 19).replace('T', ' '); // Format the datetime as 'YYYY-MM-DD HH:mm:ss'
    
    const request = new sql.Request();
    try {
        await request.query(`INSERT INTO ScheduleSlots (DateTime, IsBooked) VALUES ('${sqlDateTime}', 'No')`);
        // Send email notification
        const subject = `Schedule Slot created`;
        const message = `Reservation created successfully. Details: Time: ${sqlDateTime.toLocaleString()}`;
        console.log(message);
        emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
    } catch (err) {
        console.error("Error executing query:", err);
        const subject = `Schedule Slot creation error`;
        const message = `Error occurr while creating schedule slot`;
        console.log(message);
        emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
    }
};

const deleteScheduleSlot = (jsonString) => {
    const { scheduleSlotId } = JSON.parse(jsonString);

    // Check if the schedule slot ID exists
    const checkQuery = `SELECT * FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
    const subject = `Delete Schedule Slot number ${scheduleSlotId}`
    const checkRequest = new sql.Request();
    checkRequest.query(checkQuery, (checkErr, checkResult) => {
        if (checkErr) {
            console.error("Error executing check query:", checkErr);
            emailer.sendEmail(subject,`Error occurred while checking schedule slot existence under reservation number: ${scheduleSlotId}.`, "soagrupo6@gmail.com");
        } else {
            if (checkResult.recordset.length === 0) {
                emailer.sendEmail(subject, `No schedule slots  was found under number: ${scheduleSlotId}`, "soagrupo6@gmail.com");
            } else {
                // Retrieve user's name from UserData table using UserId
                const request = new sql.Request();
                request.query(`DELETE FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`, (err, result) => {
                    if (err) {
                        console.error("Error executing query:", err);
                        emailer.sendEmail(subject, `Error occurred while checking schedule slot existence under reservation number: ${scheduleSlotId}. Please contact support: soagrupo6@gmail.com`, "soagrupo6@gmail.com");
                    } else {
                        emailer.sendEmail(subject, `Reservation deleted successfully for ${scheduleSlotId}.`, "soagrupo6@gmail.com");
                    }
                });
            }
        }
    });
};

module.exports = {
    availableScheduleSlots,
    userScheduleSlots,
    allScheduleSlots,
    bookedScheduleSlots,
    bookScheduleSlot,
    cancelScheduleSlot,
    updateScheduleSlotQuantity,
    createScheduleSlot,
    deleteScheduleSlot
};