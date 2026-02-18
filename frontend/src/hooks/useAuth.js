import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

// Custom hook for easy access to auth context
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;