
import React, { useState, useRef, useMemo } from 'react';
import { 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  UserCheck, 
  Stethoscope, 
  Mail, 
  Phone, 
  Calendar, 
  Info,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  Download,
  AlertCircle,
  DollarSign,
  Camera,
  User,
  ChevronDown,
  TrendingUp,
  BarChart3,
  Users,
  Wallet,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import ExportButton from './ExportButton';
import { Doctor, DoctorSchedule, DoctorDocument, Appointment } from '../types';

interface DoctorManagerProps {
  doctors: Doctor[];
  appointments: Appointment[];
  onUpdate: (doctors: Doctor[]) => void;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const MEDICAL_SPECIALTIES = [
  "Anesthesiology", "Cardiology", "Dentistry (Oral Health)", "Dermatology", "Diagnostics", 
  "Emergency Medicine", "Endocrinology", "Family Medicine", "Gastroenterology", 
  "General Surgery", "Internal Medicine", "Neurology", "Obstetrics and Gynecology", 
  "Oncology", "Ophthalmology", "Orthopedics", "Otolaryngology (ENT)", "Pediatrics", 
  "Psychiatry", "Radiology", "Urology"
].sort();

const DoctorManager: React.FC<DoctorManagerProps> = ({ doctors, appointments, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'documents' | 'performance'>('profile');
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filtering & Sorting
  const [filterSpecialty, setFilterSpecialty] = useState<string>('All');
  
  // Performance Filters
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: '',
    specialty: '',
    email: '',
    phone: '',
    bio: '',
    detailedSchedule: [],
    documents: [],
    photoUrl: '',
    consultationFee: 0
  });

  const openModal = (doctor?: Doctor) => {
    setActiveTab('profile');
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({ ...doctor });
    } else {
      setEditingDoctor(null);
      setFormData({ 
        name: '', 
        specialty: '', 
        email: '', 
        phone: '', 
        bio: '', 
        detailedSchedule: [],
        documents: [],
        photoUrl: '', 
        consultationFee: 450
      });
    }
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addScheduleSlot = () => {
    const newSlot: DoctorSchedule = { day: 'MON', startTime: '09:00', endTime: '17:00' };
    setFormData({ 
      ...formData, 
      detailedSchedule: [...(formData.detailedSchedule || []), newSlot] 
    });
  };

  const updateScheduleSlot = (index: number, updates: Partial<DoctorSchedule>) => {
    const newSchedule = [...(formData.detailedSchedule || [])];
    newSchedule[index] = { ...newSchedule[index], ...updates };
    setFormData({ ...formData, detailedSchedule: newSchedule });
  };

  const removeScheduleSlot = (index: number) => {
    setFormData({ 
      ...formData, 
      detailedSchedule: (formData.detailedSchedule || []).filter((_, i) => i !== index) 
    });
  };

  const addDocument = () => {
    const docName = prompt("Enter document name (e.g., Board Certification):");
    if (!docName) return;
    const newDoc: DoctorDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: docName,
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setFormData({ 
      ...formData, 
      documents: [...(formData.documents || []), newDoc] 
    });
  };

  const removeDocument = (id: string) => {
    setFormData({ 
      ...formData, 
      documents: (formData.documents || []).filter(d => d.id !== id) 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      schedule: Array.from(new Set((formData.detailedSchedule || []).map(s => s.day)))
    } as Doctor;

    if (editingDoctor) {
      onUpdate(doctors.map(d => d.id === editingDoctor.id ? { ...d, ...finalData } : d));
    } else {
      const newDoctor: Doctor = {
        ...finalData,
        id: 'd' + Math.random().toString(36).substr(2, 5),
      };
      onUpdate([...doctors, newDoctor]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you absolutely sure you want to remove this doctor from the local database?')) {
      onUpdate(doctors.filter(d => d.id !== id));
    }
  };

  const getFilteredPerformance = (doctorId: string, fee: number) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const periodAppts = appointments.filter(a => {
      const apptDate = new Date(a.dateTime);
      return a.doctorId === doctorId && apptDate >= start && apptDate <= end;
    });

    return {
      appointments: periodAppts,
      totalRevenue: periodAppts.length * fee,
      totalPatients: new Set(periodAppts.map(a => a.patientId)).size,
      visitCount: periodAppts.length
    };
  };

  const filteredDoctors = useMemo(() => {
    if (filterSpecialty === 'All') return doctors;
    return doctors.filter(d => d.specialty === filterSpecialty);
  }, [doctors, filterSpecialty]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white tracking-tight">Practitioner Roster</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Internal clinical directory and local performance analytics.</p>
        </div>
        <div className="flex items-center space-x-4">
          <ExportButton data={doctors} fileName="Practitioners_Directory" />
          <div className="relative group">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="pl-11 pr-10 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none cursor-pointer shadow-sm"
            >
              <option value="All">All Specialties</option>
              {Array.from(new Set(doctors.map(d => d.specialty))).sort().map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button 
            onClick={() => openModal()} 
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="font-bold">Register Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredDoctors.map(doctor => {
          return (
            <div key={doctor.id} className="bg-white dark:bg-slate-800 p-1 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group overflow-hidden">
              <div className="p-8 pb-4">
                <div className="flex items-center space-x-5">
                  <div className="relative">
                    {doctor.photoUrl ? (
                      <img 
                        src={doctor.photoUrl} 
                        className="w-20 h-20 rounded-3xl object-cover ring-4 ring-gray-50 dark:ring-slate-700 shadow-inner"
                        alt={doctor.name}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-slate-900 flex items-center justify-center text-blue-600 ring-4 ring-gray-50 dark:ring-slate-700 shadow-inner font-black text-xl">
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xl dark:text-white group-hover:text-blue-600 transition-colors truncate">{doctor.name}</h3>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-bold mt-1">
                      <Stethoscope size={16} className="mr-1.5" />
                      {doctor.specialty}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between text-xs p-3 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center text-gray-400">
                      <Phone size={14} className="mr-2" />
                      <span className="font-bold uppercase tracking-widest text-[10px]">Mobile</span>
                    </div>
                    <span className="font-black dark:text-white">{doctor.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-3 bg-gray-50 dark:bg-slate-900/40 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                    <div className="flex items-center text-gray-400">
                      <DollarSign size={14} className="mr-2" />
                      <span className="font-bold uppercase tracking-widest text-[10px]">Consult Fee</span>
                    </div>
                    <span className="font-black dark:text-white">{doctor.consultationFee} EGP</span>
                  </div>
                  
                  {/* Available Times Display */}
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/20">
                    <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                      <Clock size={12} className="mr-2" />
                      <span className="font-black uppercase tracking-widest text-[10px]">Weekly Work Windows</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {doctor.detailedSchedule.length > 0 ? (
                        doctor.detailedSchedule.map((s, i) => (
                          <div key={i} className="flex justify-between text-[11px] font-bold">
                            <span className="text-gray-500 uppercase">{s.day}</span>
                            <span className="dark:text-gray-300">{s.startTime} - {s.endTime}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-gray-400 italic">No windows configured</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6">
                <button 
                  onClick={() => openModal(doctor)}
                  className="w-full bg-gray-50 dark:bg-slate-900/60 py-4 rounded-2xl flex items-center justify-center space-x-2 text-xs font-black uppercase tracking-widest text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
                >
                  <BarChart3 size={16} />
                  <span>View Local Profile</span>
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900/40 px-8 py-4 flex justify-end items-center border-t border-gray-100 dark:border-slate-700">
                <div className="flex space-x-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openModal(doctor); }} 
                    className="p-2 text-gray-400 hover:text-blue-600 transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(doctor.id); }} 
                    className="p-2 text-gray-400 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
            <div className="flex h-[780px]">
              {/* Modal Sidebar */}
              <div className="w-72 bg-gray-50 dark:bg-slate-900/50 border-r border-gray-100 dark:border-slate-700 p-8 flex flex-col">
                <div className="mb-10">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
                    <UserCheck size={28} />
                  </div>
                  <h3 className="font-black text-2xl dark:text-white leading-tight">
                    {editingDoctor ? 'Internal Hub' : 'New Entry'}
                  </h3>
                  {editingDoctor && <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest truncate">{editingDoctor.name}</p>}
                </div>

                <nav className="space-y-2 flex-1">
                  {[
                    { id: 'profile', label: 'Clinical Identity', icon: UserCheck },
                    { id: 'performance', label: 'Internal Revenue', icon: BarChart3 },
                    { id: 'schedule', label: 'Local Schedule', icon: Clock },
                    { id: 'documents', label: 'Local Vault', icon: FileText },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl font-black transition-all ${
                        activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1' 
                        : 'text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600'
                      }`}
                    >
                      <tab.icon size={20} />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  ))}
                </nav>

                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-auto flex items-center justify-center space-x-2 p-4 text-gray-400 hover:text-red-600 font-bold text-sm"
                >
                  <X size={18} />
                  <span>Exit Session</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-y-auto p-12">
                  <form onSubmit={handleSubmit} id="doctor-form" className="space-y-8 h-full">
                    {activeTab === 'profile' && (
                      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center space-x-8 pb-8 border-b border-gray-100 dark:border-slate-700">
                          <div className="relative group">
                            {formData.photoUrl ? (
                              <img 
                                src={formData.photoUrl} 
                                className="w-28 h-28 rounded-[2.5rem] object-cover ring-4 ring-blue-50 dark:ring-slate-900 shadow-md transition-transform group-hover:scale-105" 
                                alt="Doctor Preview"
                              />
                            ) : (
                              <div className="w-28 h-28 rounded-[2.5rem] bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-gray-300 ring-4 ring-blue-50 dark:ring-slate-900 shadow-md transition-transform group-hover:scale-105">
                                <User size={56} />
                              </div>
                            )}
                            <button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Camera size={28} className="text-white" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-2xl font-black dark:text-white">Staff Identity</h4>
                            <p className="text-sm text-gray-400 mt-1">Configure internal practitioner details for this machine.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Clinical Specialty</label>
                            <div className="relative">
                              <select required value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all appearance-none cursor-pointer font-bold">
                                <option value="" disabled>Select Specialty</option>
                                {MEDICAL_SPECIALTIES.map(specialty => (
                                  <option key={specialty} value={specialty}>{specialty}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Contact</label>
                            <div className="relative">
                              <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Consultation Fee (EGP)</label>
                            <div className="relative">
                              <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                              <input type="number" required value={formData.consultationFee} onChange={e => setFormData({...formData, consultationFee: parseFloat(e.target.value) || 0})} className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'performance' && editingDoctor && (
                      <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-2xl font-black dark:text-white">Internal Revenue History</h4>
                            <p className="text-sm text-gray-400 mt-1">Audit local clinical yield for the selected timeframe.</p>
                          </div>
                          <div className="flex items-center space-x-3 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
                             <div className="flex items-center space-x-2">
                               <span className="text-[10px] font-black text-gray-400 uppercase">From</span>
                               <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold outline-none border-none dark:text-white" />
                             </div>
                             <div className="flex items-center space-x-2">
                               <span className="text-[10px] font-black text-gray-400 uppercase">To</span>
                               <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold outline-none border-none dark:text-white" />
                             </div>
                          </div>
                        </div>
                        
                        {(() => {
                          const stats = getFilteredPerformance(editingDoctor.id, editingDoctor.consultationFee);
                          return (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-[2.5rem]">
                                  <div className="p-3 bg-emerald-100 dark:bg-emerald-800 rounded-2xl w-fit mb-4 text-emerald-600 dark:text-emerald-300">
                                    <Wallet size={24} />
                                  </div>
                                  <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Internal Revenue</div>
                                  <div className="text-3xl font-black dark:text-white">{stats.totalRevenue.toLocaleString()} <span className="text-sm">EGP</span></div>
                                </div>
                                <div className="p-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-[2.5rem]">
                                  <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-2xl w-fit mb-4 text-blue-600 dark:text-blue-300">
                                    <Users size={24} />
                                  </div>
                                  <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Local Patients</div>
                                  <div className="text-3xl font-black dark:text-white">{stats.totalPatients} <span className="text-sm">IDs</span></div>
                                </div>
                                <div className="p-8 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-[2.5rem]">
                                  <div className="p-3 bg-slate-200 dark:bg-slate-600 rounded-2xl w-fit mb-4 text-slate-600">
                                    <Calendar size={24} />
                                  </div>
                                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Visits Count</div>
                                  <div className="text-3xl font-black dark:text-white">{stats.visitCount} <span className="text-sm">Total</span></div>
                                </div>
                              </div>

                              <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[300px]">
                                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                                   <h5 className="font-black text-xs text-gray-400 uppercase tracking-widest">Internal Ledger</h5>
                                   <div className="text-[10px] font-black text-blue-600 uppercase">{stats.appointments.length} Visits Logged</div>
                                </div>
                                <div className="overflow-y-auto flex-1">
                                  {stats.appointments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                      <Search size={32} className="mb-2" />
                                      <p className="text-xs font-bold uppercase tracking-widest">No entries found</p>
                                    </div>
                                  ) : (
                                    <table className="w-full text-left">
                                      <thead>
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-slate-700">
                                          <th className="px-8 py-3">Date</th>
                                          <th className="px-8 py-3">Ref ID</th>
                                          <th className="px-8 py-3">Status</th>
                                          <th className="px-8 py-3 text-right">Fee (EGP)</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                                        {stats.appointments.map(appt => (
                                          <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                            <td className="px-8 py-4 text-xs font-bold dark:text-gray-300">{new Date(appt.dateTime).toLocaleDateString()}</td>
                                            <td className="px-8 py-4 text-xs font-black dark:text-white uppercase tracking-tighter">{appt.id}</td>
                                            <td className="px-8 py-4">
                                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{appt.status}</span>
                                            </td>
                                            <td className="px-8 py-4 text-right text-xs font-black dark:text-white">{editingDoctor.consultationFee.toFixed(2)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {activeTab === 'performance' && !editingDoctor && (
                      <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center text-gray-300">
                          <BarChart3 size={40} />
                        </div>
                        <h4 className="text-xl font-black dark:text-white">Internal History Only</h4>
                        <p className="text-gray-400 text-sm max-w-xs leading-relaxed">Save the profile first to begin tracking local performance analytics.</p>
                      </div>
                    )}

                    {activeTab === 'schedule' && (
                      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-slate-700">
                          <div>
                            <h4 className="text-2xl font-black dark:text-white">Active Blocks</h4>
                            <p className="text-sm text-gray-400">Manage availability windows for this practitioner.</p>
                          </div>
                          <button type="button" onClick={addScheduleSlot} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-6 py-4 rounded-2xl font-black flex items-center space-x-2 transition-all hover:bg-blue-100 active:scale-95">
                            <Plus size={20} />
                            <span>Add Window</span>
                          </button>
                        </div>
                        <div className="space-y-4">
                          {formData.detailedSchedule?.map((slot, idx) => (
                            <div key={idx} className="flex items-center space-x-4 bg-gray-50 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 group transition-all hover:border-blue-200">
                              <select value={slot.day} onChange={e => updateScheduleSlot(idx, { day: e.target.value })} className="bg-white dark:bg-slate-800 px-6 py-3 rounded-xl font-black dark:text-white outline-none">
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <div className="flex-1 flex items-center space-x-4">
                                <input type="time" value={slot.startTime} onChange={e => updateScheduleSlot(idx, { startTime: e.target.value })} className="flex-1 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl font-bold dark:text-white outline-none" />
                                <span className="text-gray-300 font-black">to</span>
                                <input type="time" value={slot.endTime} onChange={e => updateScheduleSlot(idx, { endTime: e.target.value })} className="flex-1 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl font-bold dark:text-white outline-none" />
                              </div>
                              <button type="button" onClick={() => removeScheduleSlot(idx)} className="p-4 text-gray-300 hover:text-red-500 transition-all"><Trash2 size={24} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'documents' && (
                      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-slate-700">
                          <div>
                            <h4 className="text-2xl font-black dark:text-white">Vault Records</h4>
                            <p className="text-sm text-gray-400">Securely store licenses and ID files on this machine.</p>
                          </div>
                          <button type="button" onClick={addDocument} className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 px-6 py-4 rounded-2xl font-black flex items-center space-x-2 transition-all hover:bg-emerald-100 active:scale-95">
                            <Upload size={20} />
                            <span>Attach Asset</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          {formData.documents?.map((doc) => (
                            <div key={doc.id} className="bg-gray-50 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700/50 flex items-center justify-between group transition-all hover:border-emerald-200">
                              <div className="flex items-center space-x-5">
                                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm"><FileText size={24} /></div>
                                <div>
                                  <div className="text-sm font-black dark:text-white truncate max-w-[120px]">{doc.name}</div>
                                  <div className="text-[10px] text-gray-400 uppercase font-black mt-1 tracking-widest">Added {doc.uploadDate}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button type="button" className="p-3 text-gray-400 hover:text-blue-600 transition-all"><Download size={20} /></button>
                                <button type="button" onClick={() => removeDocument(doc.id)} className="p-3 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </form>
                </div>

                <div className="p-12 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/30 flex justify-end items-center space-x-6">
                  <button 
                    type="submit" 
                    form="doctor-form"
                    className="px-16 py-6 bg-blue-600 text-white rounded-[2.5rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center space-x-3 active:scale-95"
                  >
                    <CheckCircle size={24} />
                    <span>{editingDoctor ? 'Save Local Profile' : 'Confirm Registration'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManager;
