
import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Shield, 
  Bell, 
  Database, 
  Globe, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  HardDrive,
  UserPlus,
  Trash2,
  Edit2,
  Lock,
  Camera,
  AtSign,
  User as UserIcon,
  ShieldAlert,
  Download,
  Key
} from 'lucide-react';
import { ExportService } from '../services/ExportService';
import { User, Role } from '../types';

const SETTINGS_KEY = 'medcore_clinical_settings';
const USERS_KEY = 'medcore_local_users';

const SettingsPage: React.FC = () => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Users management
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'System Administrator', username: 'admin', password: 'admin', role: 'ADMIN', email: 'admin@medcore.com' },
      { id: '2', name: 'Clinic Secretary', username: 'secretary', password: 'password', role: 'SECRETARY', email: 'sarah@medcore.com' },
    ];
  });

  const [newUser, setNewUser] = useState({ name: '', username: '', email: '', password: '', role: 'SECRETARY' as Role });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Load persistent settings or use defaults
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      clinicName: 'MedCore Pro Health Center',
      supportEmail: 'care@medcorepro.eg',
      whatsappEnabled: true,
      emailAlertsEnabled: true,
      weeklyDigest: false,
      backupInterval: 'Daily',
      accessControlLevel: 'Advanced',
      logo: null
    };
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (key: keyof typeof settings, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFullBackup = () => {
    const fullBackup = {
      patients: JSON.parse(localStorage.getItem('medcore_patients') || '[]'),
      doctors: JSON.parse(localStorage.getItem('medcore_doctors') || '[]'),
      appointments: JSON.parse(localStorage.getItem('medcore_appointments') || '[]'),
      labs: JSON.parse(localStorage.getItem('medcore_labs') || '[]'),
      invoices: JSON.parse(localStorage.getItem('medcore_invoices') || '[]'),
      settings: settings,
      users: users,
      timestamp: new Date().toISOString()
    };
    ExportService.exportFullBackup(fullBackup);
  };

  const saveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const addUser = () => {
    if (!newUser.name || !newUser.username || !newUser.password) {
      alert("Name, Username, and Password are required.");
      return;
    }
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser
    };
    setUsers([...users, user]);
    setNewUser({ name: '', username: '', email: '', password: '', role: 'SECRETARY' });
  };

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({ name: user.name, username: user.username, email: user.email, password: user.password || '', role: user.role });
  };

  const updateExistingUser = () => {
    if (!editingUser) return;
    setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...newUser } : u));
    setEditingUser(null);
    setNewUser({ name: '', username: '', email: '', password: '', role: 'SECRETARY' });
  };

  const deleteUser = (id: string) => {
    if (users.length === 1 && users[0].role === 'ADMIN') {
      alert("Cannot delete the only administrator.");
      return;
    }
    if (confirm('Permanently disable this user account?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const ToggleRow = ({ label, description, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] border border-gray-100 dark:border-slate-800 transition-all hover:bg-gray-100 dark:hover:bg-slate-900">
      <div>
        <div className="text-sm font-black dark:text-white leading-tight">{label}</div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{description}</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Clinical Governance</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">Local Instance Settings & System Management</p>
        </div>
        {showSuccess && (
          <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl animate-in fade-in slide-in-from-right-4 border border-emerald-100 shadow-lg shadow-emerald-50">
            <CheckCircle2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Configuration Committed</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2 bg-white dark:bg-slate-800 p-2 rounded-[2rem] border border-gray-100 dark:border-slate-700 w-fit shadow-sm">
        {[
          { id: 'profile', label: 'Identity', icon: Globe },
          { id: 'security', label: 'User Control', icon: Shield },
          { id: 'notifications', label: 'Automations', icon: Bell },
          { id: 'backup', label: 'Backup', icon: Database },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSettingsTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeSettingsTab === tab.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.05]' 
              : 'text-gray-400 hover:text-blue-600'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden min-h-[550px] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {activeSettingsTab === 'profile' && (
            <div className="p-12 space-y-10 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                    <div className="w-32 h-32 bg-gray-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-700 overflow-hidden group-hover:border-blue-500 transition-all">
                      {settings.logo ? (
                        <img src={settings.logo} className="w-full h-full object-cover" alt="Clinic Logo" />
                      ) : (
                        <Camera size={32} className="text-gray-300 group-hover:text-blue-500" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <RefreshCw className="text-white" size={24} />
                    </div>
                  </div>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  <div className="text-center">
                    <h4 className="font-black text-xs dark:text-white uppercase tracking-widest">Clinic Branding</h4>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Recommended: Square PNG</p>
                  </div>
                </div>

                <div className="flex-1 space-y-8 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Practice Legal Name</label>
                      <input 
                        type="text" 
                        value={settings.clinicName} 
                        onChange={e => handleInputChange('clinicName', e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold transition-all shadow-inner" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Support E-mail</label>
                      <input 
                        type="email" 
                        value={settings.supportEmail} 
                        onChange={e => handleInputChange('supportEmail', e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold transition-all shadow-inner" 
                      />
                    </div>
                  </div>
                  
                  <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30">
                    <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Instance Locality</h4>
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-bold leading-relaxed">
                      All branding and identification details are stored locally on this workstation. These details will appear on all generated EGP invoices and lab requisitions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'security' && (
            <div className="p-12 space-y-10 animate-in slide-in-from-bottom-4 duration-300">
               <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black dark:text-white">Account Management</h3>
                    <p className="text-sm text-gray-400">Manage internal clinical accounts and local system credentials.</p>
                  </div>
               </div>

               <div className="bg-gray-50 dark:bg-slate-900/40 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-inner">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                    <UserPlus size={16} className="mr-2 text-blue-600" /> {editingUser ? 'Edit System Account' : 'Provision New Account'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        placeholder="Full Name" 
                        value={newUser.name}
                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                        className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold text-sm shadow-sm"
                      />
                    </div>
                    <div className="relative">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        placeholder="Username" 
                        value={newUser.username}
                        onChange={e => setNewUser({...newUser, username: e.target.value})}
                        className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold text-sm shadow-sm"
                      />
                    </div>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        placeholder="Password" 
                        type="password"
                        value={newUser.password}
                        onChange={e => setNewUser({...newUser, password: e.target.value})}
                        className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold text-sm shadow-sm"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        placeholder="Email (Optional)" 
                        value={newUser.email}
                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                        className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold text-sm shadow-sm"
                      />
                    </div>
                    <select 
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                      className="px-6 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold text-[10px] uppercase tracking-widest appearance-none cursor-pointer shadow-sm"
                    >
                      <option value="ADMIN">ADMINISTRATOR</option>
                      <option value="SECRETARY">SECRETARY</option>
                      <option value="DOCTOR">DOCTOR</option>
                    </select>
                    <button 
                      onClick={editingUser ? updateExistingUser : addUser}
                      className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                      {editingUser ? 'Update User' : 'Add User'}
                    </button>
                  </div>
                  {editingUser && (
                    <button onClick={() => { setEditingUser(null); setNewUser({name: '', username: '', email: '', password: '', role: 'SECRETARY'}) }} className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500">Cancel Edit</button>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {users.map(u => (
                    <div key={u.id} className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] flex items-center justify-between shadow-sm transition-all hover:scale-[1.02]">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 font-black text-sm">
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="text-sm font-black dark:text-white">{u.name}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">@{u.username} • {u.email}</div>
                          <div className={`mt-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                            {u.role}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button onClick={() => startEditUser(u)} className="p-2 text-gray-300 hover:text-blue-600 transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => deleteUser(u.id)} className="p-2 text-gray-300 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeSettingsTab === 'notifications' && (
            <div className="p-12 space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                <ToggleRow 
                  label="Local WhatsApp Integration" 
                  description="Enable automated visit confirmations via local API" 
                  checked={settings.whatsappEnabled} 
                  onChange={() => handleToggle('whatsappEnabled')} 
                />
                <ToggleRow 
                  label="Local SMTP Dispatcher" 
                  description="Automated daily briefing and invoice delivery" 
                  checked={settings.emailAlertsEnabled} 
                  onChange={() => handleToggle('emailAlertsEnabled')} 
                />
            </div>
          )}

          {activeSettingsTab === 'backup' && (
            <div className="p-12 space-y-10 animate-in slide-in-from-bottom-4 duration-300">
               <div className="flex items-center space-x-6 p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl shadow-slate-200">
                 <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-blue-400">
                   <HardDrive size={32} />
                 </div>
                 <div>
                    <h4 className="font-black uppercase tracking-widest text-sm">Data Residency Vault</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Status: Encrypted & Local</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-gray-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-gray-100 dark:border-slate-800">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Backup Frequency</h5>
                    <div className="flex flex-col space-y-2">
                      {['Real-time', 'Daily', 'Manual'].map(freq => (
                        <button 
                          key={freq}
                          onClick={() => handleInputChange('backupInterval', freq)}
                          className={`w-full py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all ${settings.backupInterval === freq ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-gray-400 border border-gray-100 dark:border-slate-700'}`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center space-y-4">
                    <button 
                      onClick={handleFullBackup}
                      className="flex items-center justify-between p-6 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:scale-[1.02] transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <Download size={24} />
                        <span className="text-xs font-black uppercase tracking-widest">Full Database Export (JSON)</span>
                      </div>
                    </button>
                    <button className="flex items-center justify-between p-6 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-900/20 text-red-500 hover:scale-[1.02] transition-all">
                      <div className="flex items-center space-x-4">
                        <ShieldAlert size={24} />
                        <span className="text-xs font-black uppercase tracking-widest">Purge Local History</span>
                      </div>
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="p-10 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20 flex justify-end">
          <button 
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-blue-600 text-white px-16 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center space-x-3 shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            <span>{isSaving ? 'Synchronizing...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
