
import React, { useState } from 'react';
import { Search, Plus, User, FileText, Sparkles, X, Trash2, Edit2, History, Calendar, Download } from 'lucide-react';
import { medicalAiService } from '../services/geminiService';
import ExportButton from './ExportButton';
import PatientNotesAI from './PatientNotesAI';
import { Patient, Appointment, Doctor } from '../types';

interface PatientManagerProps {
  patients: Patient[];
  onUpdate: (patients: Patient[]) => void;
  appointments?: Appointment[];
  doctors?: Doctor[];
}

const PatientManager: React.FC<PatientManagerProps> = ({ patients, onUpdate, appointments = [], doctors = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState<Partial<Patient>>({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    bloodType: 'O+',
    medicalHistory: []
  });

  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleGetAiSummary = async (history: string[]) => {
    setLoadingAi(true);
    try {
      const summary = await medicalAiService.summarizePatientHistory(history);
      setAiSummary(summary || 'No history available.');
    } catch (err) {
      setAiSummary('Failed to generate summary.');
    } finally {
      setLoadingAi(false);
    }
  };

  const openModal = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData(patient);
    } else {
      setEditingPatient(null);
      setFormData({
        firstName: '', lastName: '', dob: '', gender: 'Male', phone: '', email: '', address: '', bloodType: 'O+', medicalHistory: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient) {
      onUpdate(patients.map(p => p.id === editingPatient.id ? { ...p, ...formData } as Patient : p));
    } else {
      const newPatient: Patient = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        medicalHistory: formData.medicalHistory || []
      } as Patient;
      onUpdate([...patients, newPatient]);
    }
    setIsModalOpen(false);
  };

  const saveNote = (note: string) => {
    if (!selectedPatientId) return;
    onUpdate(patients.map(p => {
      if (p.id === selectedPatientId) {
        return { ...p, medicalHistory: [...p.medicalHistory, `Note (${new Date().toLocaleDateString()}): ${note}`] };
      }
      return p;
    }));
    alert("Note saved to clinical history.");
  };

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white tracking-tight">Patient Directory</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 uppercase text-[10px] font-black tracking-widest">Master Electronic Health Records</p>
        </div>
        <div className="flex items-center space-x-3">
          <ExportButton data={patients} fileName="Patients_Directory" />
          <button 
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 font-bold"
          >
            <Plus size={20} />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700">
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter by name, phone or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-900 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-8 py-5">Patient</th>
                    <th className="px-8 py-5">Vital Specs</th>
                    <th className="px-8 py-5 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredPatients.map((patient) => (
                    <tr 
                      key={patient.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group ${selectedPatientId === patient.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => setSelectedPatientId(patient.id)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 font-black text-xs">
                            {patient.firstName[0]}{patient.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-black dark:text-white">{patient.firstName} {patient.lastName}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">{patient.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex space-x-2">
                           <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-[9px] font-black text-gray-500 rounded uppercase">{patient.gender}</span>
                           <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 text-[9px] font-black text-gray-500 rounded uppercase">{calculateAge(patient.dob)} Years</span>
                           <span className="px-2 py-1 bg-red-50 text-red-600 text-[9px] font-black rounded uppercase">{patient.bloodType}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openModal(patient); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                          <button onClick={(e) => { e.stopPropagation(); }} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          {selectedPatientId ? (
            <>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center">
                  <History size={16} className="mr-2 text-blue-600" /> Clinical Context
                </h3>
                <div className="space-y-4">
                  {patients.find(p => p.id === selectedPatientId)?.medicalHistory.map((h, i) => (
                    <div key={i} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl text-xs font-medium dark:text-gray-300 border border-gray-100 dark:border-slate-800">
                      {h}
                    </div>
                  ))}
                  {(!patients.find(p => p.id === selectedPatientId)?.medicalHistory.length) && (
                    <p className="text-center py-6 text-gray-400 italic text-xs">No entries in medical history.</p>
                  )}
                  <button 
                    onClick={() => handleGetAiSummary(patients.find(p => p.id === selectedPatientId)?.medicalHistory || [])}
                    className="w-full py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center"
                  >
                    {loadingAi ? <Loader2 size={14} className="animate-spin mr-2" /> : <Sparkles size={14} className="mr-2" />}
                    Generate AI Health Brief
                  </button>
                  {aiSummary && (
                    <div className="p-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold leading-relaxed animate-in slide-in-from-top-2">
                      {aiSummary}
                    </div>
                  )}
                </div>
              </div>
              <PatientNotesAI patientId={selectedPatientId} onSave={saveNote} />
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-slate-700 opacity-60">
               <User size={48} className="text-gray-300 mb-4" />
               <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Select a patient to view clinical context & start dictation</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">{editingPatient ? 'Modify Profile' : 'Registration'}</h3>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Local Health Record System</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-3 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                  <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold appearance-none cursor-pointer">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Phone</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Blood Group</label>
                  <select value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold appearance-none cursor-pointer">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100 dark:border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-gray-400 font-bold hover:text-red-500">Cancel</button>
                <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">
                  {editingPatient ? 'Update Profile' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

export default PatientManager;
