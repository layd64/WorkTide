import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface Education {
  institution: string;
  degree: string;
  year: string;
}

interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  userType: string;
  createdAt: string;
  // Additional profile fields
  title?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  rating?: number;
  completedJobs?: number;
  location?: string;
  imageUrl?: string;
  languages?: string[];
  education?: Education[];
  experience?: Experience[];
  isHidden?: boolean;
  isAvatarVisible?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.auth.me, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(prevUser => {
          // If no previous user, just use the userData
          if (!prevUser) return userData;

          // If the isHidden value is missing in the response but we have it in state, preserve it
          if (userData.isHidden === undefined && prevUser.isHidden !== undefined) {
            return { ...userData, isHidden: prevUser.isHidden };
          }

          return userData;
        });
      } else {
        // If the token is invalid, clear it
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Only clear token if it's an authentication error, not a network error
      if (error instanceof Error && error.message !== 'Failed to fetch') {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchUser();

    // Add a retry mechanism for network issues
    const retryTimeout = setTimeout(() => {
      if (!user && token) {
        console.log('Retrying user fetch...');
        fetchUser();
      }
    }, 3000); // Retry after 3 seconds

    return () => clearTimeout(retryTimeout);
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      if (!user || !token) return false;

      const response = await fetch(API_ENDPOINTS.profile.update, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Make sure we persist isHidden in user state
        setUser(prevUser => {
          if (!prevUser) return null;

          // Explicitly ensure isHidden is included from updatedUser or keep existing value
          return {
            ...prevUser,
            ...updatedUser,
            isHidden: updatedUser.isHidden !== undefined ? updatedUser.isHidden : prevUser.isHidden,
            isAvatarVisible: updatedUser.isAvatarVisible !== undefined ? updatedUser.isAvatarVisible : prevUser.isAvatarVisible
          };
        });

        // Refetch the user data to ensure we have the most up-to-date information
        setTimeout(() => fetchUser(), 500);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const uploadAvatar = async (file: File): Promise<boolean> => {
    try {
      if (!user || !token) return false;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_ENDPOINTS.profile.uploadAvatar, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Update user state with new image URL
        setUser(prevUser => {
          if (!prevUser) return null;
          return { ...prevUser, imageUrl: data.imageUrl };
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile, uploadAvatar, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};