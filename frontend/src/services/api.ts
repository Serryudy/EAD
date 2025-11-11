// API Base URL - adjust this to match your backend
const API_BASE_URL = 'http://localhost:5000/api';

// Request types
export interface OtpRequestDto {
  phoneNumber: string;
}

export interface OtpVerificationDto {
  phoneNumber: string;
  otp: string;  // Backend expects 'otp' not 'otpCode'
}

export interface CustomerSignupDto {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  nic?: string;
  email?: string;
  address?: string;
}

export interface EmployeeLoginDto {
  employeeId: string;
  password: string;
}

export interface AdminLoginDto {
  employeeId: string;
  password: string;
}

export interface UserUpdateDto {
  firstName: string;
  lastName: string;
  email: string;
  nic?: string;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponseDto {
  token?: string;  // For backward compatibility
  accessToken?: string;  // JWT access token
  refreshToken?: string;  // JWT refresh token
  tokenType?: string;
  user: UserDto;
}

export interface UserDto {
  _id: string;  // MongoDB uses _id
  firstName: string;
  lastName: string;
  nic?: string;
  email?: string;
  phoneNumber: string;
  role: 'customer' | 'employee' | 'admin';
  employeeId?: string;
  username?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface VehicleDto {
  _id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  ownerId: string;
  ownerName?: string;
  isActive?: boolean;
  type?: string;
  color?: string;
  mileage?: number;
  engineType?: string;
}

export interface ChatMessageDto {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatRequestDto {
  message: string;
  conversationHistory?: ChatMessageDto[];
}

export interface ChatResponseDto {
  message: string;
  isLoading?: boolean;
  isError?: boolean;
  timestamp: Date;
}

// API utility function
async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Get token from sessionStorage if available (fallback)
  const token = sessionStorage.getItem('authToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Include HTTP-only cookies in requests
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Handle HTTP errors
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Auth API functions
export const authApi = {
  // Customer: Send OTP
  requestOtp: async (data: OtpRequestDto): Promise<ApiResponse<string>> => {
    return apiCall<string>('/auth/customer/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Customer: Verify OTP and login
  verifyOtp: async (data: OtpVerificationDto): Promise<ApiResponse<AuthResponseDto>> => {
    return apiCall<AuthResponseDto>('/auth/customer/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Customer: Signup (create account)
  signup: async (data: CustomerSignupDto): Promise<ApiResponse<AuthResponseDto>> => {
    return apiCall<AuthResponseDto>('/auth/customer/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Employee login
  employeeLogin: async (data: EmployeeLoginDto): Promise<ApiResponse<AuthResponseDto>> => {
    return apiCall<AuthResponseDto>('/auth/employee/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin login
  adminLogin: async (data: AdminLoginDto): Promise<ApiResponse<AuthResponseDto>> => {
    return apiCall<AuthResponseDto>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: data.employeeId, password: data.password }),
    });
  },

  // Logout (clear token)
  logout: async (): Promise<void> => {
    // Clear sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Clear all sessionStorage
    sessionStorage.clear();
  },
};

// User API functions
export const userApi = {
  // Get current user profile from backend
  getProfile: async (): Promise<ApiResponse<UserDto>> => {
    return apiCall<UserDto>('/profile', {
      method: 'GET',
    });
  },

  // Update user profile
  updateProfile: async (data: UserUpdateDto): Promise<ApiResponse<UserDto>> => {
    return apiCall<UserDto>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Vehicle API functions
export const vehicleApi = {
  // Add vehicle for customer
  addVehicle: async (vehicleData: Omit<VehicleDto, '_id' | 'ownerId' | 'ownerName' | 'isActive'>): Promise<ApiResponse<VehicleDto>> => {
    return apiCall<VehicleDto>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  },

  // Get user vehicles
  getUserVehicles: async (): Promise<ApiResponse<VehicleDto[]>> => {
    return apiCall<VehicleDto[]>('/vehicles');
  },

  // Update vehicle
  updateVehicle: async (vehicleId: string, vehicleData: Partial<VehicleDto>): Promise<ApiResponse<VehicleDto>> => {
    return apiCall<VehicleDto>(`/vehicles/${vehicleId}`, {
      method: 'PATCH',
      body: JSON.stringify(vehicleData),
    });
  },

    // Delete vehicle
  deleteVehicle: async (vehicleId: string): Promise<ApiResponse<string>> => {
    return apiCall<string>(`/vehicles/${vehicleId}`, {
      method: 'DELETE',
    });
  },
};

// Chatbot API functions
export const chatbotApi = {
  // Send message to AI chatbot
  sendMessage: async (data: ChatRequestDto): Promise<ApiResponse<ChatResponseDto>> => {
    return apiCall<ChatResponseDto>('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Check chatbot health
  checkHealth: async (): Promise<ApiResponse<{ status: string; apiKeyConfigured: boolean }>> => {
    return apiCall('/chatbot/health');
  },
};

// Appointment DTOs
export interface AppointmentDto {
  _id: string;
  customerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
  };
  vehicleId?: {
    _id: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  serviceType: string;
  serviceDescription?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  assignedEmployee?: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  estimatedDuration?: string;
  estimatedCost?: number;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Appointment API functions
export const appointmentApi = {
  // Get all appointments (admin can see all, employee sees all, customer sees only their own)
  getAllAppointments: async (filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    customerId?: string;
    employeeId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<AppointmentDto[]>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const queryString = params.toString();
    return apiCall<AppointmentDto[]>(`/appointments${queryString ? `?${queryString}` : ''}`);
  },

  // Get appointments for a specific employee
  getEmployeeAppointments: async (employeeId: string, status?: string): Promise<ApiResponse<AppointmentDto[]>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const queryString = params.toString();
    
    return apiCall<AppointmentDto[]>(`/appointments/employee/${employeeId}${queryString ? `?${queryString}` : ''}`);
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId: string, status: string): Promise<ApiResponse<AppointmentDto>> => {
    return apiCall<AppointmentDto>(`/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string): Promise<ApiResponse<AppointmentDto>> => {
    return apiCall<AppointmentDto>(`/appointments/${appointmentId}`);
  },
};

// Work Log DTOs
export interface WorkLogDto {
  _id: string;
  appointmentId: string;
  technicianId: string;
  startTime: string;
  endTime?: string;
  hoursWorked?: number;
  workDescription: string;
  status: 'in-progress' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

// Work Log API functions
export const workLogApi = {
  // Create a new work log (start timer)
  createWorkLog: async (appointmentId: string, workDescription: string): Promise<ApiResponse<WorkLogDto>> => {
    return apiCall<WorkLogDto>('/work-logs', {
      method: 'POST',
      body: JSON.stringify({
        appointmentId,
        workDescription,
        startTime: new Date().toISOString(),
        status: 'in-progress'
      }),
    });
  },

  // Complete a work log (stop timer)
  completeWorkLog: async (workLogId: string): Promise<ApiResponse<WorkLogDto>> => {
    return apiCall<WorkLogDto>(`/work-logs/${workLogId}/complete`, {
      method: 'PATCH',
    });
  },

  // Get work logs for an appointment
  getWorkLogsByAppointment: async (appointmentId: string): Promise<ApiResponse<WorkLogDto[]>> => {
    return apiCall<WorkLogDto[]>(`/work-logs/appointment/${appointmentId}`);
  },

  // Get technician work summary
  getTechnicianSummary: async (technicianId: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/work-logs/technician/${technicianId}/summary`);
  },
};

// Employee Management API
export const employeeApi = {
  // Get all employees
  getAllEmployees: async (): Promise<ApiResponse<UserDto[]>> => {
    return apiCall<UserDto[]>('/users?role=employee');
  },

  // Create new employee
  createEmployee: async (employeeData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nic: string;
    password: string;
  }): Promise<ApiResponse<UserDto>> => {
    return apiCall<UserDto>('/auth/register/employee', {
      method: 'POST',
      body: JSON.stringify({
        ...employeeData,
        role: 'employee'
      }),
    });
  },

  // Update employee
  updateEmployee: async (employeeId: string, employeeData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nic: string;
    isActive: boolean;
  }>): Promise<ApiResponse<UserDto>> => {
    return apiCall<UserDto>(`/users/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  },

  // Delete employee (soft delete - set isActive to false)
  deleteEmployee: async (employeeId: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/users/${employeeId}`, {
      method: 'DELETE',
    });
  },

  // Get employee by ID
  getEmployeeById: async (employeeId: string): Promise<ApiResponse<UserDto>> => {
    return apiCall<UserDto>(`/users/${employeeId}`);
  },
};

// Service Record API
export const serviceRecordApi = {
  // Transfer appointment to service record
  transferAppointmentToService: async (
    appointmentId: string,
    data: {
      assignedEmployeeId: string;
      estimatedCompletionTime?: string;
    }
  ): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/service-records/from-appointment/${appointmentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Dashboard API
export const dashboardApi = {
  // Get employee assignments with timer and progress
  getEmployeeAssignments: async (): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>('/dashboard/employee/assignments');
  },

  // Get employee appointments (upcoming appointments)
  getEmployeeAppointments: async (): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>('/dashboard/employee/appointments');
  },

  // Get employee weekly workload
  getEmployeeWeeklyWorkload: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/dashboard/employee/weekly-workload');
  },

  // Start service timer
  startServiceTimer: async (serviceRecordId: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/service-records/${serviceRecordId}/start-timer`, {
      method: 'POST',
    });
  },

  // Stop service timer
  stopServiceTimer: async (serviceRecordId: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/service-records/${serviceRecordId}/stop-timer`, {
      method: 'POST',
    });
  },

  // Update service progress
  updateServiceProgress: async (serviceRecordId: string, progressPercentage: number, liveUpdate?: string): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/service-records/${serviceRecordId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progressPercentage, liveUpdate }),
    });
  },

  // Get customer service records with progress
  getCustomerServiceRecords: async (): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>('/dashboard/customer/service-records');
  },

  // Get customer upcoming appointments
  getCustomerUpcomingAppointments: async (): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>('/dashboard/customer/upcoming-appointments');
  },

