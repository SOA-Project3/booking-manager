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

const getScheduleSlotsByAdminId = (req, res) => {
    const { userId } = req.query;
    // Ejecutar una consulta SELECT
    new sql.Request().query(`SELECT ss.*
                             FROM ScheduleSlots ss
                             JOIN Branch b ON ss.Branch = b.Id
                             JOIN UserData ud ON b.Admin = ud.Id
                             WHERE ud.Id = '${userId}';`, (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
            return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error executing query" });
        } else {
            if (result.recordset.length === 0) {
                return res.status(statusCodes.OK).json({ message: "No schedule slots found for the Branch" });
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

async function bookScheduleSlot(req, res) {
    const { userId, scheduleSlotId, peopleQuantity } = req.query;

    try {
        // Verificar si el horario está disponible
        const checkRequest = new sql.Request();
        checkRequest.input('scheduleSlotId', sql.Int, scheduleSlotId);
        const checkResult = await checkRequest.query('SELECT DateTime, IsBooked FROM ScheduleSlots WHERE Id = @scheduleSlotId');

        if (checkResult.recordset.length === 0) {
            const message = "User is not authorized to update this reservation. Schedule slot not found.";
            console.log(message);
            emailer.sendEmail(`Error Creating Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
            return res.status(statusCodes.OK).json({ error: message });
        } else if (checkResult.recordset[0].IsBooked === 'Yes') {
            const message = "User is not authorized to update this reservation. Schedule slot is already booked.";
            console.log(message);
            emailer.sendEmail(`Error Creating Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
            return res.status(statusCodes.OK).json({ error: message });
        } else {
            const slotInfo = checkResult.recordset[0];

            // Ejecutar una consulta de actualización
            const updateRequest = new sql.Request();
            updateRequest.input('userId', sql.VarChar, userId);
            updateRequest.input('peopleQuantity', sql.Int, peopleQuantity);
            updateRequest.input('scheduleSlotId', sql.Int, scheduleSlotId);
            await updateRequest.query(`
                UPDATE ScheduleSlots 
                SET UserId = @userId, IsBooked = 'Yes', PeopleQuantity = @peopleQuantity 
                WHERE Id = @scheduleSlotId
            `);

            // Enviar notificación por correo electrónico
            const subject = "Reservation Created";
            const message = `Reservation created successfully for User: ${userId}. Details: Date: ${new Date(slotInfo.DateTime).toLocaleDateString()}, Time: ${new Date(slotInfo.DateTime).toLocaleTimeString()}, People Quantity: ${peopleQuantity}`;
            console.log(message);
            emailer.sendEmail(subject, message, userId);

            return res.status(statusCodes.OK).json({ message: "Reservation created successfully" });
        }
    } catch (err) {
        console.error("Error executing query:", err);
        const message = "An error occurred while processing the reservation.";
        emailer.sendEmail(`Error Creating Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: message });
    }
};

async function cancelScheduleSlot(req, res) {
    const { scheduleSlotId, userId } = req.query;

    try {
        // Verificar si el horario está reservado
        const checkRequest = new sql.Request();
        checkRequest.input('scheduleSlotId', sql.Int, scheduleSlotId);
        const checkResult = await checkRequest.query('SELECT DateTime, PeopleQuantity, IsBooked, UserId FROM ScheduleSlots WHERE Id = @scheduleSlotId');

        if (checkResult.recordset.length === 0) {
            const message = "User is not authorized to update this reservation. Schedule slot not found.";
            console.log(message);
            emailer.sendEmail(`Error Canceling Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
            return res.status(statusCodes.NOT_FOUND).json({ error: message });
        } else if (checkResult.recordset[0].IsBooked !== 'Yes') {
            const message = "User is not authorized to update this reservation. Schedule slot is not booked.";
            console.log(message);
            emailer.sendEmail(`Error Canceling Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
            return res.status(statusCodes.CONFLICT).json({ error: message });
        } else if (checkResult.recordset[0].UserId !== userId) {
            const message = `User is not authorized to update this reservation. It is not under user id: ${userId}`;
            console.log(message);
            emailer.sendEmail(`Error Updating Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
            return res.status(statusCodes.FORBIDDEN).json({ error: message });
        } else {
            const { DateTime, PeopleQuantity, UserId } = checkResult.recordset[0];

            // Ejecutar la consulta de cancelación
            const updateRequest = new sql.Request();
            updateRequest.input('scheduleSlotId', sql.Int, scheduleSlotId);
            await updateRequest.query(`
                UPDATE ScheduleSlots 
                SET UserId = NULL, IsBooked = 'No', PeopleQuantity = 0 
                WHERE Id = @scheduleSlotId
            `);

            // Enviar notificación por correo electrónico
            const dateTime = new Date(DateTime).toLocaleString();
            const subject = `Canceled Reservation Number ${scheduleSlotId}`;
            const message = `Reservation canceled successfully. Details: Date: ${dateTime}, People Quantity: ${PeopleQuantity}`;
            console.log(message);
            emailer.sendEmail(subject, message, UserId);

            return res.status(statusCodes.OK).json({ message: "Reservation canceled successfully" });
        }
    } catch (err) {
        console.error("Error executing query:", err);
        const message = "An error occurred while canceling the reservation.";
        emailer.sendEmail(`Error Canceling Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: message });
    }
};

async function updateScheduleSlotQuantity(req, res) {
    const { scheduleSlotId, peopleQuantity, userId } = req.query;

    try {
        // Verificar si el horario está reservado por el usuario especificado
        const checkRequest = new sql.Request();
        checkRequest.input('scheduleSlotId', sql.Int, scheduleSlotId);
        const checkResult = await checkRequest.query('SELECT IsBooked, UserId FROM ScheduleSlots WHERE Id = @scheduleSlotId');

        if (checkResult.recordset.length === 0) {
            const message = "User is not authorized to update this reservation. Schedule slot not found.";
            console.log(message);
            emailer.sendEmail(`Error Updating Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
            return res.status(statusCodes.NOT_FOUND).json({ error: message });
        } else if (checkResult.recordset[0].IsBooked !== 'Yes') {
            const message = "User is not authorized to update this reservation. Schedule slot is not booked.";
            console.log(message);
            emailer.sendEmail(`Error Updating Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
            return res.status(statusCodes.CONFLICT).json({ error: message });
        } else if (checkResult.recordset[0].UserId !== userId) {
            const message = `User is not authorized to update this reservation. It is not under user id: ${userId}`;
            console.log(message);
            emailer.sendEmail(`Error Updating Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
            return res.status(statusCodes.FORBIDDEN).json({ error: message });
        } else {
            // Obtener detalles de la reserva
            const reservationRequest = new sql.Request();
            reservationRequest.input('scheduleSlotId', sql.Int, scheduleSlotId);
            const reservationResult = await reservationRequest.query(`
                SELECT s.DateTime, s.PeopleQuantity, u.Fullname
                FROM ScheduleSlots s
                INNER JOIN UserData u ON s.UserId = u.Id
                WHERE s.Id = @scheduleSlotId
            `);

            if (reservationResult.recordset.length === 0) {
                const message = "An error occurred while retrieving reservation details.";
                console.log(message);
                emailer.sendEmail(`Error Updating Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
                return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: message });
            } else {
                const reservationInfo = reservationResult.recordset[0];
                const { DateTime, Fullname } = reservationInfo;

                // Ejecutar la consulta de actualización
                const updateRequest = new sql.Request();
                updateRequest.input('peopleQuantity', sql.Int, peopleQuantity);
                updateRequest.input('scheduleSlotId', sql.Int, scheduleSlotId);
                await updateRequest.query(`
                    UPDATE ScheduleSlots SET PeopleQuantity = @peopleQuantity WHERE Id = @scheduleSlotId
                `);

                // Enviar notificación por correo electrónico
                const subject = `Update Reservation Number ${scheduleSlotId}`;
                const message = `Reservation people quantity updated successfully for ${Fullname}. Details: Time: ${new Date(DateTime).toLocaleString()}, People Quantity: ${peopleQuantity}`;
                console.log(message);
                emailer.sendEmail(subject, message, userId);

                return res.status(statusCodes.OK).json({ message: "Reservation people quantity updated successfully" });
            }
        }
    } catch (err) {
        console.error("Error executing query:", err);
        const message = "An error occurred while updating reservation people quantity.";
        emailer.sendEmail(`Error Updating Reservation Number ${scheduleSlotId}`, message, "soagrupo6@gmail.com");
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: message });
    }
};

async function createScheduleSlot(req, res) {
    const { datetime, branch } = req.body;
    const sqlDateTime = new Date(datetime).toISOString().slice(0, 19).replace('T', ' ');

    try {
        // Ejecutar la consulta de inserción
        const pool = await new sql.Request();
        await pool.query(`INSERT INTO ScheduleSlots (Branch, DateTime, IsBooked) VALUES ('${branch}', '${sqlDateTime}', 'No')`);

        // Enviar notificación por correo electrónico
        const subject = "Schedule Slot created";
        const message = `Schedule Slot created successfully. Details: Time: ${sqlDateTime}. Location ${branch}`;
        console.log(message);
        emailer.sendEmail(subject, message, "soagrupo6@gmail.com");

        return res.status(statusCodes.OK).json({ message: "Schedule Slot created successfully" });
    } catch (err) {
        console.error("Error executing query:", err);
        const message = "An error occurred while creating schedule slot";
        const subject = "Schedule Slot creation error";
        console.log(message);
        emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: message });
    }
};

async function deleteScheduleSlot(req, res) {
    const { scheduleSlotId } = req.query;

    try {
        const checkRequest = new sql.Request();
        checkRequest.input('scheduleSlotId', sql.Int, scheduleSlotId);
        const checkResult = await checkRequest.query('SELECT * FROM ScheduleSlots WHERE Id = @scheduleSlotId');

        const subject = `Delete Schedule Slot number ${scheduleSlotId}`;

        if (checkResult.recordset.length === 0) {
            const message = `No schedule slot was found under number: ${scheduleSlotId}`;
            console.log(message);
            emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
            return res.status(statusCodes.NOT_FOUND).json({ error: message });
        } else {
            // Ejecutar la consulta de eliminación
            const deleteRequest = new sql.Request();
            deleteRequest.input('scheduleSlotId', sql.Int, scheduleSlotId);
            await deleteRequest.query('DELETE FROM ScheduleSlots WHERE Id = @scheduleSlotId');

            const message = `Reservation deleted successfully for ${scheduleSlotId}.`;
            console.log(message);
            emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
            return res.status(statusCodes.OK).json({ message: "Schedule slot deleted successfully" });
        }
    } catch (err) {
        console.error("Error executing query:", err);
        const subject = `Error Deleting Schedule Slot number ${scheduleSlotId}`;
        const message = `Error occurred while deleting schedule slot under reservation number: ${scheduleSlotId}. Please contact support: soagrupo6@gmail.com`;
        emailer.sendEmail(subject, message, "soagrupo6@gmail.com");
        return res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: message });
    }
};


module.exports = {
    availableScheduleSlots,
    userScheduleSlots,
    getScheduleSlotsByAdminId,
    allScheduleSlots,
    bookedScheduleSlots,
    bookScheduleSlot,
    cancelScheduleSlot,
    updateScheduleSlotQuantity,
    createScheduleSlot,
    deleteScheduleSlot
};