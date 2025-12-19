
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, AlertTriangle, MessageSquare, Send, Loader2, CheckCircle2, Plus, X, Trash2, Sparkles, Download } from 'lucide-react';
import { reminderService } from '../services/reminderService';
import { medicalAiService } from '../services/geminiService';
import ExportButton from './ExportButton';
import { Appointment, Patient, Doctor } from '../types';

interface AppointmentSchedulerProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  onUpdate: (appts: Appointment[]) => void;
}

const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({ appointments, patients, doctors, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Appointment>>({
    patientId: '',
    doctorId: '',
    dateTime: '',
    reason: '',
    status: 'Scheduled'
  });

  const exportData = appointments.map(a => {
    const p = patients.find(pat => pat.id === a.patientId);
    const d = doctors.find(doc => doc.id === a.doctorId);
    return {
      ID: a.id,
      Date: a.dateTime,
      Patient: p ? `${p.firstName} ${p.lastName}` : 'Unknown',
      Doctor: d ? d.name : 'Unknown',
      Reason: a.reason,
      Status: a.status
    };
  });

  const handleSendReminder = async (appt: Appointment) => {
    const patient = patients.find(p => p.id === appt.patientId);
    const doctor = doctors.find(d => d.id === appt.doctorId);
    if (!patient || !doctor) return;

    setSendingReminder(appt.id);
    try {
      const message = await reminderService.generateReminderMessage(
        `${patient.firstName} ${patient.lastName}`, 
        doctor.name, 
        new Date(appt.dateTime).toLocaleString(), 
        'WhatsApp'
      );
      await reminderService.sendReminder(patient.phone, message);
      setSentSuccess(appt.id);
      setTimeout(() => setSentSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to send reminder', err);
    } finally {
      setSendingReminder(null);
    }
  };

  const openModal = () => {
    setFormData({
      patientId: patients[0]?.id || '',
      doctorId: doctors[0]?.id || '',
      dateTime: `${selectedDate}T09:00:00`,
      reason: '',
      status: 'Scheduled'
    });
    setConflictWarning(null);
    setIsModalOpen(true);
  };

  const checkConflicts = async () => {
    setAiLoading(true);
    setConflictWarning(null);
    try {
      const result = await medicalAiService.analyzeAppointmentConflict(formData, appointments);
      if (result && result !== 'NO_CONFLICT') {
        setConflictWarning(result);
      } else {
        saveAppointment();
      }
    } catch (err) {
      saveAppointment(); // Fallback if AI fails
    } finally {
      setAiLoading(false);
    }
  };

  const saveAppointment = () => {
    const newAppt: Appointment = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      reason: formData.reason || 'No reason provided'
    } as Appointment;
    onUpdate([...appointments, newAppt]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this appointment?')) {
      onUpdate(appointments.filter(a => a.id !== id));
    }
  };

  const filteredAppointments = appointments.filter(a => a.dateTime.startsWith(selectedDate));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Appointments</h1>
        <div className="flex space-x-3">
          <ExportButton data={exportData} fileName="Appointments_Schedule" />
          <button onClick={openModal} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            <Plus size={18} />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
           <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold dark:text-white">Schedule</h3>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="text-gray-400 font-medium py-1">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              const dayStr = `2024-10-${(i + 1).toString().padStart(2, '0')}`;
              const isSelected = selectedDate === dayStr;
              return (
                <button 
                  key={i} 
                  onClick={() => setSelectedDate(dayStr)}
                  className={`py-2 text-sm rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'hover:bg-blue-50 dark:hover:bg-slate-700 dark:text-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-2">
            <CalendarIcon size={18} />
            <span className="font-medium">{new Date(selectedDate).toDateString()}</span>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-gray-100 dark:border-slate-700 rounded-2xl text-center text-gray-400">
              No appointments for this day.
            </div>
          ) : (
            filteredAppointments.map((appt) => {
              const patient = patients.find(p => p.id === appt.patientId);
              const doctor = doctors.find(d => d.id === appt.doctorId);
              const timeStr = new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={appt.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between transition-all hover:border-blue-200 group">
                  <div className="flex items-center space-x-6">
                    <div className="text-center min-w-[80px]">
                      <div className="text-sm font-bold dark:text-white">{timeStr.split(' ')[0]}</div>
                      <div className="text-xs text-gray-500 uppercase">{timeStr.split(' ')[1]}</div>
                    </div>
                    <div className="h-10 w-0.5 bg-gray-100 dark:bg-slate-700 rounded-full"></div>
                    <div>
                      <div className="text-sm font-bold dark:text-white group-hover:text-blue-600 transition-colors">
                        {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Clock size={12} className="mr-1" />
                        {appt.reason} • {doctor?.name || 'Unknown Doctor'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {appt.status}
                    </span>
                    <button 
                      onClick={() => handleSendReminder(appt)}
                      disabled={sendingReminder !== null}
                      className={`p-2 rounded-lg transition-all flex items-center space-x-2 ${
                        sentSuccess === appt.id 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30' 
                        : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
                      }`}
                      title="Send WhatsApp Reminder"
                    >
                      {sendingReminder === appt.id ? <Loader2 size={18} className="animate-spin" /> : 
                       sentSuccess === appt.id ? <CheckCircle2 size={18} /> : <MessageSquare size={18} />}
                    </button>
                    <button onClick={() => handleDelete(appt.id)} className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">New Appointment</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); checkConflicts(); }} className="p-8 space-y-5">
              {conflictWarning && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex space-x-3">
                  <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
                  <div className="text-xs text-amber-800 dark:text-amber-400">
                    <p className="font-bold mb-1">AI Conflict Detection:</p>
                    {conflictWarning}
                    <button type="button" onClick={saveAppointment} className="mt-2 block font-bold underline">Ignore & Save Anyway</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">Select Patient</label>
                <select required value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">Select Doctor</label>
                <select required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})} className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">Date & Time</label>
                <input type="datetime-local" required value={formData.dateTime} onChange={e => setFormData({...formData, dateTime: e.target.value})} className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">Reason for Visit (Optional)</label>
                <input value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="e.g., General checkup" className="w-full px-4 py-2 border dark:border-slate-700 dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-slate-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" disabled={aiLoading} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center space-x-2">
                  {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  <span>Check Conflict & Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentScheduler;
