import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';

export const handleAuthError = (error: any) => {
  // Check if the error is a 401 Unauthorized error
  if (error?.response?.status === 401 || error?.status === 401) {
    // Remove token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    
    // Show error message
    toast.error('Phiên đã hết hạn, vui lòng đăng nhập lại');
    
    // Redirect to login page
    window.location.href = '/login';
    
    return true; // Indicates that this was an auth error and was handled
  }
  
  return false; // Not an auth error
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      const error = { status: 401 };
      handleAuthError(error);
      throw new Error('Unauthorized');
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw error;
    }
    
    if (!handleAuthError(error)) {
      throw error;
    }
    
    throw new Error('Authentication error');
  }
}; 