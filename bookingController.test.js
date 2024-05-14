describe('Booking Controller', () => {
    const mockRequest = {
        query: jest.fn(),
        params: jest.fn(),
        body: jest.fn()
    };

    const mockResponse = {
        status: jest.fn(() => mockResponse),
        json: jest.fn()
    };

    // Mock the sql module
    jest.mock('mssql');

    it('should return all schedule slots', async () => {
        const sql = require('mssql'); // Import mssql within the test case

        // Mock the query method of sql.Request
        sql.Request.mockImplementationOnce(() => ({
        query: jest.fn().mockImplementationOnce((query, callback) => {
            callback(null, { recordset: [{ id: 1, datetime: '2024-05-20 12:00:00', isBooked: 'No' }] });
        })
        }));

        // Import the function to test
        const { allScheduleSlots } = require('./src/controllers/bookingController');

        // Call the controller function
        await allScheduleSlots(mockRequest, mockResponse);

        // Expect the response to have been called with the correct data
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: [{ id: 1, datetime: '2024-05-20 12:00:00', isBooked: 'No' }] });
    });

    it('should return "No schedule slots found" message when no slots are available', async () => {
        const sql = require('mssql'); // Import mssql within the test case

        // Mock the query method of sql.Request to simulate no schedule slots found
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate no schedule slots found (empty recordset)
                callback(null, { recordset: [] });
            })
        }));

        // Import the function to test
        const { allScheduleSlots } = require('./src/controllers/bookingController');

        // Call the controller function
        await allScheduleSlots(mockRequest, mockResponse);

        // Expect the response to have been called with the correct message
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: "No schedule slots found" });
    });

    it('should handle internal server errors', async () => {
        const sql = require('mssql'); // Import mssql within the test case

        // Mock the query method of sql.Request to simulate an internal server error
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate an internal server error by passing an error object to the callback
                callback(new Error('Database error'), null);
            })
        }));

        // Import the function to test
        const { allScheduleSlots } = require('./src/controllers/bookingController');

        // Call the controller function
        await allScheduleSlots(mockRequest, mockResponse);

        // Expect the response to have been called with a status of 500
        // And a JSON object containing an error message
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error executing query' });
    });

    it('should return available schedule slots', async () => {
        const sql = require('mssql'); // Import mssql within the test case

        // Mock the query method of sql.Request to simulate successful execution
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a successful query with some mock data
                callback(null, { recordset: [{ id: 1, datetime: '2024-05-20 12:00:00', isBooked: 'No' }] });
            })
        }));

        // Import the function to test
        const { availableScheduleSlots } = require('./src/controllers/bookingController');

        // Call the controller function
        await availableScheduleSlots(mockRequest, mockResponse);

        // Expect the response to have been called with a status of 200
        // And a JSON object containing the available schedule slots
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: [{ id: 1, datetime: '2024-05-20 12:00:00', isBooked: 'No' }] });
    });

    it('should return "No available schedule slots found" when no slots are available', async () => {
        const sql = require('mssql'); 
    
        // Mock the query method of sql.Request to simulate a query with no results
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a successful query with an empty recordset
                callback(null, { recordset: [] });
            })
        }));
    
        // Import the function to test
        const { availableScheduleSlots } = require('./src/controllers/bookingController');
    
        // Call the controller function
        await availableScheduleSlots(mockRequest, mockResponse);
    
        // Expect the response to have been called with a status of 200
        // And a JSON object containing a message indicating no slots are available
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No available schedule slots found' });
    });

    it('should handle internal server errors', async () => {
        const sql = require('mssql'); // Import mssql within the test case

        // Mock the query method of sql.Request to simulate an internal server error
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate an internal server error by passing an error object to the callback
                callback(new Error('Database error'), null);
            })
        }));

        // Import the function to test
        const { availableScheduleSlots } = require('./src/controllers/bookingController');

        // Call the controller function
        await availableScheduleSlots(mockRequest, mockResponse);

        // Expect the response to have been called with a status of 500
        // And a JSON object containing an error message
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error executing query' });
    });

    it('should return all booked schedule slots', async () => {
        const sql = require('mssql'); // Import mssql within the test case
    
        // Mock the query method of sql.Request
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a successful query with booked schedule slots
                callback(null, { recordset: [{ id: 1, datetime: '2024-05-20 14:00:00', isBooked: 'Yes' }] });
            })
        }));
    
        // Import the function to test
        const { bookedScheduleSlots } = require('./src/controllers/bookingController');
    
        // Call the controller function
        await bookedScheduleSlots(mockRequest, mockResponse);
    
        // Expect the response to have been called with the correct data
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: [{ id: 1, datetime: '2024-05-20 14:00:00', isBooked: 'Yes' }] });
    });
    
    it('should return "No booked schedule slots found" when no slots are booked', async () => {
        const sql = require('mssql'); // Import mssql within the test case
    
        // Mock the query method of sql.Request to simulate a query with no results
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a successful query with an empty recordset
                callback(null, { recordset: [] });
            })
        }));
    
        // Import the function to test
        const { bookedScheduleSlots } = require('./src/controllers/bookingController');
    
        // Call the controller function
        await bookedScheduleSlots(mockRequest, mockResponse);
    
        // Expect the response to have been called with a status of 200
        // And a JSON object containing a message indicating "No booked schedule slots found"
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No booked schedule slots found' });
    });
    
    it('should return an Internal Server Error if the database query fails', async () => {
        const sql = require('mssql'); // Import mssql within the test case
    
        // Mock the query method of sql.Request to simulate a database error
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a database error
                callback(new Error('Database error'), null);
            })
        }));
    
        // Import the function to test
        const { bookedScheduleSlots } = require('./src/controllers/bookingController');
    
        // Call the controller function
        await bookedScheduleSlots(mockRequest, mockResponse);
    
        // Expect the response to have been called with a status of 500
        // And a JSON object containing an error message indicating "Error executing query"
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error executing query' });
    });

    it('should return schedule slots for the specified user', async () => {
        const sql = require('mssql'); // Import mssql within the test case
        const userId = 'sampleUserId';
    
        // Mock the query method of sql.Request
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a successful query with schedule slots for the specified user
                callback(null, { recordset: [{ id: 1, datetime: '2024-05-20 14:00:00', userId: userId }] });
            })
        }));
    
        // Import the function to test
        const { userScheduleSlots } = require('./src/controllers/bookingController');
    
        // Set up the mock request object with the userId
        mockRequest.query.mockReturnValueOnce({ userId: userId });
    
        // Call the controller function
        await userScheduleSlots(mockRequest, mockResponse);
    
        // Expect the response to have been called with the correct data
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: [{ id: 1, datetime: '2024-05-20 14:00:00', userId: userId }] });
    });
    
    it('should return a message indicating no schedule slots found for the specified user', async () => {
        const sql = require('mssql'); // Import mssql within the test case
        const userId = 'nonExistentUserId';
    
        // Mock the query method of sql.Request to simulate a query with no results
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a successful query with an empty recordset
                callback(null, { recordset: [] });
            })
        }));
    
        // Import the function to test
        const { userScheduleSlots } = require('./src/controllers/bookingController');
    
        // Set up the mock request object with the userId
        mockRequest.query.mockReturnValueOnce({ userId: userId });
    
        // Call the controller function
        await userScheduleSlots(mockRequest, mockResponse);
    
        // Expect the response to have been called with a status of 200
        // And a JSON object containing a message indicating "No schedule slots found for the specified user"
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'No schedule slots found for the specified user' });
    });
    
    it('should return an Internal Server Error if the database query fails', async () => {
        const sql = require('mssql'); // Import mssql within the test case
    
        // Mock the query method of sql.Request to simulate a database error
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a database error
                callback(new Error('Database error'), null);
            })
        }));
    
        // Import the function to test
        const { userScheduleSlots } = require('./src/controllers/bookingController');
    
        // Call the controller function
        await userScheduleSlots(mockRequest, mockResponse);
    
        // Expect the response to have been called with a status of 500
        // And a JSON object containing an error message indicating "Error executing query"
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Error executing query' });
    });

    it('should attempt to create a reservation for an available schedule slot', async () => {
        const jsonString = '{"userId": "sampleUserId", "scheduleSlotId": 1, "peopleQuantity": 2}';
        const mockCheckResult = { recordset: [{ IsBooked: 'No', DateTime: new Date() }] };
        const mockEmailer = { sendEmail: jest.fn() };
    
        const sql = require('mssql'); // Import mssql within the test case
    
        // Mock the query method of sql.Request to simulate a successful check
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a successful check with an available schedule slot
                callback(null, mockCheckResult);
            })
        }));
    
        // Import the function to test
        const { bookScheduleSlot } = require('./src/controllers/bookingController');
    
        // Mock the emailer module
        jest.mock('./src/helpers/emailHelper', () => ({
            sendEmail: mockEmailer.sendEmail
        }));
    
        // Call the function
        await bookScheduleSlot(jsonString);
    
        // Expect that the reservation was attempted to be created successfully
        expect(sql.Request).toHaveBeenCalled();
    });

    it('should attempt to cancel a schedule slot', async () => {
        const jsonString = '{"userId": "sampleUserId", "scheduleSlotId": 1}';
        const mockCheckResult = { recordset: [{ IsBooked: 'Yes', DateTime: new Date(), PeopleQuantity: 2, UserId: 'sampleUserId' }] };
        const mockEmailer = { sendEmail: jest.fn() };
    
        const sql = require('mssql');
    
        // Mock the query method of sql.Request to simulate a successful check
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a successful check with a booked schedule slot
                callback(null, mockCheckResult);
            })
        }));
    
        // Import the function to test
        const { cancelScheduleSlot } = require('./src/controllers/bookingController');
    
        // Mock the emailer module
        jest.mock('./src/helpers/emailHelper', () => ({
            sendEmail: mockEmailer.sendEmail
        }));
    
        // Call the function
        await cancelScheduleSlot(jsonString);
    
        // Expect that the cancellation was attempted
        expect(sql.Request).toHaveBeenCalled();
    });

    it('should update the reservation quantity successfully', async () => {
        const jsonString = '{"scheduleSlotId": 1, "peopleQuantity": 3, "userId": "sampleUserId"}';
        const mockCheckResult = { recordset: [{ IsBooked: 'Yes', UserId: 'sampleUserId' }] };
        const mockReservationResult = { recordset: [{ DateTime: new Date(), PeopleQuantity: 2, Fullname: 'Sample User' }] };

        const sql = require('mssql');

        // Mock the query method of sql.Request to simulate successful checks and reservations
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                // Simulate a successful check with a booked schedule slot
                callback(null, mockCheckResult);
            }).mockImplementationOnce((query, callback) => {
                // Simulate a successful reservation query
                callback(null, mockReservationResult);
            }).mockImplementationOnce((query, callback) => {
                // Simulate a successful update query
                callback(null, {});
            })
        }));

        // Import the function to test
        const { updateScheduleSlotQuantity } = require('./src/controllers/bookingController');

        // Call the function
        await updateScheduleSlotQuantity(jsonString);

        // Expect that the update query was called with the correct data
        expect(sql.Request).toHaveBeenCalledTimes(18);
    });

    it('should attempt to delete an existing schedule slot', async () => {
        const mockJsonString = '{"scheduleSlotId": 1}';
        const sql = require('mssql');
        sql.Request.mockImplementationOnce(() => ({
            query: jest.fn().mockImplementationOnce((query, callback) => {
                const mockCheckResult = { recordset: [{ id: 1 }] };
                callback(null, mockCheckResult);
            })
        }));
        
        const mockEmailer = { sendEmail: jest.fn() };

        // Mock the emailer module
        jest.mock('./src/helpers/emailHelper', () => ({
            sendEmail: mockEmailer.sendEmail
        }));

        // Import the function to test
        const { deleteScheduleSlot } = require('./src/controllers/bookingController');

        // Call the function
        await deleteScheduleSlot(mockJsonString);

        expect(sql.Request).toHaveBeenCalled();
    });
});

