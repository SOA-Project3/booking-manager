const express = require('express');
const bodyParser = require('body-parser');
const sql = require("mssql");

const router = express.Router();
router.use(bodyParser.json());

const getAllScheduleLots = () => {
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

const userSchedulesLots = (jsonString) => {
    return new Promise((resolve, reject) => {
        const query = JSON.parse(jsonString);
        const userId = Object.values(query)[0];
        
        // Execute a SELECT query
        new sql.Request().query(`SELECT * FROM ScheduleSlots WHERE UserId = ${userId}`, (err, result) => {
            if (err) {
                console.error("Error executing query:", err);
                reject(err);
            } else {
                resolve(result.recordset);
            }
        });
    });
};

/*
router.put("/bookscheduleslot", (req, res) => {
    const { userId, scheduleSlotId, peopleQuantity } = req.query;

    // Execute an UPDATE query
    new sql.Request().query(`UPDATE ScheduleSlots SET UserId = ${userId}, IsBooked = 'Yes', PeopleQuantity = ${peopleQuantity} WHERE Id = ${scheduleSlotId}`, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while updating schedule slot." });
        } else {
            res.status(statusCodes.OK).json({ message: "Schedule slot updated successfully." });
        }
    });
});

router.put("/cancelscheduleslot", (req, res) => {
    const { scheduleSlotId } = req.query;

    // Execute an UPDATE query
    new sql.Request().query(`UPDATE ScheduleSlots SET UserId = NULL, IsBooked = 'No', PeopleQuantity = 0 WHERE Id = ${scheduleSlotId}`, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while resetting schedule slot." });
        } else {
            res.status(statusCodes.OK).json({ message: "Schedule slot reset successfully." });
        }
    });
});

router.put("/updatescheduleslotquantity", (req, res) => {
    const { scheduleSlotId, peopleQuantity } = req.query;

    // Execute an UPDATE query
    new sql.Request().query(`UPDATE ScheduleSlots SET PeopleQuantity = ${peopleQuantity} WHERE Id = ${scheduleSlotId}`, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while updating schedule slot quantity." });
        } else {
            res.status(statusCodes.OK).json({ message: "Schedule slot quantity updated successfully." });
        }
    });
});

router.post("/createscheduleslot", (req, res) => {
    const { date, time } = req.query;

    // Execute an INSERT query
    new sql.Request().query(`INSERT INTO ScheduleSlots (Date, Time, IsBooked) VALUES ('${date}', '${time}', 'No')`, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while creating schedule slot." });
        } else {
            res.status(statusCodes.OK).json({ message: "Schedule slot created successfully." });
        }
    });
});

router.delete("/deletescheduleslot", (req, res) => {
    const { scheduleSlotId } = req.query;

    // Execute a DELETE query
    new sql.Request().query(`DELETE FROM ScheduleSlots WHERE Id = ${scheduleSlotId}`, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while deleting schedule slot." });
        } else {
            res.status(statusCodes.OK).json({ message: "Schedule slot deleted successfully." });
        }
    });
});
*/
module.exports = {
    getAllScheduleLots,
    userSchedulesLots
};