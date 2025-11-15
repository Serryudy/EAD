const AppointmentController = require('../../controllers/appointmentController');
const Appointment = require('../../models/Appointment');
const Vehicle = require('../../models/Vehicle');
const User = require('../../models/User');
const Service = require('../../models/Service');
const notificationService = require('../../services/notificationService');
const slotCalculator = require('../../utils/slotCalculator');
const appointmentValidator = require('../../utils/appointmentValidator');

// Mock all dependencies
jest.mock('../../models/Appointment');
jest.mock('../../models/Vehicle');
jest.mock('../../models/User');
jest.mock('../../models/Service');
jest.mock('../../services/notificationService');
jest.mock('../../utils/slotCalculator');
jest.mock('../../utils/appointmentValidator');

describe('AppointmentController', () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
      query: {},
      user: null
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock console methods to keep test output clean
    console.error = jest.fn();
    console.log = jest.fn();
  });

  // ========================
  // CREATE APPOINTMENT TESTS
  // ========================

  describe('createAppointment', () => {
    const mockCustomer = {
      _id: 'customer123',
      role: 'customer',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+94712345678'
    };

    const mockVehicle = {
      _id: 'vehicle123',
      ownerId: 'customer123',
      vehicleNumber: 'ABC-1234',
      make: 'Toyota',
      model: 'Camry',
      serviceHistory: []
    };

    const mockEmployee = {
      _id: 'emp123',
      name: 'Jane Smith',
      employeeId: 'EMP001',
      role: 'employee'
    };

    beforeEach(() => {
      req.user = mockCustomer;
      req.body = {
        vehicleId: 'vehicle123',
        serviceType: 'Oil Change',
        serviceDescription: 'Regular oil change service',
        preferredDate: '2025-12-01', // Updated to future date
        timeWindow: '09:00 AM - 11:00 AM',
        additionalNotes: 'Please check brakes too',
        estimatedDuration: '2 hours',
        estimatedCost: 150
      };
    });

    it('should create appointment successfully with auto-assigned employee', async () => {
      const mockAppointment = {
        _id: 'appointment123',
        customerId: mockCustomer._id,
        vehicleId: mockVehicle._id,
        serviceType: 'Oil Change',
        status: 'confirmed',
        assignedEmployee: mockEmployee._id,
        employeeName: mockEmployee.name,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis()
      };

      Vehicle.findById = jest.fn().mockResolvedValue({
        ...mockVehicle,
        save: jest.fn().mockResolvedValue(true)
      });

      // Mock the Appointment constructor and save
      Appointment.mockImplementation(() => mockAppointment);

      // Mock employee availability check
      User.find = jest.fn().mockResolvedValue([mockEmployee]);
      Appointment.find = jest.fn().mockResolvedValue([]); // No conflicting appointments

      // Mock notification services
      notificationService.notifyAppointmentCreated = jest.fn().mockResolvedValue(true);
      notificationService.notifyAdminNewAppointment = jest.fn().mockResolvedValue(true);
      notificationService.notifyEmployeeAssigned = jest.fn().mockResolvedValue(true);

      await AppointmentController.createAppointment(req, res);

      expect(Vehicle.findById).toHaveBeenCalledWith('vehicle123');
      expect(mockAppointment.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('Appointment created successfully'),
          autoAssigned: true
        })
      );
    });

    it('should return 401 if user is not authenticated', async () => {
      req.user = null;

      await AppointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required. Please login to create an appointment.'
      });
    });

    it('should return 403 if user is not a customer', async () => {
      req.user = { ...mockEmployee, role: 'employee' };

      await AppointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Only customers can create appointments.'
      });
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = {
        vehicleId: 'vehicle123'
        // Missing other required fields
      };

      await AppointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields: vehicleId, serviceType, preferredDate, timeWindow'
      });
    });

    it('should return 404 if vehicle not found', async () => {
      Vehicle.findById = jest.fn().mockResolvedValue(null);

      await AppointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Vehicle not found'
      });
    });

    it('should return 403 if vehicle does not belong to user', async () => {
      Vehicle.findById = jest.fn().mockResolvedValue({
        ...mockVehicle,
        ownerId: 'different_customer'
      });

      await AppointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You can only create appointments for your own vehicles'
      });
    });
  });

  // ========================
  // GET APPOINTMENTS TESTS
  // ========================

  describe('getAllAppointments', () => {
    const mockAppointments = [
      {
        _id: 'apt1',
        customerId: 'customer123',
        status: 'pending',
        serviceType: 'Oil Change'
      },
      {
        _id: 'apt2',
        customerId: 'customer123',
        status: 'confirmed',
        serviceType: 'Brake Service'
      }
    ];

    beforeEach(() => {
      req.user = { _id: 'customer123', role: 'customer' };
      req.query = { page: 1, limit: 10 };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockAppointments)
      };

      Appointment.find = jest.fn().mockReturnValue(mockQuery);
      Appointment.countDocuments = jest.fn().mockResolvedValue(2);
    });

    it('should get customer appointments successfully', async () => {
      await AppointmentController.getAllAppointments(req, res);

      expect(Appointment.find).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: 'customer123' })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockAppointments,
          pagination: expect.objectContaining({
            total: 2,
            page: 1,
            limit: 10
          })
        })
      );
    });

    it('should allow employees to see all appointments', async () => {
      req.user = { _id: 'emp123', role: 'employee' };

      await AppointmentController.getAllAppointments(req, res);

      expect(Appointment.find).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockAppointments
        })
      );
    });

    it('should apply status filter', async () => {
      req.query.status = 'confirmed';

      await AppointmentController.getAllAppointments(req, res);

      expect(Appointment.find).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'customer123',
          status: 'confirmed'
        })
      );
    });
  });

  // ========================
  // GET APPOINTMENT BY ID TESTS
  // ========================

  describe('getAppointmentById', () => {
    const mockAppointment = {
      _id: 'apt123',
      customerId: { _id: 'customer123' },
      status: 'pending',
      serviceType: 'Oil Change'
    };

    beforeEach(() => {
      req.user = { _id: 'customer123', role: 'customer' };
      req.params = { id: 'apt123' };

      // Create proper populate chain
      const populateChain = {
        populate: jest.fn().mockReturnThis()
      };
      
      // Setup the chain to resolve with mockAppointment on the final call
      populateChain.populate
        .mockReturnValueOnce(populateChain)  // First populate call
        .mockReturnValueOnce(populateChain)  // Second populate call  
        .mockReturnValueOnce(populateChain)  // Third populate call
        .mockResolvedValueOnce(mockAppointment); // Final resolve

      Appointment.findById = jest.fn().mockReturnValue(populateChain);
    });

    it('should get appointment by ID successfully for owner', async () => {
      await AppointmentController.getAppointmentById(req, res);

      expect(Appointment.findById).toHaveBeenCalledWith('apt123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAppointment
      });
    });

    it('should return 404 if appointment not found', async () => {
      req.params = { id: 'nonexistent' };

      // Return null through the populate chain
      const populateChain = {
        populate: jest.fn().mockReturnThis()
      };
      
      populateChain.populate
        .mockReturnValueOnce(populateChain)
        .mockReturnValueOnce(populateChain)
        .mockReturnValueOnce(populateChain)
        .mockResolvedValueOnce(null);

      Appointment.findById = jest.fn().mockReturnValue(populateChain);

      await AppointmentController.getAppointmentById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Appointment not found'
      });
    });

    it('should return 403 if customer tries to access another customer appointment', async () => {
      const otherCustomerAppointment = {
        ...mockAppointment,
        customerId: { _id: 'other_customer' }
      };

      req.params = { id: 'apt123' };

      const populateChain = {
        populate: jest.fn().mockReturnThis()
      };
      
      populateChain.populate
        .mockReturnValueOnce(populateChain)
        .mockReturnValueOnce(populateChain)
        .mockReturnValueOnce(populateChain)
        .mockResolvedValueOnce(otherCustomerAppointment);

      Appointment.findById = jest.fn().mockReturnValue(populateChain);

      await AppointmentController.getAppointmentById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. You can only view your own appointments.'
      });
    });

    it('should allow employees to view any appointment', async () => {
      const employeeAppointment = {
        ...mockAppointment,
        customerId: { _id: 'different_customer' }
      };

      req.user = { _id: 'emp123', role: 'employee' };
      req.params = { id: 'apt123' };

      const populateChain = {
        populate: jest.fn().mockReturnThis()
      };
      
      populateChain.populate
        .mockReturnValueOnce(populateChain)
        .mockReturnValueOnce(populateChain)
        .mockReturnValueOnce(populateChain)
        .mockResolvedValueOnce(employeeAppointment);

      Appointment.findById = jest.fn().mockReturnValue(populateChain);

      await AppointmentController.getAppointmentById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: employeeAppointment
      });
    });
  });

  // ========================
  // CANCEL APPOINTMENT TESTS
  // ========================

  describe('cancelAppointment', () => {
    const mockAppointment = {
      _id: 'apt123',
      status: 'confirmed',
      customerId: { _id: 'customer123', name: 'John Doe' },
      canBeCancelled: jest.fn().mockReturnValue(true),
      save: jest.fn().mockResolvedValue(true)
    };

    beforeEach(() => {
      req.params = { id: 'apt123' };
      req.body = { cancellationReason: 'Customer unavailable' };

      const populateChain = {
        populate: jest.fn().mockResolvedValue(mockAppointment)
      };

      Appointment.findById = jest.fn().mockReturnValue(populateChain);
      notificationService.notifyAppointmentCancelled = jest.fn().mockResolvedValue(true);
    });

    it('should cancel appointment successfully', async () => {
      await AppointmentController.cancelAppointment(req, res);

      expect(mockAppointment.status).toBe('cancelled');
      expect(mockAppointment.cancellationReason).toBe('Customer unavailable');
      expect(mockAppointment.save).toHaveBeenCalled();
      expect(notificationService.notifyAppointmentCancelled).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Appointment cancelled successfully',
        data: mockAppointment
      });
    });

    it('should use default cancellation reason if not provided', async () => {
      req.body = {};

      await AppointmentController.cancelAppointment(req, res);

      expect(mockAppointment.cancellationReason).toBe('Not specified');
    });
  });

  // ========================
  // TIME SLOT AVAILABILITY TESTS
  // ========================

  describe('getAvailableSlots', () => {
    beforeEach(() => {
      req.query = {
        date: '2025-12-15', // Updated to future date
        serviceIds: ['service1', 'service2'],
        vehicleCount: '1'
      };

      slotCalculator.isPastDateTime = jest.fn().mockReturnValue(false);
      slotCalculator.isBeyondBookingWindow = jest.fn().mockReturnValue(false);
      slotCalculator.isWorkingDay = jest.fn().mockReturnValue(true);
      slotCalculator.isBlockedDate = jest.fn().mockReturnValue(false);
      slotCalculator.generateTimeSlots = jest.fn().mockReturnValue([
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '11:00' }
      ]);
      slotCalculator.meetsMinimumNotice = jest.fn().mockReturnValue(true);
      slotCalculator.formatTimeDisplay = jest.fn().mockReturnValue('9:00 AM');
      slotCalculator.calculateMultiVehicleDuration = jest.fn().mockReturnValue(60);

      Service.find = jest.fn().mockResolvedValue([
        { _id: 'service1', name: 'Oil Change', estimatedDuration: 1 },
        { _id: 'service2', name: 'Brake Service', estimatedDuration: 2 }
      ]);

      appointmentValidator.checkSlotCapacity = jest.fn().mockResolvedValue({
        isAvailable: true,
        capacityRemaining: 2,
        capacityTotal: 3,
        currentBookings: 1
      });
    });

    it('should return available slots successfully', async () => {
      await AppointmentController.getAvailableSlots(req, res);

      expect(slotCalculator.generateTimeSlots).toHaveBeenCalled();
      expect(appointmentValidator.checkSlotCapacity).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          date: '2025-12-15',
          slots: expect.any(Array),
          summary: expect.objectContaining({
            fullyAvailable: expect.any(Number),
            limitedAvailable: expect.any(Number),
            fullyBooked: expect.any(Number)
          })
        })
      );
    });

    it('should return 400 if date is missing', async () => {
      req.query = {};

      await AppointmentController.getAvailableSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Date is required'
      });
    });

    it('should return 400 if date is in the past', async () => {
      slotCalculator.isPastDateTime.mockReturnValue(true);

      await AppointmentController.getAvailableSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot book appointments in the past'
      });
    });

    it('should return empty slots for non-working days', async () => {
      slotCalculator.isWorkingDay.mockReturnValue(false);

      await AppointmentController.getAvailableSlots(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        date: '2025-12-15',
        message: 'Selected date is not a working day',
        slots: []
      });
    });
  });

  // ========================
  // ERROR HANDLING TESTS
  // ========================

  describe('Error Handling', () => {
    beforeEach(() => {
      req.user = { _id: 'customer123', role: 'customer' };
    });

    it('should handle database errors in createAppointment', async () => {
      req.body = {
        vehicleId: 'vehicle123',
        serviceType: 'Oil Change',
        preferredDate: '2025-12-15',
        timeWindow: '09:00 AM - 11:00 AM'
      };

      Vehicle.findById = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await AppointmentController.createAppointment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to create appointment',
        error: 'Database connection failed'
      });
    });

    it('should handle database errors in getAllAppointments', async () => {
      Appointment.find = jest.fn().mockImplementation(() => {
        throw new Error('Query failed');
      });

      await AppointmentController.getAllAppointments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch appointments',
        error: 'Query failed'
      });
    });
  });
});