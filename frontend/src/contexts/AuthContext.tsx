import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, userApi, type UserDto, type CustomerSignupDto } from '../services/api';

export type UserRole = 'customer' | 'employee' | 'admin' | null;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  nic?: string;
  role: UserRole;
  employeeId?: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phoneNumber: string, otpCode: string) => Promise<void>;
  logout: () => void;
  signup: (signupData: CustomerSignupDto) => Promise<void>;
  requestOtp: (phoneNumber: string) => Promise<void>;
  verifyOtp: (phoneNumber: string, otpCode: string) => Promise<void>;
  verifyOtpOnly: (phoneNumber: string, otpCode: string) => Promise<void>;
  employeeLogin: (employeeId: string, password: string) => Promise<void>;
  adminLogin: (employeeId: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert backend UserDto to frontend User
const convertUserDto = (userDto: UserDto): User => {
  return {
    id: userDto._id,  // MongoDB uses _id
    firstName: userDto.firstName,
    lastName: userDto.lastName,
    phone: userDto.phoneNumber,
    email: userDto.email,
    nic: userDto.nic,
    role: userDto.role as UserRole,
    employeeId: userDto.employeeId,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication on app start...');
        
        // Try to fetch user profile from backend using HTTP-only cookie
        const response = await userApi.getProfile();
        
        if (response.success && response.data) {
          console.log('✅ User authenticated via cookie:', response.data);
          const userData = convertUserDto(response.data);
          setUser(userData);
          
          // Also update sessionStorage for backwards compatibility
          sessionStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.log('⚠️ No valid authentication found:', error);
        // Clear any stale data
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const requestOtp = async (phoneNumber: string): Promise<void> => {
    try {
      const response = await authApi.requestOtp({ phoneNumber });
      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('OTP request failed:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async (phoneNumber: string, otp: string): Promise<void> => {
    try {
      const response = await authApi.verifyOtp({ phoneNumber, otp });
      if (!response.success) {
        throw new Error(response.message);
      }
      
      // Store token and fetch user profile
      if (response.data.token) {
        sessionStorage.setItem('authToken', response.data.token);
      }
      if (response.data.user) {
        const userData = convertUserDto(response.data.user);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      throw new Error(error.message || 'Invalid OTP');
    }
  };

  // For backward compatibility - verifyOtpOnly is same as verifyOtp for our new backend
  const verifyOtpOnly = verifyOtp;

  const login = async (phoneNumber: string, otp: string): Promise<void> => {
    await verifyOtp(phoneNumber, otp);
  };

  const signup = async (signupData: CustomerSignupDto): Promise<void> => {
    try {
      const response = await authApi.signup(signupData);
      if (!response.success) {
        throw new Error(response.message);
      }
      
      // Store token first (before user data)
      if (response.data.token) {
        sessionStorage.setItem('authToken', response.data.token);
        console.log('✅ Token stored in sessionStorage');
      }
      
      // Then store user profile
      if (response.data.user) {
        const userData = convertUserDto(response.data.user);
        console.log('✅ User data from backend:', response.data.user);
        console.log('✅ Converted user data:', userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const employeeLogin = async (employeeId: string, password: string): Promise<void> => {
    try {
      const response = await authApi.employeeLogin({ employeeId, password });
      if (!response.success) {
        throw new Error(response.message);
      }
      
      // Store token and fetch user profile
      if (response.data.token) {
        sessionStorage.setItem('authToken', response.data.token);
      }
      if (response.data.user) {
        const userData = convertUserDto(response.data.user);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error: any) {
      console.error('Employee login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const adminLogin = async (username: string, password: string): Promise<void> => {
    try {
      const response = await authApi.adminLogin({ employeeId: username, password });
      if (!response.success) {
        throw new Error(response.message);
      }
      
      // Store token and fetch user profile
      if (response.data.token) {
        sessionStorage.setItem('authToken', response.data.token);
      }
      if (response.data.user) {
        const userData = convertUserDto(response.data.user);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error: any) {
      console.error('Admin login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side session/cookies
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear all client-side storage
      setUser(null);
      
      // Clear sessionStorage
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      
      // Clear localStorage (in case anything was stored there)
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Clear all sessionStorage
      sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
  };

  const refreshUser = async () => {
    try {
      // Get user from sessionStorage
      const userData = sessionStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        throw new Error('No user data in session');
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, clear everything
      setUser(null);
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      signup, 
      requestOtp, 
      verifyOtp,
      verifyOtpOnly, 
      employeeLogin, 
      adminLogin,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
