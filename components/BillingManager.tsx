
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Download, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  ShieldCheck, 
  Receipt, 
  Search, 
  TrendingUp, 
  Wallet, 
  Plus, 
  X, 
  User, 
  Calendar,
  Check,
  FlaskConical,
  Activity,
  BarChart3
} from 'lucide-react';
import ExportButton from './ExportButton';
import { Appointment, Patient, Doctor, LabRequest } from '../types';

interface BillingManagerProps {
  patients: Patient[];
  appointments: Appointment[];
  doctors: Doctor[];
  labRequests: LabRequest[];
}

const BillingManager: React.FC<BillingManagerProps> = ({ patients, appointments, doctors, labRequests }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'pending' | 'labs'>('pending');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  // Consolidated settlement log
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('medcore_invoices');
    return saved ? JSON.parse(saved) : [
      { id: 'INV-4021', patient: 'Alice Smith', doctor: 'Dr. John House', date: new Date().toISOString().split('T')[0], amount: 450, status: 'Paid', method: 'Cash', type: 'Consultation' },
    ];
  });

  const pendingVisits = appointments.filter(a => a.status === 'Completed' || a.status === 'Scheduled');
  
  // Financial Analytics
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const thisMonth = now.toISOString().substring(0, 7);

    const consultRev = invoices.filter(i => i.type === 'Consultation').reduce((acc, i) => acc + i.amount, 0);
    const labRev = labRequests.filter(l => l.status === 'COMPLETED' || l.status === 'COLLECTED').reduce((acc, l) => acc + l.totalCost, 0);
    
    const dailyRev = invoices.filter(i => i.date === today).reduce((acc, i) => acc + i.amount, 0) +
                     labRequests.filter(l => l.date.startsWith(today)).reduce((acc, l) => acc + l.totalCost, 0);
    
    const monthlyRev = invoices.filter(i => i.date.startsWith(thisMonth)).reduce((acc, i) => acc + i.amount, 0) +
                       labRequests.filter(l => l.date.startsWith(thisMonth)).reduce((acc, l) => acc + l.totalCost, 0);

    return {
      total: consultRev + labRev,
      consult: consultRev,
      labs: labRev,
      daily: dailyRev,
      monthly: monthlyRev
    };
  }, [invoices, labRequests]);

  const labExportData = labRequests.map(r => ({
    ID: r.id,
    Date: r.date,
    Patient: patients.find(p => p.id === r.patientId)?.firstName + ' ' + patients.find(p => p.id === r.patientId)?.lastName,
    Amount: r.totalCost,
    Status: r.status
  }));

  const StatBox = ({ label, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-all hover:translate-y-[-4px] hover:shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{subValue}</span>
      </div>
      <div>
        <div className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-1">{label}</div>
        <div className="text-2xl font-black dark:text-white leading-none">{value} <span className="text-[10px] font-bold text-gray-400 ml-1">EGP</span></div>
      </div>
    </div>
  );

  const handleCheckout = (appt: Appointment) => {
    setSelectedAppt(appt);
    setIsCheckoutOpen(true);
  };

  const confirmPayment = (method: string) => {
    if (!selectedAppt) return;
    const patient = patients.find(p => p.id === selectedAppt.patientId);
    const doctor = doctors.find(d => d.id === selectedAppt.doctorId);

    const newInvoice = {
      id: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
      patient: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
      doctor: doctor?.name || 'Unknown',
      date: new Date().toISOString().split('T')[0],
      amount: doctor?.consultationFee || 0,
      status: 'Paid',
      method: method,
      type: 'Consultation'
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('medcore_invoices', JSON.stringify(updatedInvoices));
    setIsCheckoutOpen(false);
    setSelectedAppt(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Revenue Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 uppercase text-[10px] font-bold tracking-[0.2em]">EGP Clinical Settlement & Ledger Logistics</p>
        </div>
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          {[
            { id: 'pending', label: 'Pending Queue', icon: Clock },
            { id: 'labs', label: 'Lab Yield', icon: FlaskConical },
            { id: 'history', label: 'Financial Logs', icon: BarChart3 },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-blue-600'}`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox label="Today's Yield" value={stats.daily.toLocaleString()} icon={TrendingUp} color="bg-emerald-600" subValue="All Services" />
        <StatBox label="Monthly Output" value={stats.monthly.toLocaleString()} icon={Calendar} color="bg-blue-600" subValue="Current Month" />
        <StatBox label="Laboratory Rev" value={stats.labs.toLocaleString()} icon={FlaskConical} color="bg-purple-600" subValue="Total Logged" />
        <StatBox label="Aggregate Total" value={stats.total.toLocaleString()} icon={Wallet} color="bg-orange-600" subValue="Lifetime EGP" />
      </div>

      {activeTab === 'pending' && (
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20">
             <div className="flex items-center space-x-2 text-gray-500">
               <Activity size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Visit Checkout</span>
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Identified Visit</th>
                  <th className="px-8 py-5">Attending Staff</th>
                  <th className="px-8 py-5">EGP Base Fee</th>
                  <th className="px-8 py-5 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {pendingVisits.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-10 text-center text-gray-400 italic">No visits pending checkout</td></tr>
                ) : (
                  pendingVisits.map((appt) => {
                    const patient = patients.find(p => p.id === appt.patientId);
                    const doctor = doctors.find(d => d.id === appt.doctorId);
                    return (
                      <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="text-sm font-black dark:text-white">{patient?.firstName} {patient?.lastName}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(appt.dateTime).toLocaleDateString()} @ {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-blue-600 dark:text-blue-400">{doctor?.name}</td>
                        <td className="px-8 py-6 text-sm font-black dark:text-white">{(doctor?.consultationFee || 450).toFixed(2)}</td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => handleCheckout(appt)} className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">Check Out</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20 flex justify-between items-center">
             <div className="flex items-center space-x-2 text-gray-500">
               <FlaskConical size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">Laboratory Requisition Yield</span>
             </div>
             <ExportButton data={labExportData} fileName="Lab_Revenue_Log" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Req Ref</th>
                  <th className="px-8 py-5">Subject Patient</th>
                  <th className="px-8 py-5">Panel Count</th>
                  <th className="px-8 py-5">Total EGP</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {labRequests.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-10 text-center text-gray-400 italic">No lab entries recorded</td></tr>
                ) : (
                  labRequests.map((req) => {
                    const patient = patients.find(p => p.id === req.patientId);
                    return (
                      <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <td className="px-8 py-6 text-sm font-black dark:text-white">{req.id}</td>
                        <td className="px-8 py-6">
                          <div className="text-sm font-bold dark:text-gray-300">{patient?.firstName} {patient?.lastName}</div>
                          <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-1">{new Date(req.date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase">{req.tests.length} Standard Tests</td>
                        <td className="px-8 py-6 text-sm font-black dark:text-white">{req.totalCost.toFixed(2)}</td>
                        <td className="px-8 py-6 text-right">
                          <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border ${req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20 flex items-center justify-between">
             <div className="flex items-center space-x-2 text-gray-500">
               <Receipt size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">Financial Settlement Ledger</span>
             </div>
             <ExportButton data={invoices} fileName="Financial_Invoices" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Inv Ref</th>
                  <th className="px-8 py-5">Ledger Entry</th>
                  <th className="px-8 py-5">EGP Settlement</th>
                  <th className="px-8 py-5">Provider</th>
                  <th className="px-8 py-5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td className="px-8 py-6 text-sm font-black dark:text-white">{inv.id}</td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold dark:text-gray-300">{inv.patient}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mt-1">{inv.date} • {inv.method}</div>
                    </td>
                    <td className="px-8 py-6 text-sm font-black dark:text-white">{inv.amount.toFixed(2)}</td>
                    <td className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">{inv.doctor}</td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 text-gray-400 hover:text-blue-600 transition-all"><Download size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && selectedAppt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Generate Statement</h3>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Visit Settlement Protocol</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="hover:bg-white/20 p-3 rounded-2xl transition-all"><X size={24} /></button>
            </div>

            <div className="p-10 space-y-10">
              <div className="flex items-center space-x-6 p-6 bg-gray-50 dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-inner">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                  <User size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black dark:text-white uppercase tracking-tight">
                    {patients.find(p => p.id === selectedAppt.patientId)?.firstName} {patients.find(p => p.id === selectedAppt.patientId)?.lastName}
                  </h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Attended by {doctors.find(d => d.id === selectedAppt.doctorId)?.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Consultation Yield</span>
                  <span className="text-xl font-black dark:text-white">{(doctors.find(d => d.id === selectedAppt.doctorId)?.consultationFee || 450).toLocaleString()} EGP</span>
                </div>
                <div className="h-0.5 bg-gray-100 dark:bg-slate-800 rounded-full" />
                <div className="flex justify-between items-center px-4 pt-2">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Total EGP Payable</span>
                  <span className="text-4xl font-black dark:text-white">{(doctors.find(d => d.id === selectedAppt.doctorId)?.consultationFee || 450).toLocaleString()} <span className="text-sm">EGP</span></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'Cash', icon: Wallet, label: 'Physical Cash' },
                  { id: 'Visa', icon: CreditCard, label: 'Credit/Debit' },
                ].map(method => (
                  <button 
                    key={method.id}
                    onClick={() => confirmPayment(method.id)}
                    className="p-8 bg-gray-50 dark:bg-slate-900 hover:bg-blue-600 hover:text-white rounded-[2rem] border border-gray-100 dark:border-slate-800 transition-all flex flex-col items-center text-center group shadow-sm active:scale-95"
                  >
                    <method.icon size={28} className="mb-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManager;
