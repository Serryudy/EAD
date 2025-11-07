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
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  userId: number;
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
  addVehicle: async (vehicleData: Omit<VehicleDto, 'id' | 'userId'>): Promise<ApiResponse<VehicleDto>> => {
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