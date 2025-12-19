
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  CreditCard, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Menu,
  Moon,
  Sun,
  UserCheck,
  FlaskConical
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import PatientManager from './components/PatientManager';
import AppointmentScheduler from './components/AppointmentScheduler';
import BillingManager from './components/BillingManager';
import SettingsPage from './components/SettingsPage';
import DoctorManager from './components/DoctorManager';
import LabManager from './components/LabManager';
import Login from './components/Login';
import { authService } from './services/authService';
import { User, Patient, Doctor, Appointment, LabRequest } from './types';

const SidebarItem: React.FC<{ to: string, icon: any, label: string, active: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-slate-700'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [clinicLogo, setClinicLogo] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState('MedCore Pro');
  const location = useLocation();

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('medcore_patients');
    return saved ? JSON.parse(saved) : [
      { id: '1', firstName: 'Alice', lastName: 'Smith', dob: '1985-05-12', gender: 'Female', phone: '+20 100 000 0001', email: 'alice@example.com', address: 'Cairo, Egypt', medicalHistory: ['Hypertension'], bloodType: 'A+' },
    ];
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('medcore_doctors');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'd1', name: 'Dr. John House', specialty: 'Diagnostics', email: 'house@medcore.com', phone: '+20 100 000 0002', 
        detailedSchedule: [{ day: 'MON', startTime: '09:00', endTime: '17:00' }], consultationFee: 450, schedule: ['MON'], photoUrl: '', documents: [] 
      },
    ];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('medcore_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const [labRequests, setLabRequests] = useState<LabRequest[]>(() => {
    const saved = localStorage.getItem('medcore_labs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('medcore_clinical_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setClinicLogo(parsed.logo || null);
      setClinicName(parsed.clinicName || 'MedCore Pro');
    }
  }, [location]); // Refresh settings on route change or when settings page might have updated it

  useEffect(() => {
    localStorage.setItem('medcore_patients', JSON.stringify(patients));
    localStorage.setItem('medcore_doctors', JSON.stringify(doctors));
    localStorage.setItem('medcore_appointments', JSON.stringify(appointments));
    localStorage.setItem('medcore_labs', JSON.stringify(labRequests));
  }, [patients, doctors, appointments, labRequests]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  const isAdmin = user.role === 'ADMIN';

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'SECRETARY', 'DOCTOR'] },
    { to: '/patients', icon: Users, label: 'Patients', roles: ['ADMIN', 'SECRETARY', 'DOCTOR'] },
    { to: '/doctors', icon: UserCheck, label: 'Doctors', roles: ['ADMIN'] },
    { to: '/appointments', icon: Calendar, label: 'Appointments', roles: ['ADMIN', 'SECRETARY', 'DOCTOR'] },
    { to: '/labs', icon: FlaskConical, label: 'Lab Requests', roles: ['ADMIN', 'SECRETARY', 'DOCTOR'] },
    { to: '/billing', icon: CreditCard, label: 'Revenue & Billing', roles: ['ADMIN'] },
    { to: '/settings', icon: Settings, label: 'Settings', roles: ['ADMIN'] },
  ].filter(item => item.roles.includes(user.role));

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 md:relative md:translate-x-0`}>
        <div className="h-full flex flex-col px-4 py-6">
          <div className="flex items-center px-4 mb-10">
            {clinicLogo ? (
              <img src={clinicLogo} alt="Logo" className="w-10 h-10 rounded-xl mr-3 object-cover shadow-md" />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white mr-3">
                <Stethoscope size={24} />
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-white truncate">
              {clinicName.split(' ')[0]}<span className="text-blue-600">{clinicName.split(' ').slice(1).join('')}</span>
            </h1>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.to} 
                to={item.to} 
                icon={item.icon} 
                label={item.label} 
                active={location.pathname === item.to} 
              />
            ))}
          </nav>

          <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-gray-500">
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-64 md:w-96 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 dark:border-slate-700">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 text-xs">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold dark:text-white leading-tight">{user.name}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{user.role}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard patients={patients} appointments={appointments} doctors={doctors} />} />
            <Route path="/patients" element={<PatientManager patients={patients} onUpdate={setPatients} appointments={appointments} doctors={doctors} />} />
            <Route path="/doctors" element={isAdmin ? <DoctorManager doctors={doctors} onUpdate={setDoctors} appointments={appointments} /> : <Navigate to="/" />} />
            <Route path="/appointments" element={<AppointmentScheduler appointments={appointments} onUpdate={setAppointments} patients={patients} doctors={doctors} />} />
            <Route path="/labs" element={<LabManager labRequests={labRequests} patients={patients} doctors={doctors} onUpdate={setLabRequests} />} />
            <Route path="/billing" element={isAdmin ? <BillingManager patients={patients} appointments={appointments} doctors={doctors} labRequests={labRequests} /> : <Navigate to="/" />} />
            <Route path="/settings" element={isAdmin ? <SettingsPage /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
