
import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  UserPlus, 
  CreditCard, 
  Stethoscope, 
  HardDrive, 
  ShieldCheck, 
  Clock, 
  UserCheck,
  Package
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { Patient, Appointment, Doctor } from '../types';

interface DashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  doctors: Doctor[];
}

const Dashboard: React.FC<DashboardProps> = ({ patients, appointments, doctors }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
  const todayAppts = appointments.filter(a => a.dateTime.startsWith(today)).length;

  const doctorsToday = doctors.filter(d => d.schedule.includes(todayDay));

  const data = [
    { name: 'Mon', revenue: 4000, patients: 24 },
    { name: 'Tue', revenue: 3000, patients: 18 },
    { name: 'Wed', revenue: 5000, patients: 32 },
    { name: 'Thu', revenue: todayAppts * 450, patients: todayAppts },
    { name: 'Fri', revenue: 0, patients: 0 },
  ];

  const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-opacity-10 ${color}`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center text-xs font-black ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest">{label}</div>
      <div className="text-2xl font-black mt-1 dark:text-white">{value}</div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Clinical Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold tracking-[0.2em]">MedCore Pro • Desktop Version • Secure Offline Access</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link to="/patients" className="group bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 transition-all hover:translate-y-1 hover:shadow-2xl flex items-center justify-between">
          <div>
            <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4"><UserPlus size={24} /></div>
            <h3 className="text-xl font-black">Register Patient</h3>
            <p className="text-blue-100 text-sm mt-1">EHR Entry</p>
          </div>
          <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
        </Link>
        <Link to="/appointments" className="group bg-slate-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 transition-all hover:translate-y-1 hover:shadow-2xl flex items-center justify-between">
          <div>
            <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4"><CalendarCheck size={24} /></div>
            <h3 className="text-xl font-black">New Booking</h3>
            <p className="text-slate-400 text-sm mt-1">Scheduler</p>
          </div>
          <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
        </Link>
        <Link to="/billing" className="group bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 transition-all hover:translate-y-1 hover:shadow-2xl flex items-center justify-between">
          <div>
            <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4"><CreditCard size={24} /></div>
            <h3 className="text-xl font-black">Invoicing</h3>
            <p className="text-emerald-100 text-sm mt-1">Ledger</p>
          </div>
          <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
        </Link>
        <div className="bg-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-purple-100 flex items-center justify-between">
          <div>
            <div className="p-3 bg-white/10 rounded-2xl w-fit mb-4"><Package size={24} /></div>
            <h3 className="text-xl font-black">Stock</h3>
            <p className="text-purple-100 text-sm mt-1">Pharmacy Hub</p>
          </div>
          <Activity size={32} className="opacity-20" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black dark:text-white uppercase tracking-widest text-[12px] text-gray-400 flex items-center">
            <UserCheck size={18} className="mr-2 text-blue-600" />
            Practitioners On Duty ({todayDay})
          </h3>
          <Link to="/doctors" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Manage All</Link>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
          {doctorsToday.length > 0 ? (
            doctorsToday.map(doc => (
              <div key={doc.id} className="min-w-[240px] bg-gray-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-gray-100 dark:border-slate-700 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 font-black text-sm">
                  {doc.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-black dark:text-white">{doc.name}</div>
                  <div className="text-[10px] text-blue-600 font-bold uppercase">{doc.specialty}</div>
                  <div className="text-[10px] text-gray-400 mt-1 flex items-center">
                    <Clock size={10} className="mr-1" />
                    {doc.detailedSchedule.find(s => s.day === todayDay)?.startTime} - {doc.detailedSchedule.find(s => s.day === todayDay)?.endTime}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 font-medium py-4 px-2 italic">No practitioners scheduled for today.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Patients" value={patients.length} trend={4.2} icon={Users} color="bg-blue-600 text-blue-600" />
        <StatCard label="Today's Visits" value={todayAppts} trend={12.8} icon={CalendarCheck} color="bg-purple-600 text-purple-600" />
        <StatCard label="Daily Revenue" value={`${todayAppts * 450} EGP`} trend={8.1} icon={TrendingUp} color="bg-green-600 text-green-600" />
        <StatCard label="System Integrity" value="100%" trend={0} icon={ShieldCheck} color="bg-orange-600 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black dark:text-white uppercase tracking-widest text-[12px] text-gray-400">Yield Analytics</h3>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px' }} 
                  itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="patients" stroke="#2563eb" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-xl font-black dark:text-white uppercase tracking-widest text-[12px] text-gray-400 mb-8">Database Health</h3>
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Local Storage</div>
                <div className="text-2xl font-black dark:text-white">2.4 <span className="text-sm text-gray-400">MB / 5.0</span></div>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <HardDrive size={20} />
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800">
              <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Data Safety</div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-xl font-black dark:text-white uppercase tracking-tighter">Verified</div>
                <span className="text-xs font-black text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full flex items-center">
                  <ShieldCheck size={12} className="mr-1" />
                  Local Only
                </span>
              </div>
            </div>
            <div className="p-6 bg-slate-800 rounded-3xl text-white shadow-lg shadow-slate-200 flex flex-col items-center justify-center h-32 text-center">
              <Activity className="mb-2 text-blue-400" size={24} />
              <div className="text-sm font-black uppercase tracking-widest">Desktop Host Ready</div>
              <div className="text-[10px] opacity-70">Internal Processor Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
