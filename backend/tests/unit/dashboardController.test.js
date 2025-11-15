const DashboardController = require('../../controllers/dashboardController');
const Appointment = require('../../models/Appointment');
const WorkLog = require('../../models/WorkLog');
const Vehicle = require('../../models/Vehicle');
const Service = require('../../models/Service');
const ServiceRecord = require('../../models/ServiceRecord');
const User = require('../../models/User');

// Mock all dependencies
jest.mock('../../models/Appointment');
jest.mock('../../models/WorkLog');
jest.mock('../../models/Vehicle');
jest.mock('../../models/Service');
jest.mock('../../models/ServiceRecord');
jest.mock('../../models/User');

describe('DashboardController', () => {
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
  // EMPLOYEE ANALYTICS TESTS
  // ========================

  describe('getEmployeeWeeklyWorkload', () => {
    const mockEmployee = {
      _id: 'emp123',
      role: 'employee',
      name: 'Jane Smith',
      employeeId: 'EMP001'
    };

    beforeEach(() => {
      req.user = mockEmployee;
    });

    it('should get employee weekly workload successfully', async () => {
      const mockAggregateResult = [
        { _id: '2025-11-10', count: 3 },
        { _id: '2025-11-11', count: 5 },
        { _id: '2025-11-12', count: 2 }
      ];

      ServiceRecord.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

      await DashboardController.getEmployeeWeeklyWorkload(req, res);

      expect(ServiceRecord.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            assignedEmployee: 'emp123',
            createdAt: { $gte: expect.any(Date) }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          labels: expect.any(Array),
          data: expect.any(Array),
          totalServices: expect.any(Number)
        })
      });
    });

    it('should handle empty workload data', async () => {
      ServiceRecord.aggregate = jest.fn().mockResolvedValue([]);

      await DashboardController.getEmployeeWeeklyWorkload(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          labels: expect.arrayContaining(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']),
          data: expect.any(Array),
          totalServices: 0
        })
      });
    });

    it('should handle database errors', async () => {
      ServiceRecord.aggregate = jest.fn().mockRejectedValue(new Error('Database error'));

      await DashboardController.getEmployeeWeeklyWorkload(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get weekly workload',
        error: 'Database error'
      });
    });
  });

  describe('getEmployeeAssignments', () => {
    const mockEmployee = {
      _id: 'emp123',
      role: 'employee',
      name: 'Jane Smith',
      employeeId: 'EMP001'
    };

    beforeEach(() => {
      req.user = mockEmployee;
    });

    it('should get employee assignments successfully', async () => {
      const mockAssignments = [
        {
          _id: 'assignment1',
          serviceType: 'Oil Change',
          serviceDescription: 'Regular maintenance',
          status: 'in-progress',
          timerStarted: true,
          timerDuration: 30,
          progressPercentage: 50,
          vehicleId: {
            make: 'Toyota',
            model: 'Camry',
            licensePlate: 'ABC-123',
            year: 2020
          },
          appointmentId: {
            _id: 'apt1',
            serviceType: 'Oil Change'
          },
          customerId: {
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1234567890'
          },
          createdAt: new Date('2025-11-15')
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockAssignments)
      };

      ServiceRecord.find = jest.fn().mockReturnValue(mockQuery);

      await DashboardController.getEmployeeAssignments(req, res);

      expect(ServiceRecord.find).toHaveBeenCalledWith({
        assignedEmployee: 'emp123',
        status: { $in: ['received', 'in-progress'] }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 'assignment1',
            serviceType: 'Oil Change',
            status: 'in-progress',
            vehicle: expect.objectContaining({
              make: 'Toyota',
              model: 'Camry',
              licensePlate: 'ABC-123'
            }),
            progressPercentage: 50
          })
        ])
      });
    });

    it('should handle empty assignments', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };

      ServiceRecord.find = jest.fn().mockReturnValue(mockQuery);

      await DashboardController.getEmployeeAssignments(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('getEmployeeAppointments', () => {
    const mockEmployee = {
      _id: 'emp123',
      role: 'employee',
      name: 'Jane Smith'
    };

    beforeEach(() => {
      req.user = mockEmployee;
    });

    it('should get employee appointments successfully', async () => {
      const mockAppointments = [
        {
          _id: 'apt1',
          serviceType: 'Oil Change',
          serviceDescription: 'Regular maintenance',
          appointmentDate: new Date('2025-11-20'),
          appointmentTime: '10:00',
          status: 'confirmed',
          estimatedDuration: '2 hours',
          estimatedCost: 150,
          vehicleId: {
            make: 'Honda',
            model: 'Civic',
            licensePlate: 'XYZ-789'
          },
          customerId: {
            firstName: 'Alice',
            lastName: 'Johnson',
            phoneNumber: '+1987654321'
          }
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockAppointments)
      };

      Appointment.find = jest.fn().mockReturnValue(mockQuery);

      await DashboardController.getEmployeeAppointments(req, res);

      expect(Appointment.find).toHaveBeenCalledWith({
        assignedEmployee: 'emp123',
        status: { $in: ['confirmed', 'in_progress', 'pending'] }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 'apt1',
            serviceType: 'Oil Change',
            vehicle: expect.objectContaining({
              make: 'Honda',
              model: 'Civic'
            }),
            customer: expect.objectContaining({
              name: 'Alice Johnson'
            })
          })
        ])
      });
    });
  });

  // ========================
  // CUSTOMER ANALYTICS TESTS
  // ========================

  describe('getCustomerServiceRecords', () => {
    const mockCustomer = {
      _id: 'customer123',
      role: 'customer',
      firstName: 'John',
      lastName: 'Doe'
    };

    beforeEach(() => {
      req.user = mockCustomer;
    });

    it('should get customer service records successfully', async () => {
      const mockServiceRecords = [
        {
          _id: 'record1',
          serviceType: 'Brake Service',
          serviceDescription: 'Brake pad replacement',
          status: 'in-progress',
          progressPercentage: 75,
          timerStarted: true,
          timerStartTime: new Date(Date.now() - 60000), // 1 minute ago
          timerDuration: 120000, // 2 minutes
          estimatedCost: 200,
          vehicleId: {
            make: 'BMW',
            model: 'X5',
            licensePlate: 'BMW-001'
          },
          assignedEmployee: {
            name: 'Mike Tech',
            position: 'Senior Technician'
          },
          createdAt: new Date('2025-11-15')
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockServiceRecords)
      };

      ServiceRecord.find = jest.fn().mockReturnValue(mockQuery);

      await DashboardController.getCustomerServiceRecords(req, res);

      expect(ServiceRecord.find).toHaveBeenCalledWith({
        customerId: 'customer123',
        status: { $in: ['received', 'in-progress', 'quality-check', 'completed'] }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 'record1',
            serviceType: 'Brake Service',
            status: 'in-progress',
            progress: expect.any(Number),
            vehicle: expect.objectContaining({
              make: 'BMW',
              model: 'X5'
            }),
            employee: expect.objectContaining({
              name: 'Mike Tech'
            })
          })
        ])
      });
    });

    it('should calculate progress and ETA correctly', async () => {
      const mockRecord = {
        _id: 'record1',
        serviceType: 'Oil Change',
        status: 'in-progress',
        progressPercentage: null,
        timerStarted: true,
        timerStartTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        timerDuration: 15 * 60 * 1000, // 15 minutes accumulated
        vehicleId: { make: 'Toyota', model: 'Camry' },
        assignedEmployee: { name: 'Tech User' },
        createdAt: new Date()
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockRecord])
      };

      ServiceRecord.find = jest.fn().mockReturnValue(mockQuery);

      await DashboardController.getCustomerServiceRecords(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            progress: expect.any(Number),
            eta: expect.any(Number)
          })
        ])
      });
    });
  });

  describe('getCustomerUpcomingAppointments', () => {
    const mockCustomer = {
      _id: 'customer123',
      role: 'customer'
    };

    beforeEach(() => {
      req.user = mockCustomer;
    });

    it('should get upcoming appointments successfully', async () => {
      const mockAppointments = [
        {
          _id: 'apt1',
          serviceType: 'Inspection',
          appointmentDate: new Date('2025-11-25'),
          appointmentTime: '14:00',
          status: 'confirmed',
          vehicleId: {
            make: 'Ford',
            model: 'F-150',
            licensePlate: 'FORD-123'
          },
          assignedEmployee: {
            name: 'Inspector Joe',
            position: 'Inspector'
          }
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockAppointments)
      };

      Appointment.find = jest.fn().mockReturnValue(mockQuery);

      await DashboardController.getCustomerUpcomingAppointments(req, res);

      expect(Appointment.find).toHaveBeenCalledWith({
        customerId: 'customer123',
        status: { $in: ['confirmed', 'in_progress', 'pending'] },
        appointmentDate: { $gte: expect.any(Date) }
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 'apt1',
            serviceType: 'Inspection',
            status: 'confirmed'
          })
        ])
      });
    });
  });

  describe('getCustomerRecentActivities', () => {
    const mockCustomer = {
      _id: 'customer123',
      role: 'customer'
    };

    beforeEach(() => {
      req.user = mockCustomer;
    });

    it('should get recent activities successfully', async () => {
      // Mock service records
      const mockServiceRecords = [
        {
          _id: 'record1',
          serviceType: 'Oil Change',
          status: 'completed',
          completedAt: new Date('2025-11-14'),
          actualCost: 150,
          paymentStatus: 'paid',
          updatedAt: new Date('2025-11-14')
        }
      ];

      const mockServiceQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockServiceRecords)
      };

      ServiceRecord.find = jest.fn().mockReturnValue(mockServiceQuery);

      // Mock appointments
      const mockAppointments = [
        {
          _id: 'apt1',
          serviceType: 'Brake Service',
          status: 'confirmed',
          updatedAt: new Date('2025-11-13')
        }
      ];

      const mockAppointmentQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockAppointments)
      };

      Appointment.find = jest.fn().mockReturnValue(mockAppointmentQuery);

      await DashboardController.getCustomerRecentActivities(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            action: expect.any(String),
            detail: expect.any(String),
            timeAgo: expect.any(String),
            type: expect.stringMatching(/service|payment|appointment/)
          })
        ])
      });
    });

    it('should format time ago correctly', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const mockServiceRecord = {
        serviceType: 'Oil Change',
        status: 'completed',
        completedAt: oneHourAgo,
        updatedAt: oneHourAgo
      };

      ServiceRecord.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockServiceRecord])
      });

      Appointment.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      });

      await DashboardController.getCustomerRecentActivities(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            timeAgo: expect.stringMatching(/hour/)
          })
        ])
      });
    });
  });

  // ========================
  // ADMIN ANALYTICS TESTS
  // ========================

  describe('getRevenueAnalytics', () => {
    beforeEach(() => {
      req.query = {
        startDate: '2025-11-01',
        endDate: '2025-11-15',
        period: 'daily'
      };
    });

    it('should get revenue analytics successfully', async () => {
      const mockRevenueData = [
        { _id: '2025-11-01', totalRevenue: 500, count: 3 },
        { _id: '2025-11-02', totalRevenue: 750, count: 5 }
      ];

      ServiceRecord.aggregate = jest.fn().mockResolvedValue(mockRevenueData);

      await DashboardController.getRevenueAnalytics(req, res);

      expect(ServiceRecord.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            status: 'completed',
            completedAt: {
              $gte: expect.any(Date),
              $lte: expect.any(Date)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
            },
            totalRevenue: { $sum: '$actualCost' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          labels: ['2025-11-01', '2025-11-02'],
          data: [500, 750],
          counts: [3, 5],
          totalRevenue: 1250,
          totalServices: 8
        }
      });
    });

    it('should return 400 if date parameters are missing', async () => {
      req.query = {};

      await DashboardController.getRevenueAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Start date and end date are required'
      });
    });

    it('should handle different period groupings', async () => {
      req.query.period = 'monthly';
      ServiceRecord.aggregate = jest.fn().mockResolvedValue([]);

      await DashboardController.getRevenueAnalytics(req, res);

      expect(ServiceRecord.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $group: expect.objectContaining({
              _id: { $dateToString: { format: '%Y-%m', date: '$completedAt' } }
            })
          })
        ])
      );
    });
  });

  describe('getAdminDashboardStats', () => {
    it('should get admin dashboard stats successfully', async () => {
      // Mock all the database calls
      User.countDocuments = jest.fn()
        .mockResolvedValueOnce(150) // totalCustomers
        .mockResolvedValueOnce(25); // totalEmployees

      ServiceRecord.aggregate = jest.fn().mockResolvedValue([
        { _id: null, totalRevenue: 50000 }
      ]);

      ServiceRecord.countDocuments = jest.fn()
        .mockResolvedValueOnce(5) // activeServices
        .mockResolvedValueOnce(200) // totalServices
        .mockResolvedValueOnce(10) // pendingServices
        .mockResolvedValueOnce(180); // completedServices

      const mockRecentServices = [
        {
          _id: 'service1',
          serviceType: 'Oil Change',
          assignedEmployee: { name: 'Tech 1' },
          vehicleId: { make: 'Toyota', model: 'Camry' },
          customerId: { firstName: 'John', lastName: 'Doe' }
        }
      ];

      const mockServiceQuery = {
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockRecentServices)
      };

      ServiceRecord.find = jest.fn().mockReturnValue(mockServiceQuery);

      await DashboardController.getAdminDashboardStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          totalCustomers: 150,
          totalRevenue: 50000,
          activeServices: 5,
          totalServices: 200,
          pendingServices: 10,
          completedServices: 180,
          totalEmployees: 25,
          recentServices: mockRecentServices
        }
      });
    });

    it('should handle zero revenue case', async () => {
      User.countDocuments = jest.fn().mockResolvedValue(0);
      ServiceRecord.aggregate = jest.fn().mockResolvedValue([]); // Empty result
      ServiceRecord.countDocuments = jest.fn().mockResolvedValue(0);
      ServiceRecord.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      });

      await DashboardController.getAdminDashboardStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalRevenue: 0
        })
      });
    });
  });

  describe('getEmployeePerformanceStats', () => {
    beforeEach(() => {
      req.query = {
        startDate: '2025-11-01',
        endDate: '2025-11-15'
      };
    });

    it('should get employee performance stats successfully', async () => {
      const mockPerformanceData = [
        {
          _id: 'emp1',
          completedServices: 25,
          totalRevenue: 5000,
          avgServiceTime: 120
        },
        {
          _id: 'emp2',
          completedServices: 20,
          totalRevenue: 4500,
          avgServiceTime: 150
        }
      ];

      ServiceRecord.aggregate = jest.fn().mockResolvedValue(mockPerformanceData);

      const mockEmployees = [
        { _id: 'emp1', name: 'John Tech', employeeId: 'EMP001' },
        { _id: 'emp2', name: 'Jane Tech', employeeId: 'EMP002' }
      ];

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockEmployees)
      });

      await DashboardController.getEmployeePerformanceStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [
          {
            employeeId: 'EMP001',
            employeeName: 'John Tech',
            completedServices: 25,
            totalRevenue: 5000,
            avgServiceTime: 120
          },
          {
            employeeId: 'EMP002',
            employeeName: 'Jane Tech',
            completedServices: 20,
            totalRevenue: 4500,
            avgServiceTime: 150
          }
        ]
      });
    });
  });

  // ========================
  // LEGACY DASHBOARD TESTS
  // ========================

  describe('getDashboardStats', () => {
    const mockEmployee = {
      _id: 'emp123',
      role: 'employee'
    };

    beforeEach(() => {
      req.user = mockEmployee;
    });

    it('should get dashboard stats for employee', async () => {
      // Mock all countDocuments calls
      Appointment.countDocuments = jest.fn()
        .mockResolvedValueOnce(50) // totalAppointments
        .mockResolvedValueOnce(10) // pendingAppointments
        .mockResolvedValueOnce(25) // confirmedAppointments
        .mockResolvedValueOnce(5)  // inServiceAppointments
        .mockResolvedValueOnce(8)  // completedAppointments
        .mockResolvedValueOnce(2); // cancelledAppointments

      await DashboardController.getDashboardStats(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          appointments: {
            total: 50,
            pending: 10,
            confirmed: 25,
            inService: 5,
            completed: 8,
            cancelled: 2
          },
          metrics: {
            onTimeRate: '16%', // 8/50 * 100 = 16%
            serviceBays: 5,
            weekOverWeekGrowth: '+8%'
          }
        }
      });
    });

    it('should filter appointments by customer for customer role', async () => {
      const mockCustomer = {
        _id: 'customer123',
        role: 'customer'
      };
      req.user = mockCustomer;

      Appointment.countDocuments = jest.fn().mockResolvedValue(10);

      await DashboardController.getDashboardStats(req, res);

      // Verify customer filter is applied
      expect(Appointment.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'customer123'
        })
      );
    });
  });

  describe('getTodaysSchedule', () => {
    const mockEmployee = {
      _id: 'emp123',
      role: 'employee'
    };

    beforeEach(() => {
      req.user = mockEmployee;
    });

    it('should get today\'s schedule successfully', async () => {
      const mockAppointments = [
        {
          _id: 'apt1',
          serviceType: 'Oil Change',
          timeWindow: '09:00 AM - 11:00 AM',
          status: 'confirmed'
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockAppointments)
      };

      Appointment.find = jest.fn().mockReturnValue(mockQuery);

      await DashboardController.getTodaysSchedule(req, res);

      expect(Appointment.find).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredDate: {
            $gte: expect.any(Date),
            $lt: expect.any(Date)
          },
          status: { $in: ['confirmed', 'in-service', 'pending'] }
        })
      );

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAppointments
      });
    });
  });

  describe('getServiceProgress', () => {
    beforeEach(() => {
      req.params = { appointmentId: 'apt123' };
    });

    it('should get service progress successfully', async () => {
      const mockAppointment = {
        _id: 'apt123',
        serviceType: 'Oil Change',
        currentStep: 2,
        serviceProgress: 'Repair',
        estimatedCompletion: new Date('2025-11-16')
      };

      const mockAppointmentQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockAppointmentQuery.populate.mockResolvedValue(mockAppointment);

      Appointment.findById = jest.fn().mockReturnValue(mockAppointmentQuery);

      const mockWorkLogs = [
        {
          _id: 'log1',
          duration: 2.5,
          technicianId: { name: 'Tech User' }
        }
      ];

      const mockWorkLogQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockWorkLogs)
      };

      WorkLog.find = jest.fn().mockReturnValue(mockWorkLogQuery);

      await DashboardController.getServiceProgress(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          appointment: mockAppointment,
          workLogs: mockWorkLogs,
          progress: {
            currentStep: 2,
            status: 'Repair',
            totalHours: '2.5h',
            estimatedCompletion: expect.any(Date)
          }
        }
      });
    });

    it('should return 404 if appointment not found', async () => {
      Appointment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis().mockResolvedValue(null)
      });

      await DashboardController.getServiceProgress(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Appointment not found'
      });
    });
  });

  // ========================
  // ERROR HANDLING TESTS
  // ========================

  describe('Error Handling', () => {
    it('should handle database errors in getCustomerDashboardStats', async () => {
      req.user = { _id: 'customer123', role: 'customer' };
      ServiceRecord.countDocuments = jest.fn().mockRejectedValue(new Error('DB Error'));

      await DashboardController.getCustomerDashboardStats(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get dashboard stats',
        error: 'DB Error'
      });
    });

    it('should handle aggregation errors in getAdminMonthlyAnalytics', async () => {
      ServiceRecord.aggregate = jest.fn().mockRejectedValue(new Error('Aggregation failed'));

      await DashboardController.getAdminMonthlyAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get monthly analytics',
        error: 'Aggregation failed'
      });
    });
  });
});