
import { Role, User } from '../types';

const USERS_KEY = 'medcore_local_users';

const getLocalUsers = (): User[] => {
  const saved = localStorage.getItem(USERS_KEY);
  if (saved) return JSON.parse(saved);
  
  // Default accounts
  const defaults: User[] = [
    { id: '1', name: 'System Administrator', username: 'admin', password: 'admin', role: 'ADMIN', email: 'admin@medcore.com' },
    { id: '2', name: 'Clinic Secretary', username: 'secretary', password: 'password', role: 'SECRETARY', email: 'sarah@medcore.com' },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(defaults));
  return defaults;
};

export const authService = {
  login: async (username: string, password?: string): Promise<User | null> => {
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = getLocalUsers();
    
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      (u.password === password || (!u.password && !password))
    );

    if (user) {
      // Don't store password in session
      const sessionUser = { ...user };
      delete sessionUser.password;
      localStorage.setItem('medcore_user', JSON.stringify(sessionUser));
      return sessionUser;
    }
    return null;
  },
  logout: () => {
    localStorage.removeItem('medcore_user');
  },
  getCurrentUser: (): User | null => {
    const saved = localStorage.getItem('medcore_user');
    return saved ? JSON.parse(saved) : null;
  }
};