  // Get customer recent activities
  getCustomerRecentActivities: async (): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>('/dashboard/customer/recent-activities');
  },

  // Get admin dashboard stats
  getAdminStats: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/dashboard/admin/stats');
  },

  // Get admin monthly analytics (for charts)
  getAdminMonthlyAnalytics: async (): Promise<ApiResponse<any[]>> => {
    return apiCall<any[]>('/dashboard/admin/monthly-analytics');
  },
};

// Service API
export const serviceApi = {
  // Get all services
  getAllServices: async (params?: {
    category?: string;
    isActive?: boolean;
    isPopular?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<any[]>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return apiCall<any[]>(`/services?${queryParams.toString()}`);
  },

  // Update service
  updateService: async (serviceId: string, data: any): Promise<ApiResponse<any>> => {
    return apiCall<any>(`/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete service
  deleteService: async (serviceId: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(`/services/${serviceId}`, {
      method: 'DELETE',
    });
  },
};

// Chatbot types
export interface ChatMessageDto {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export interface ChatRequestDto {
  message: string;
  conversationHistory?: ChatMessageDto[];
}

export interface ChatResponseDto {
  message?: string;  // Backend returns 'message'
  response?: string; // Fallback for compatibility
  source?: 'database' | 'ai' | 'fallback';
  isLoading?: boolean;
  timestamp?: string;
}

// Chatbot API
export const chatbotApi = {
  // Send message to chatbot
  sendMessage: async (message: string, conversationHistory?: ChatMessageDto[]): Promise<ApiResponse<ChatResponseDto>> => {
    return apiCall<ChatResponseDto>('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory }),
    });
  },

  // Check chatbot health
  checkHealth: async (): Promise<ApiResponse<any>> => {
    return apiCall<any>('/chatbot/health');
  },
};


