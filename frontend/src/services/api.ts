const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log('API_BASE_URL loaded:', API_BASE_URL);
console.log('Environment variables:', import.meta.env);

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  autoAssigned?: boolean;
  assignedTo?: {
    id: string;
    name: string;
  } | null;
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

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  make: string;
  model: string;
  year: number;
  type: string;
}

interface Appointment {
  _id: string;
  customerId: {
    _id: string;
    name: string;
    mobile?: string;
    email?: string;
  } | string; // Can be populated object or just ID string
  vehicleId: {
    _id: string;
    vehicleNumber: string;
    make?: string;
    model?: string;
    year?: number;
    type?: string;
  } | string; // Can be populated object or just ID string
  serviceType: string;
  serviceDescription?: string;
  preferredDate: string;
  timeWindow?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status: 'pending' | 'confirmed' | 'in-service' | 'completed' | 'cancelled';
  assignedEmployee?: {
    _id: string;
    name: string;
    employeeId?: string;
  } | string;
  employeeName?: string;
  estimatedDuration?: string;
  estimatedCost?: number;
  actualCost?: number;
  additionalNotes?: string;
  paymentStatus?: 'pending' | 'deposit-paid' | 'fully-paid';
  paymentData?: {
    cardHolderName?: string;
    cardNumber?: string;
    paymentDate?: string;
  };
  serviceProgress?: {
    stage: string;
    status: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
  }[];
  cancellationReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CreateAppointmentData {
  vehicleId: string; // Now required - reference to vehicle
  serviceType: string;
  serviceDescription?: string;
  preferredDate: string;
  timeWindow?: string;
  additionalNotes?: string;
  estimatedDuration?: string;
  estimatedCost?: number;
  paymentData?: {
    cardHolderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
}

interface AppointmentsResponse {
  appointments?: Appointment[];
  data?: Appointment[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class ApiService {
  private static getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Note: With HTTP-only cookies, we don't need to manually add Authorization header
    // The browser will automatically send cookies with credentials: 'include'
    // Keep this for backward compatibility with token-based auth
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
      credentials: 'include', // Important: Send and receive cookies
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
      credentials: 'include', // Important: Send and receive cookies
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
        credentials: 'include', // Important: Send and receive cookies
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
      credentials: 'include', // Important: Send and receive cookies
      body: JSON.stringify({ mobile }),
    });

    return this.handleResponse<CustomerOTPResponse>(response);
  }

  static async customerVerifyOTP(mobile: string, otp: string): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/customer/verify-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include', // Important: Send and receive cookies
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
      credentials: 'include', // Important: Send and receive cookies
    });

    return this.handleResponse<LoginResponse>(response);
  }

  static async getProfile(): Promise<ApiResponse<{ user: UserProfile }>> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include', // Important: Send cookies for authentication
    });

    return this.handleResponse(response);
  }

  static async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(true),
      credentials: 'include', // Important: Send cookies to clear them
    });

    return this.handleResponse(response);
  }

  // Appointments
  static async createAppointment(appointmentData: CreateAppointmentData): Promise<ApiResponse<Appointment>> {
    console.log('API Call: createAppointment', appointmentData);
    console.log('Full URL:', `${API_BASE_URL}/appointments`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: this.getHeaders(true),
        credentials: 'include', // Important: Send cookies to identify user
        body: JSON.stringify(appointmentData),
      });

      console.log('Response status:', response.status);
      const result = await this.handleResponse<Appointment>(response);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  static async getAllAppointments(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    customerId?: string;
    employeeId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<AppointmentsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_BASE_URL}/appointments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    console.log('API Call: getAllAppointments', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true),
        credentials: 'include', // Important: Send cookies for authentication
      });

      const result = await this.handleResponse<AppointmentsResponse>(response);
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  static async getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include', // Important: Send cookies for authentication
    });

    return this.handleResponse<Appointment>(response);
  }

  static async updateAppointment(id: string, updateData: Partial<CreateAppointmentData>): Promise<ApiResponse<Appointment>> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(updateData),
    });

    return this.handleResponse<Appointment>(response);
  }

  static async updateAppointmentStatus(
    id: string,
    status: string,
    cancellationReason?: string
  ): Promise<ApiResponse<Appointment>> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      credentials: 'include',
      body: JSON.stringify({ status, cancellationReason }),
    });

    return this.handleResponse<Appointment>(response);
  }

  static async rescheduleAppointment(
    id: string,
    rescheduleData: {
      preferredDate?: string;
      timeWindow?: string;
      scheduledDate?: string;
      scheduledTime?: string;
    }
  ): Promise<ApiResponse<Appointment>> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(rescheduleData),
    });

    return this.handleResponse<Appointment>(response);
  }

  static async assignEmployee(id: string, employeeId: string): Promise<ApiResponse<Appointment>> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/assign`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      credentials: 'include',
      body: JSON.stringify({ employeeId }),
    });

    return this.handleResponse<Appointment>(response);
  }

  static async cancelAppointment(id: string, cancellationReason: string): Promise<ApiResponse<Appointment>> {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      credentials: 'include',
      body: JSON.stringify({ cancellationReason }),
    });

    return this.handleResponse<Appointment>(response);
  }

  static async getAppointmentStats(params?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    total: number;
    pending: number;
    confirmed: number;
    'in-service': number;
    completed: number;
    cancelled: number;
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_BASE_URL}/appointments/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  static async getEmployeeAppointments(
    employeeId: string,
    params?: {
      status?: string;
      date?: string;
    }
  ): Promise<ApiResponse<Appointment[]>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_BASE_URL}/appointments/employee/${employeeId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include',
    });

    return this.handleResponse<Appointment[]>(response);
  }

  // Service Records
  static async startService(
    appointmentId: string,
    data?: {
      initialInspectionNotes?: string;
      customerComplaints?: string[];
      estimatedCompletionTime?: string;
      serviceStages?: string[];
    }
  ): Promise<ApiResponse<any>> {
    console.log('API Call: startService', appointmentId, data);
    
    const response = await fetch(`${API_BASE_URL}/service-records/start/${appointmentId}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(data || {})
    });

    return this.handleResponse(response);
  }

  static async getServiceRecordByAppointment(appointmentId: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/service-records/appointment/${appointmentId}`, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  static async getServiceRecordById(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/service-records/${id}`, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  static async updateServiceProgress(
    id: string,
    data: {
      stage: string;
      status: string;
      notes?: string;
      completedBy?: string;
    }
  ): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/service-records/${id}/progress`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  static async addWorkLog(
    serviceRecordId: string,
    data: {
      task: string;
      description?: string;
      technicianId?: string;
      technicianName?: string;
      estimatedDuration?: number;
      notes?: string;
      partsUsed?: any[];
      laborCost?: number;
    }
  ): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/service-records/${serviceRecordId}/worklog`, {
      method: 'POST',
      headers: this.getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  static async completeService(
    serviceRecordId: string,
    data: {
      finalInspectionNotes?: string;
      workPerformed?: string[];
      recommendedServices?: string[];
      qualityCheckNotes?: string;
      totalLaborCost?: number;
      partsUsed?: any[];
    }
  ): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/service-records/${serviceRecordId}/complete`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  static async getAllServiceRecords(params?: {
    status?: string;
    assignedEmployee?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = `${API_BASE_URL}/service-records${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  // Vehicle APIs
  static async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'GET',
      headers: this.getHeaders(true),
      credentials: 'include',
    });

    return this.handleResponse(response);
  }

  // Profile Picture APIs
  static async uploadProfilePicture(file: File): Promise<ApiResponse<{ profilePicture: string }>> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/profile/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  static async deleteProfilePicture(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/profile/delete`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });

    return this.handleResponse(response);
  }

  static async getProfilePicture(): Promise<ApiResponse<{ profilePicture: string | null }>> {
    const response = await fetch(`${API_BASE_URL}/profile/picture`, {
      method: 'GET',
      headers: this.getHeaders(true),
    });

    return this.handleResponse(response);
  }
}

export default ApiService;
export type { 
  ApiResponse, 
  LoginResponse, 
  CustomerOTPResponse, 
  Appointment, 
  CreateAppointmentData, 
  AppointmentsResponse,
  Vehicle,
  UserProfile
};