const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log('API_BASE_URL loaded:', API_BASE_URL);
console.log('Environment variables:', import.meta.env);

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    role: string;
    employeeId?: string;
    mobile?: string;
    department?: string;
    position?: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface CustomerOTPResponse {
  mobile: string;
  otpSent: boolean;
  expiresIn: number;
}

interface UserProfile {
  id: string;
  name: string;
  role: string;
  employeeId?: string;
  mobile?: string;
  department?: string;
  position?: string;
  isVerified?: boolean;
  isActive?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

class ApiService {
  private static getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  // Employee Authentication
  static async employeeLogin(employeeId: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/employee/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ employeeId, password }),
    });

    return this.handleResponse<LoginResponse>(response);
  }

  static async employeeRegister(
    employeeId: string,
    name: string,
    password: string,
    department?: string,
    position?: string
  ): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/employee/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ employeeId, name, password, department, position }),
    });

    return this.handleResponse(response);
  }

  // Customer Authentication
  static async customerSignup(mobile: string, name: string): Promise<ApiResponse> {
    console.log('API Call: customerSignup', { mobile, name });
    console.log('API Base URL:', API_BASE_URL);
    console.log('Full URL:', `${API_BASE_URL}/auth/customer/signup`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customer/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ mobile, name }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', response.headers);
      
      const result = await this.handleResponse(response);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('Network error in customerSignup:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      throw error;
    }
  }

  static async customerSendOTP(mobile: string): Promise<ApiResponse<CustomerOTPResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/customer/send-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile }),
    });

    return this.handleResponse<CustomerOTPResponse>(response);
  }

  static async customerVerifyOTP(mobile: string, otp: string): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/customer/verify-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ mobile, otp }),
    });

    return this.handleResponse<LoginResponse>(response);
  }

  // Common
  static async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    return this.handleResponse<LoginResponse>(response);
  }

  static async getProfile(): Promise<ApiResponse<{ user: UserProfile }>> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    return this.handleResponse(response);
  }

  static async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(true),
    });

    return this.handleResponse(response);
  }
}

export default ApiService;
export type { ApiResponse, LoginResponse, CustomerOTPResponse };