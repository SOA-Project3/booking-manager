const express = require('express');
const bodyParser = require('body-parser');
const sql = require("mssql");

const router = express.Router();
router.use(bodyParser.json());

const allScheduleSlots = () => {
    return new Promise((resolve, reject) => {
        // Execute a SELECT query
        const request = new sql.Request();
        request.query("SELECT * FROM ScheduleSlots", (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                reject(err);
            } else {
                const jsonString = JSON.stringify(result.recordset);
                resolve(jsonString); // Resolve the Promise with the JSON string
            }
        });
    });
};

const availableScheduleSlots = () => {
    return new Promise((resolve, reject) => {
        // Execute a SELECT query
        new sql.Request().query("SELECT * FROM ScheduleSlots WHERE IsBooked = 'No'", (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                reject(err); // Reject the Promise with the error
            } else {
                const jsonString = JSON.stringify(result.recordset);
                resolve(jsonString); // Resolve the Promise with the JSON string
            }
        });
    });
};

const bookedScheduleSlots = () => {
    return new Promise((resolve, reject) => {
        // Execute a SELECT query
        const request = new sql.Request();
        request.query("SELECT * FROM ScheduleSlots WHERE IsBooked = 'Yes'", (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                reject(err);
            } else {
                const jsonString = JSON.stringify(result.recordset);
                resolve(jsonString); // Resolve the Promise with the JSON string
            }
        });
    });
};

const userSchedulesLots = (jsonString) => {
    return new Promise((resolve, reject) => {
        const query = JSON.parse(jsonString);
        const userId = Object.values(query)[0];
        console.log("UserId " + userId)
        // Execute a SELECT query
        new sql.Request().query(`SELECT * FROM ScheduleSlots WHERE UserId = ${userId}`, (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                reject(err);
            } else {
                const jsonString = JSON.stringify(result.recordset);
                console.log("Response "+jsonString)
                resolve(jsonString);
            }
        });
    });
};

const bookScheduleSlot = (jsonString) => {
    const { userId, scheduleSlotId, peopleQuantity } = JSON.parse(jsonString);
    return new Promise((resolve, reject) => {
        // Execute an UPDATE query
        const request = new sql.Request();
        request.query(`UPDATE ScheduleSlots SET UserId = ${userId}, IsBooked = 'Yes', PeopleQuantity = ${peopleQuantity} WHERE Id = ${scheduleSlotId}`, (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                const response = JSON.stringify({ error: "An error occurred while updating reservation." });
                reject(response);
            } else {
                const response = JSON.stringify({ message: "Reservation updated successfully." });
                resolve(response);
            }
        });
    });
};

const cancelScheduleSlot = (jsonString) => {
    const { scheduleSlotId } = JSON.parse(jsonString);

    return new Promise((resolve, reject) => {
        // Execute an UPDATE query
        const request = new sql.Request();
        request.query(`UPDATE ScheduleSlots SET UserId = NULL, IsBooked = 'No', PeopleQuantity = 0 WHERE Id = ${scheduleSlotId}`, (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                const response = JSON.stringify({ error: "An error occurred while resetting reservation." });
                reject(response);
            } else {
                const response = JSON.stringify({ message: "Reservation Canceled." });
                resolve(response);
            }
        });
    });
};

const updateScheduleSlotQuantity = (jsonString) => {
    const { scheduleSlotId, peopleQuantity } = JSON.parse(jsonString);
    return new Promise((resolve, reject) => {
        // Execute an UPDATE query
        const request = new sql.Request();
        request.query(`UPDATE ScheduleSlots SET PeopleQuantity = ${peopleQuantity} WHERE Id = ${scheduleSlotId}`, (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                const response = JSON.stringify({ error: "An error occurred while updating reservation people quantity." });
                reject(response);
            } else {
                const response = JSON.stringify({ message: "Reservation people quantity updated successfully." });
                resolve(response);
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
                reject(response);
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
        // Execute a DELETE query
        const request = new sql.Request();
        request.query(`DELETE FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`, (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                const response = JSON.stringify({ error: "An error occurred while deleting reservation." });
                reject(response);
            } else {
                const response = JSON.stringify({ message: "Reservation deleted successfully." });
                resolve(response);
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