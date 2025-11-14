const AuthController = require('../../controllers/authController');
const User = require('../../models/User');
const JWTService = require('../../services/jwtService');
const smsService = require('../../services/emailService');
const OTPService = require('../../services/otpService');

// Mock all dependencies
jest.mock('../../models/User');
jest.mock('../../services/jwtService');
jest.mock('../../services/emailService');
jest.mock('../../services/otpService');

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      user: null,
      query: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };

    // Mock console methods to keep test output clean
    console.error = jest.fn();
    console.log = jest.fn();
  });

  // ========================
  // EMPLOYEE AUTHENTICATION TESTS
  // ========================

  describe('employeeLogin', () => {
    it('should login employee successfully with valid credentials', async () => {
      const mockEmployee = {
        _id: 'emp123',
        employeeId: 'EMP001',
        name: 'John Doe',
        role: 'employee',
        department: 'IT',
        position: 'Developer',
        lastLogin: new Date()
      };

      const mockTokens = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123'
      };

      req.body = {
        employeeId: 'EMP001',
        password: 'password123'
      };

      User.findEmployeeByCredentials = jest.fn().mockResolvedValue(mockEmployee);
      JWTService.generateTokenPair = jest.fn().mockReturnValue(mockTokens);

      await AuthController.employeeLogin(req, res);

      expect(User.findEmployeeByCredentials).toHaveBeenCalledWith('EMP001', 'password123');
      expect(JWTService.generateTokenPair).toHaveBeenCalledWith(mockEmployee);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Employee login successful'
        })
      );
    });

    it('should return 400 if employeeId or password is missing', async () => {
      req.body = { employeeId: 'EMP001' };

      await AuthController.employeeLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide employee ID and password'
      });
    });

    it('should return 401 on invalid credentials', async () => {
      req.body = {
        employeeId: 'EMP001',
        password: 'wrongpassword'
      };

      User.findEmployeeByCredentials = jest.fn().mockRejectedValue(
        new Error('Invalid credentials')
      );

      await AuthController.employeeLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });
  });

  describe('employeeRegister', () => {
    it('should register new employee successfully', async () => {
      const mockEmployee = {
        _id: 'emp123',
        employeeId: 'EMP001',
        name: 'John Doe',
        role: 'employee',
        department: 'IT',
        position: 'Developer',
        isActive: true,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        employeeId: 'emp001',
        name: 'John Doe',
        password: 'password123',
        department: 'IT',
        position: 'Developer'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue(mockEmployee);

      await AuthController.employeeRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Employee registration successful'
        })
      );
    });

    it('should return 400 if password is too short', async () => {
      req.body = {
        employeeId: 'EMP001',
        name: 'John Doe',
        password: '123'
      };

      await AuthController.employeeRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    });

    it('should return 409 if employee ID already exists', async () => {
      req.body = {
        employeeId: 'EMP001',
        name: 'John Doe',
        password: 'password123'
      };

      User.findOne = jest.fn().mockResolvedValue({ employeeId: 'EMP001' });

      await AuthController.employeeRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Employee ID already exists'
      });
    });
  });

  // ========================
  // ADMIN AUTHENTICATION TESTS
  // ========================

  describe('adminLogin', () => {
    it('should login admin successfully', async () => {
      const mockAdmin = {
        _id: 'admin123',
        username: 'admin',
        name: 'Admin User',
        role: 'admin',
        lastLogin: new Date()
      };

      const mockTokens = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123'
      };

      req.body = {
        username: 'admin',
        password: 'adminpass123'
      };

      User.findAdminByCredentials = jest.fn().mockResolvedValue(mockAdmin);
      JWTService.generateTokenPair = jest.fn().mockReturnValue(mockTokens);

      await AuthController.adminLogin(req, res);

      expect(User.findAdminByCredentials).toHaveBeenCalledWith('admin', 'adminpass123');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Admin login successful'
        })
      );
    });

    it('should return 400 if credentials are missing', async () => {
      req.body = { username: 'admin' };

      await AuthController.adminLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide username and password'
      });
    });
  });

  describe('adminRegister', () => {
    it('should register new admin successfully', async () => {
      const mockAdmin = {
        _id: 'admin123',
        username: 'newadmin',
        name: 'New Admin',
        role: 'admin',
        isActive: true,
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        username: 'newadmin',
        password: 'password12345',
        name: 'New Admin'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue(mockAdmin);

      await AuthController.adminRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Admin account created successfully'
        })
      );
    });

    it('should return 400 if password is too short', async () => {
      req.body = {
        username: 'admin',
        password: 'short',
        name: 'Admin'
      };

      await AuthController.adminRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    });
  });

  // ========================
  // CUSTOMER AUTHENTICATION TESTS
  // ========================

  describe('customerSignup', () => {
    it('should signup customer successfully', async () => {
      const mockCustomer = {
        _id: 'cust123',
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '+94712345678',
        email: 'jane@example.com',
        role: 'customer',
        isVerified: false,
        save: jest.fn().mockResolvedValue(true)
      };

      const mockTokens = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123'
      };

      req.body = {
        phoneNumber: '0712345678',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com'
      };

      OTPService.isValidMobile = jest.fn().mockReturnValue(true);
      OTPService.formatMobile = jest.fn().mockReturnValue('+94712345678');
      User.findOne = jest.fn().mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue(mockCustomer);
      JWTService.generateTokenPair = jest.fn().mockReturnValue(mockTokens);
      smsService.sendWelcomeSMS = jest.fn().mockResolvedValue(true);

      await AuthController.customerSignup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Customer account created successfully.'
        })
      );
      expect(smsService.sendWelcomeSMS).toHaveBeenCalled();
    });

    it('should return 400 for invalid phone number', async () => {
      req.body = {
        phoneNumber: '123',
        firstName: 'Jane'
      };

      OTPService.isValidMobile = jest.fn().mockReturnValue(false);

      await AuthController.customerSignup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    });

    it('should return 409 if phone number already exists', async () => {
      req.body = {
        phoneNumber: '0712345678',
        firstName: 'Jane'
      };

      OTPService.isValidMobile = jest.fn().mockReturnValue(true);
      OTPService.formatMobile = jest.fn().mockReturnValue('+94712345678');
      User.findOne = jest.fn().mockResolvedValue({ phoneNumber: '+94712345678' });

      await AuthController.customerSignup(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'A user with this phone number already exists in the system. Please login instead.'
      });
    });
  });

  describe('customerSendOTP', () => {
    it('should send OTP successfully', async () => {
      const mockCustomer = {
        _id: 'cust123',
        phoneNumber: '+94712345678',
        firstName: 'Jane',
        role: 'customer',
        isActive: true,
        generateOTP: jest.fn().mockReturnValue('123456'),
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = { phoneNumber: '0712345678' };

      OTPService.isValidMobile = jest.fn().mockReturnValue(true);
      OTPService.formatMobile = jest.fn().mockReturnValue('+94712345678');
      OTPService.checkRateLimit = jest.fn().mockReturnValue({ allowed: true });
      OTPService.maskMobile = jest.fn().mockReturnValue('*******5678');
      User.findOne = jest.fn().mockResolvedValue(mockCustomer);
      smsService.sendCustomerOTP = jest.fn().mockResolvedValue(true);

      await AuthController.customerSendOTP(req, res);

      expect(mockCustomer.generateOTP).toHaveBeenCalled();
      expect(smsService.sendCustomerOTP).toHaveBeenCalledWith('+94712345678', '123456', 'Jane');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'OTP sent successfully'
        })
      );
    });

    it('should return 429 if rate limit exceeded', async () => {
      req.body = { phoneNumber: '0712345678' };

      OTPService.isValidMobile = jest.fn().mockReturnValue(true);
      OTPService.formatMobile = jest.fn().mockReturnValue('+94712345678');
      OTPService.checkRateLimit = jest.fn().mockReturnValue({ 
        allowed: false, 
        message: 'Too many requests' 
      });

      await AuthController.customerSendOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Too many requests'
      });
    });

    it('should return 404 if customer not found', async () => {
      req.body = { phoneNumber: '0712345678' };

      OTPService.isValidMobile = jest.fn().mockReturnValue(true);
      OTPService.formatMobile = jest.fn().mockReturnValue('+94712345678');
      OTPService.checkRateLimit = jest.fn().mockReturnValue({ allowed: true });
      User.findOne = jest.fn().mockResolvedValue(null);

      await AuthController.customerSendOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Customer not found. Please sign up first.'
      });
    });
  });

  describe('customerVerifyOTP', () => {
    it('should verify OTP and login successfully', async () => {
      const mockCustomer = {
        _id: 'cust123',
        firstName: 'Jane',
        lastName: 'Doe',
        phoneNumber: '+94712345678',
        role: 'customer',
        isVerified: true,
        isActive: true,
        lastLogin: new Date(),
        verifyOTP: jest.fn(),
        save: jest.fn().mockResolvedValue(true)
      };

      const mockTokens = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123'
      };

      req.body = {
        phoneNumber: '0712345678',
        otp: '123456'
      };

      OTPService.formatMobile = jest.fn().mockReturnValue('+94712345678');
      OTPService.maskMobile = jest.fn().mockReturnValue('*******5678');
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCustomer)
      });
      JWTService.generateTokenPair = jest.fn().mockReturnValue(mockTokens);

      await AuthController.customerVerifyOTP(req, res);

      expect(mockCustomer.verifyOTP).toHaveBeenCalledWith('123456');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Customer login successful'
        })
      );
    });

    it('should return 400 if OTP is invalid', async () => {
      const mockCustomer = {
        _id: 'cust123',
        phoneNumber: '+94712345678',
        role: 'customer',
        isActive: true,
        verifyOTP: jest.fn().mockImplementation(() => {
          throw new Error('Invalid OTP');
        }),
        save: jest.fn().mockResolvedValue(true)
      };

      req.body = {
        phoneNumber: '0712345678',
        otp: '000000'
      };

      OTPService.formatMobile = jest.fn().mockReturnValue('+94712345678');
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockCustomer)
      });

      await AuthController.customerVerifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid OTP'
      });
    });
  });

  // ========================
  // COMMON FUNCTIONALITY TESTS
  // ========================

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockUser = {
        _id: 'user123',
        role: 'customer',
        firstName: 'Jane',
        phoneNumber: '+94712345678',
        isVerified: true
      };

      const mockTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token'
      };

      req.user = mockUser;
      JWTService.generateTokenPair = jest.fn().mockReturnValue(mockTokens);
      OTPService.maskMobile = jest.fn().mockReturnValue('*******5678');

      await AuthController.refreshToken(req, res);

      expect(JWTService.generateTokenPair).toHaveBeenCalledWith(mockUser);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Token refreshed successfully'
        })
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      req.user = {
        role: 'customer',
        mobile: '+94712345678'
      };

      await AuthController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });

  describe('getProfile', () => {
    it('should get employee profile', async () => {
      const mockEmployee = {
        _id: 'emp123',
        employeeId: 'EMP001',
        name: 'John Doe',
        role: 'employee',
        department: 'IT',
        position: 'Developer',
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      req.user = mockEmployee;

      await AuthController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              employeeId: 'EMP001'
            })
          })
        })
      );
    });

    it('should get customer profile', async () => {
      const mockCustomer = {
        _id: 'cust123',
        firstName: 'Jane',
        phoneNumber: '+94712345678',
        role: 'customer',
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      req.user = mockCustomer;
      OTPService.maskMobile = jest.fn().mockReturnValue('*******5678');

      await AuthController.getProfile(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            user: expect.objectContaining({
              firstName: 'Jane'
            })
          })
        })
      );
    });
  });

  describe('getAllCustomers', () => {
    it('should get all customers with pagination', async () => {
      const mockCustomers = [
        {
          _id: 'cust1',
          firstName: 'Jane',
          phoneNumber: '+94712345678',
          role: 'customer',
          toObject: jest.fn().mockReturnThis()
        },
        {
          _id: 'cust2',
          firstName: 'John',
          phoneNumber: '+94787654321',
          role: 'customer',
          toObject: jest.fn().mockReturnThis()
        }
      ];

      req.query = { page: 1, limit: 10 };

      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockCustomers)
      });
      User.countDocuments = jest.fn().mockResolvedValue(2);
      OTPService.maskMobile = jest.fn().mockReturnValue('*******5678');

      await AuthController.getAllCustomers(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            customers: expect.any(Array),
            pagination: expect.objectContaining({
              current: 1,
              total: 2
            })
          })
        })
      );
    });
  });
});