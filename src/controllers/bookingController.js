const express = require('express');
const bodyParser = require('body-parser');
const sql = require("mssql");
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

const userSchedulesLots = (jsonString) => {
    return new Promise((resolve, reject) => {
        const query = JSON.parse(jsonString);
        const userId = Object.values(query)[0];
        console.log("UserId " + userId)
        // Execute a SELECT query
        new sql.Request().query(`SELECT * FROM ScheduleSlots WHERE UserId = '${userId}'`, (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                const jsonString = JSON.stringify({error : "Error executing query", status: 500});
                resolve(jsonString);
            } else {
                const jsonString = JSON.stringify({message : result.recordset, status: 200});
                console.log("Response "+jsonString)
                resolve(jsonString);
            }
        });
    });
};

const bookScheduleSlot = (jsonString) => {
    const { userId, scheduleSlotId, peopleQuantity } = JSON.parse(jsonString);
    return new Promise((resolve, reject) => {
        // Check if the schedule slot is available (IsBooked is No)
        const checkQuery = `SELECT IsBooked FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
        const checkRequest = new sql.Request();
        checkRequest.query(checkQuery, (checkErr, checkResult) => {
            if (checkErr) {
                console.error("Error executing check query:", checkErr);
                const response = JSON.stringify({ error: "An error occurred while checking reservation availability.", status: 400 });
                resolve(response);
            } else {
                if (checkResult.recordset.length === 0) {
                    const response = JSON.stringify({ error: "Schedule slot not found.", status: 404 });
                    resolve(response);
                } else if (checkResult.recordset[0].IsBooked === 'Yes') {
                    const response = JSON.stringify({ error: "Schedule slot is already booked.", status: 400 });
                    resolve(response);
                } else {
                    // Execute an UPDATE query
                    const request = new sql.Request();
                    request.query(`UPDATE ScheduleSlots SET UserId = '${userId}', IsBooked = 'Yes', PeopleQuantity = ${peopleQuantity} WHERE Id = ${scheduleSlotId}`, (err, result) => {
                        if (err) {
                            console.error("Error executing query:", err);
                            const response = JSON.stringify({ error: "An error occurred while updating reservation.", status: 400 });
                            resolve(response);
                        } else {
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
        const checkQuery = `SELECT IsBooked, UserId FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
        const checkRequest = new sql.Request();
        checkRequest.query(checkQuery, (checkErr, checkResult) => {
            if (checkErr) {
                console.error("Error executing check query:", checkErr);
                const response = JSON.stringify({ error: "An error occurred while checking reservation status.", status: 400 });
                resolve(response);
            } else {
                if (checkResult.recordset.length === 0) {
                    const response = JSON.stringify({ error: "Schedule slot not found.", status: 404 });
                    resolve(response);
                } else if (checkResult.recordset[0].IsBooked !== 'Yes') {
                    const response = JSON.stringify({ error: "Schedule slot is not booked.", status: 400 });
                    resolve(response);
                } else if (checkResult.recordset[0].UserId !== userId) {
                    const response = JSON.stringify({ error: "You are not authorized to cancel this reservation.", status: 403 });
                    resolve(response);
                } else {
                    // Execute the cancellation query
                    const request = new sql.Request();
                    request.query(`UPDATE ScheduleSlots SET UserId = NULL, IsBooked = 'No', PeopleQuantity = 0 WHERE Id = ${scheduleSlotId}`, (err, result) => {
                        if (err) {
                            console.error("Error executing query:", err);
                            const response = JSON.stringify({ error: "An error occurred while canceling reservation, try again.", status: 400 });
                            resolve(response);
                        } else {
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
                const response = JSON.stringify({ error: "An error occurred while checking reservation details." , status: 500});
                resolve(response);
            } else {
                if (checkResult.recordset.length === 0) {
                    const response = JSON.stringify({ error: "Schedule slot not found.", status: 404 });
                    resolve(response);
                } else if (checkResult.recordset[0].IsBooked !== 'Yes') {
                    const response = JSON.stringify({ error: "Schedule slot is not booked.", status: 400 });
                    resolve(response);
                } else if (checkResult.recordset[0].UserId !== userId) {
                    const response = JSON.stringify({ error: "You are not authorized to update this reservation.", status: 403 });
                    resolve(response);
                } else {
                    // Execute the update query
                    const request = new sql.Request();
                    request.query(`UPDATE ScheduleSlots SET PeopleQuantity = ${peopleQuantity} WHERE Id = ${scheduleSlotId}`, (err, result) => {
                        if (err) {
                            console.error("Error executing query:", err);
                            const response = JSON.stringify({ error: "An error occurred while updating reservation people quantity.", status: 500 });
                            resolve(response);
                        } else {
                            const response = JSON.stringify({ message: "Reservation people quantity updated successfully.", status: 200 });
                            resolve(response);
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

    return new Promise((resolve, reject) => {
        // Check if the schedule slot ID exists
        const checkQuery = `SELECT Id FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`;
        const checkRequest = new sql.Request();
        checkRequest.query(checkQuery, (checkErr, checkResult) => {
            if (checkErr) {
                console.error("Error executing check query:", checkErr);
                const response = JSON.stringify({ error: "An error occurred while checking schedule slot existence.", status: 500 });
                resolve(response);
            } else {
                if (checkResult.recordset.length === 0) {
                    const response = JSON.stringify({ error: "Schedule slot not found.", status: 404 });
                    resolve(response);
                } else {
                    // Execute the DELETE query
                    const request = new sql.Request();
                    request.query(`DELETE FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`, (err, result) => {
                        if (err) {
                            console.error("Error executing query:", err);
                            const response = JSON.stringify({ error: "An error occurred while deleting schedule slot.", status: 500 });
                            resolve(response);
                        } else {
                            const response = JSON.stringify({ message: "Reservation deleted successfully.", status: 200 });
                            resolve(response);
                        }
                    });
                }
            }
        });
    });
};
module.exports = {
    availableScheduleSlots,
    userSchedulesLots,
    allScheduleSlots,
    bookedScheduleSlots,
    bookScheduleSlot,
    cancelScheduleSlot,
    updateScheduleSlotQuantity,
    createScheduleSlot,
    deleteScheduleSlot
};