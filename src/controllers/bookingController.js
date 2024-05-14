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
                return res.status(statusCodes.NOT_FOUND).json({ message: "No schedule slots found" });
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
                return res.status(statusCodes.NOT_FOUND).json({ message: "No available schedule slots found" });
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
                return res.status(statusCodes.NOT_FOUND).json({ message: "No booked schedule slots found" });
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
                return res.status(statusCodes.NOT_FOUND).json({ message: "No schedule slots found for the specified user" });
            } else {
                return res.status(statusCodes.OK).json({ message: result.recordset });
            }
        }
    });
};

const bookScheduleSlot = (jsonString) => {
    const { userId, scheduleSlotId, peopleQuantity } = JSON.parse(jsonString);
    return new Promise((resolve, reject) => {
        // Check if the schedule slot is available (IsBooked is No)
        const checkQuery = `SELECT DateTime, IsBooked FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
        const checkRequest = new sql.Request();
        checkRequest.query(checkQuery, (checkErr, checkResult) => {
            if (checkErr) {
                console.error("Error executing check query:", checkErr);
                    const subject = `Error Creating Reservation Number ${scheduleSlotId}`;
                    const message = "An error occurred while checking reservation details.";
                    const response = JSON.stringify({ error: message, status: 500 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                resolve(response);
            } else {
                if (checkResult.recordset.length === 0) {
                    const subject = `Error Creating Reservation Number ${scheduleSlotId}`;
                    const message = "User is not authorized to update this reservation. Schedule slot not found.";
                    const response = JSON.stringify({ error: message, status: 404 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    resolve(response);
                } else if (checkResult.recordset[0].IsBooked === 'Yes') {
                    const subject = `Error Creating Reservation Number ${scheduleSlotId}`;
                    const message = "User is not authorized to update this reservation. Schedule slot is already booked.";
                    const response = JSON.stringify({ error: message, status: 403 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    resolve(response);
                } else {
                    const slotInfo = checkResult.recordset[0];
                    // Execute an UPDATE query
                    const request = new sql.Request();
                    request.query(`UPDATE ScheduleSlots SET UserId = '${userId}', IsBooked = 'Yes', PeopleQuantity = ${peopleQuantity} WHERE Id = ${scheduleSlotId}`, (err, result) => {
                        if (err) {
                            console.error("Error executing query:", err);
                            const subject = `Error Creating Reservation Number ${scheduleSlotId}`;
                            const message = "An error occurred while updating reservation details.";
                            const response = JSON.stringify({ error: message, status: 500 });
                            emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                            resolve(response);
                        } else {
                            // Send email notification
                            const subject = "Reservation Created";
                            const message = `Reservation created successfully for User: ${userId}. Details: Date: ${slotInfo.DateTime.toLocaleDateString()}, Time: ${slotInfo.DateTime.toLocaleTimeString()}, People Quantity: ${peopleQuantity}`;
                            emailer.sendEmail(subject, message, userId);

                            const response = JSON.stringify({ message: "Reservation created successfully.", status: 200 });
                            resolve(response);
                        }
                    });
                }
            }
        });
    });
};

const cancelScheduleSlot = (jsonString) => {
    const { scheduleSlotId, userId } = JSON.parse(jsonString);

    return new Promise((resolve, reject) => {
        // Check if the schedule slot is booked (IsBooked is Yes) by the specified user
        const checkQuery = `SELECT DateTime, PeopleQuantity, IsBooked, UserId FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
        const checkRequest = new sql.Request();
        checkRequest.query(checkQuery, (checkErr, checkResult) => {
            if (checkErr) {
                console.error("Error executing check query:", checkErr);
                const subject = `Error Canceling Reservation Number ${scheduleSlotId}`;
                    const message = "An error occurred while checking reservation details.";
                    const response = JSON.stringify({ error: message, status: 500 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                resolve(response);
            } else {
                if (checkResult.recordset.length === 0) {
                    const subject = `Error Canceling Reservation Number ${scheduleSlotId}`;
                    const message = "User is not authorized to update this reservation. Schedule slot not found.";
                    const response = JSON.stringify({ error: message, status: 404 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    resolve(response);
                } else if (checkResult.recordset[0].IsBooked !== 'Yes') {
                    const subject = `Error Canceling Reservation Number ${scheduleSlotId}`;
                    const message = "User is not authorized to update this reservation. Schedule slot not found.";
                    const response = JSON.stringify({ error: message, status: 404 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    resolve(response);
                } else if (checkResult.recordset[0].UserId !== userId) {
                    const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                    const message = "User is not authorized to update this reservation. It is not under user id: " +  `${userId}` ;
                    const response = JSON.stringify({ error: message, status: 403 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    resolve(response);
                } else {
                    const { DateTime, PeopleQuantity, UserId } = checkResult.recordset[0];
                    // Execute the cancellation query
                    const request = new sql.Request();
                    request.query(`UPDATE ScheduleSlots SET UserId = NULL, IsBooked = 'No', PeopleQuantity = 0 WHERE Id = ${scheduleSlotId}`, (err, result) => {
                        if (err) {
                            console.error("Error executing query:", err);
                            const subject = `Error Canceling Reservation Number ${scheduleSlotId}`;
                            const message = "An error occurred while canceling reservation";
                            const response = JSON.stringify({ error: message, status: 500 });
                            emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                            resolve(response);
                        } else {
                            // Send email notification
                            const dateTime = new Date(DateTime).toLocaleString();
                            const subject = `Canceled Reservation Number ${scheduleSlotId}`;
                            const message = `Reservation canceled successfully. Details: Date: ${dateTime}, People Quantity: ${PeopleQuantity}`;
                            emailer.sendEmail(subject, message, UserId);

                            const response = JSON.stringify({ message: "Reservation Canceled.", status: 200 });
                            resolve(response);
                        }
                    });
                }
            }
        });
    });
};

const updateScheduleSlotQuantity = (jsonString) => {
    const { scheduleSlotId, peopleQuantity, userId } = JSON.parse(jsonString);
    return new Promise((resolve, reject) => {
        // Check if the schedule slot is booked by the specified user
        const checkQuery = `SELECT IsBooked, UserId FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
        const checkRequest = new sql.Request();
        checkRequest.query(checkQuery, (checkErr, checkResult) => {
            if (checkErr) {
                console.error("Error executing check query:", checkErr);
                    const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                    const message = "An error occurred while checking reservation details.";
                    const response = JSON.stringify({ error: message, status: 500 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                resolve(response);
            } else {
                if (checkResult.recordset.length === 0) {
                    const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                    const message = "User is not authorized to update this reservation. Schedule slot not found.";
                    const response = JSON.stringify({ error: message, status: 404 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    resolve(response);
                } else if (checkResult.recordset[0].IsBooked !== 'Yes') {
                    const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                    const message = "User is not authorized to update this reservation. Schedule slot is not booked";
                    const response = JSON.stringify({ error: message, status: 403 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    resolve(response);
                } else if (checkResult.recordset[0].UserId !== userId) {
                    const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                    const message = "User is not authorized to update this reservation. It is not under user id: " +  `${userId}` ;
                    const response = JSON.stringify({ error: message, status: 403 });
                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                    resolve(response);
                } else {
                    // Retrieve reservation details
                    const reservationQuery = `SELECT s.DateTime, s.PeopleQuantity, u.Fullname
                                              FROM ScheduleSlots s
                                              INNER JOIN UserData u ON s.UserId = u.Id
                                              WHERE s.Id = ${scheduleSlotId}`;
                    const reservationRequest = new sql.Request();
                    reservationRequest.query(reservationQuery, (reservationErr, reservationResult) => {
                        if (reservationErr) {
                            console.error("Error executing reservation query:", reservationErr);
                            const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                            const message = "An error occurred while retrieving reservation details.";
                            const response = JSON.stringify({ error: message, status: 500 });
                            emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                            resolve(response);
                        } else {
                            const reservationInfo = reservationResult.recordset[0];
                            const { DateTime, PeopleQuantity, Fullname } = reservationInfo;
                            // Execute the update query
                            const request = new sql.Request();
                            request.query(`UPDATE ScheduleSlots SET PeopleQuantity = ${peopleQuantity} WHERE Id = ${scheduleSlotId}`, (err, result) => {
                                if (err) {
                                    console.error("Error executing query:", err);
                                    const subject = `Error Updating Reservation Number ${scheduleSlotId}`;
                                    const message = "An error occurred while updating reservation people quantity.";
                                    const response = JSON.stringify({ error: message, status: 500 });
                                    emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
                                    resolve(response);
                                } else {
                                    // Send email notification
                                    const subject = `Update Reservation Number ${scheduleSlotId}`;
                                    const message = `Reservation people quantity updated successfully for ${Fullname}. Details: Time: ${DateTime.toLocaleString()}, People Quantity: ${PeopleQuantity}`;
                                    emailer.sendEmail(subject, message, reservationInfo.UserId);
                                    
                                    const response = JSON.stringify({ message: "Reservation people quantity updated successfully.", status: 200 });
                                    resolve(response);
                                }
                            });
                        }
                    });
                }
            }
        });
    });
};

const createScheduleSlot = (jsonString) => {
    const { date, time } = JSON.parse(jsonString);
    return new Promise((resolve, reject) => {
        // Execute an INSERT query
        const request = new sql.Request();
        request.query(`INSERT INTO ScheduleSlots (Date, Time, IsBooked) VALUES ('${date}', '${time}', 'No')`, (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                const response = JSON.stringify({ error: "An error occurred while creating reservation." });
                resolve(response);
            } else {
                const response = JSON.stringify({ message: "Reservation created successfully." });
                resolve(response);
            }
        });
    });
};

const deleteScheduleSlot = (jsonString) => {
    const { scheduleSlotId } = JSON.parse(jsonString);

    // Check if the schedule slot ID exists
    const checkQuery = `SELECT * FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
    const subject = "Delete Reservation"
    const checkRequest = new sql.Request();
    checkRequest.query(checkQuery, (checkErr, checkResult) => {
        if (checkErr) {
            console.error("Error executing check query:", checkErr);
            emailer.sendEmail(subject,`Error occurred while checking schedule slot existence under reservation number: ${scheduleSlotId}.`, "soagrupo6@gmail.com");
        } else {
            if (checkResult.recordset.length === 0) {
                emailer.sendEmail(subject, `No reservation was found under reservation number: ${scheduleSlotId}`, "soagrupo6@gmail.com");
            } else {
                const reservationInfo = checkResult.recordset[0];
                // Retrieve user's name from UserData table using UserId
                const userQuery = `SELECT Fullname FROM UserData WHERE Id = '${reservationInfo.UserId}'`;
                const userRequest = new sql.Request();
                userRequest.query(userQuery, (userErr, userResult) => {
                    if (userErr) {
                        console.error("Error executing user query:", userErr);
                        emailer.sendEmail(subject, `Error occurred while checking schedule slot existence under reservation number: ${scheduleSlotId}.`, "soagrupo6@gmail.com");   
                    } else {
                        const userName = userResult.recordset[0].Fullname;
                        // Format date and time
                        const dateTime = new Date(reservationInfo.DateTime).toLocaleString();
                        // Execute the DELETE query
                        const request = new sql.Request();
                        request.query(`DELETE FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`, (err, result) => {
                            if (err) {
                                console.error("Error executing query:", err);
                                emailer.sendEmail(subject, `Error occurred while checking schedule slot existence under reservation number: ${scheduleSlotId}. Please contact support: soagrupo6@gmail.com`, "soagrupo6@gmail.com");
                            } else {
                                emailer.sendEmail(subject, `Reservation deleted successfully for ${userName}. Details: Date and Time: ${dateTime}, People Quantity: ${reservationInfo.PeopleQuantity}`, "soagrupo6@gmail.com");
                            }
                        });
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