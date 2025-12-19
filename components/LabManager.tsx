
import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X, 
  User, 
  Stethoscope, 
  DollarSign, 
  Edit3,
  ListPlus,
  ArrowRight,
  Settings2,
  Save,
  Download
} from 'lucide-react';
import ExportButton from './ExportButton';
import { Patient, Doctor, LabRequest } from '../types';

interface LabManagerProps {
  labRequests: LabRequest[];
  patients: Patient[];
  doctors: Doctor[];
  onUpdate: (requests: LabRequest[]) => void;
}

interface MasterTest {
  id: string;
  name: string;
  defaultCost: number;
}

const MASTER_TESTS_KEY = 'medcore_master_lab_tests';

const LabManager: React.FC<LabManagerProps> = ({ labRequests, patients, doctors, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Master Test Catalog State
  const [masterTests, setMasterTests] = useState<MasterTest[]>(() => {
    const saved = localStorage.getItem(MASTER_TESTS_KEY);
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Complete Blood Count (CBC)', defaultCost: 150 },
      { id: '2', name: 'Lipid Profile', defaultCost: 350 },
      { id: '3', name: 'HbA1c', defaultCost: 200 },
      { id: '4', name: 'Liver Function Test (LFT)', defaultCost: 400 },
      { id: '5', name: 'Thyroid Profile (T3, T4, TSH)', defaultCost: 550 },
      { id: '6', name: 'Vitamin D', defaultCost: 800 },
      { id: '7', name: 'Urine Analysis', defaultCost: 80 },
    ];
  });

  // Modal State for New Lab Request
  const [formData, setFormData] = useState<Partial<LabRequest>>({
    patientId: '',
    doctorId: '', // Now optional
    tests: [{ name: '', cost: 0 }],
    status: 'PENDING'
  });

  // Save master tests to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(MASTER_TESTS_KEY, JSON.stringify(masterTests));
  }, [masterTests]);

  const exportData = labRequests.map(r => {
    const p = patients.find(pat => pat.id === r.patientId);
    const d = doctors.find(doc => doc.id === r.doctorId);
    return {
      RequestID: r.id,
      Date: r.date,
      Patient: p ? `${p.firstName} ${p.lastName}` : 'Unknown',
      Doctor: d ? d.name : 'None/External',
      Tests: r.tests.map(t => t.name).join(' | '),
      TotalCost: r.totalCost,
      Status: r.status
    };
  });

  const addTestRow = () => {
    setFormData({
      ...formData,
      tests: [...(formData.tests || []), { name: '', cost: 0 }]
    });
  };

  const handleTestSelection = (index: number, testName: string) => {
    const selectedMaster = masterTests.find(t => t.name === testName);
    const newTests = [...(formData.tests || [])];
    newTests[index] = { 
      name: testName, 
      cost: selectedMaster ? selectedMaster.defaultCost : 0 
    };
    setFormData({ ...formData, tests: newTests });
  };

  const updateTestCost = (index: number, cost: number) => {
    const newTests = [...(formData.tests || [])];
    newTests[index] = { ...newTests[index], cost };
    setFormData({ ...formData, tests: newTests });
  };

  const removeTestRow = (index: number) => {
    if ((formData.tests || []).length === 1) return;
    setFormData({
      ...formData,
      tests: (formData.tests || []).filter((_, i) => i !== index)
    });
  };

  const calculateTotal = () => {
    return (formData.tests || []).reduce((acc, test) => acc + (parseFloat(test.cost.toString()) || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId) return;

    const newRequest: LabRequest = {
      id: `LAB-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      patientId: formData.patientId,
      doctorId: formData.doctorId || 'EXTERNAL', // Allow blank/external
      date: new Date().toISOString(),
      status: 'PENDING',
      tests: formData.tests || [],
      totalCost: calculateTotal()
    };

    onUpdate([newRequest, ...labRequests]);
    setIsModalOpen(false);
    setFormData({ patientId: '', doctorId: '', tests: [{ name: '', cost: 0 }], status: 'PENDING' });
  };

  const updateStatus = (id: string, status: LabRequest['status']) => {
    onUpdate(labRequests.map(r => r.id === id ? { ...r, status } : r));
  };

  // Catalog Management Logic
  const addMasterTest = () => {
    const name = prompt("Enter new test name:");
    const cost = prompt("Enter default cost (EGP):");
    if (name && cost) {
      setMasterTests([...masterTests, { 
        id: Math.random().toString(36).substr(2, 5), 
        name, 
        defaultCost: parseFloat(cost) || 0 
      }]);
    }
  };

  const updateMasterCost = (id: string, newCost: string) => {
    setMasterTests(masterTests.map(t => 
      t.id === id ? { ...t, defaultCost: parseFloat(newCost) || 0 } : t
    ));
  };

  const deleteMasterTest = (id: string) => {
    if (confirm("Remove this test from the catalog?")) {
      setMasterTests(masterTests.filter(t => t.id !== id));
    }
  };

  const filteredRequests = labRequests.filter(r => {
    const patient = patients.find(p => p.id === r.patientId);
    const search = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(search) ||
      patient?.firstName.toLowerCase().includes(search) ||
      patient?.lastName.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">Laboratory Requests</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Direct clinical diagnostic orders and specimen tracking.</p>
        </div>
        <div className="flex space-x-3">
          <ExportButton data={exportData} fileName="Laboratory_Requests" />
          <button 
            onClick={() => setIsCatalogOpen(true)}
            className="flex items-center space-x-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-6 py-3 rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all font-bold"
          >
            <Settings2 size={20} />
            <span>Test Catalog</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 font-bold"
          >
            <Plus size={20} />
            <span>New Lab Request</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search request ID or patient..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl outline-none font-medium dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Request ID</th>
                <th className="px-8 py-5">Patient</th>
                <th className="px-8 py-5">Req. Doctor</th>
                <th className="px-8 py-5">Test Panel</th>
                <th className="px-8 py-5">Total Cost</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-gray-400 italic">No lab requests found in internal storage.</td>
                </tr>
              ) : (
                filteredRequests.map(request => {
                  const patient = patients.find(p => p.id === request.patientId);
                  const doctor = doctors.find(d => d.id === request.doctorId);
                  return (
                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="text-sm font-black dark:text-white">{request.id}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(request.date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold dark:text-gray-300">{patient?.firstName} {patient?.lastName}</div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-blue-600 dark:text-blue-400">
                        {doctor ? doctor.name : <span className="text-gray-400 italic">External / None</span>}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-1">
                          {request.tests.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-[9px] font-black text-gray-500 rounded-md uppercase border border-gray-200 dark:border-slate-700">
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black dark:text-white">{request.totalCost.toFixed(2)} EGP</td>
                      <td className="px-8 py-6">
                        <select 
                          value={request.status} 
                          onChange={(e) => updateStatus(request.id, e.target.value as any)}
                          className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border bg-transparent outline-none cursor-pointer ${
                            request.status === 'COMPLETED' ? 'text-emerald-600 border-emerald-200' :
                            request.status === 'PENDING' ? 'text-amber-600 border-amber-200' :
                            'text-gray-500 border-gray-200'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="COLLECTED">COLLECTED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-2 text-gray-400 hover:text-blue-600"><Edit3 size={18} /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catalog Management Modal */}
      {isCatalogOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black dark:text-white uppercase tracking-widest text-[14px]">Master Test Catalog</h3>
                <p className="text-gray-400 text-xs font-bold mt-1">Configure standard test names and default pricing.</p>
              </div>
              <button onClick={() => setIsCatalogOpen(false)} className="hover:bg-gray-100 dark:hover:bg-slate-700 p-3 rounded-2xl transition-all"><X size={20} /></button>
            </div>
            <div className="p-10 max-h-[500px] overflow-y-auto">
              <div className="space-y-4">
                {masterTests.map((test) => (
                  <div key={test.id} className="flex items-center space-x-4 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 group">
                    <div className="flex-1 font-black text-sm dark:text-white uppercase tracking-tight">{test.name}</div>
                    <div className="relative w-32">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="number" 
                        value={test.defaultCost} 
                        onChange={(e) => updateMasterCost(test.id, e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-black dark:text-white outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                    </div>
                    <button onClick={() => deleteMasterTest(test.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addMasterTest}
                  className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl text-xs font-black text-gray-400 uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" /> Add New Test Type
                </button>
              </div>
            </div>
            <div className="p-10 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/20 flex justify-end">
               <button onClick={() => setIsCatalogOpen(false)} className="px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-black shadow-lg shadow-blue-100">Save Catalog</button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Clinical Lab Requisition</h3>
                <p className="text-blue-100 text-xs mt-1 font-bold uppercase tracking-widest opacity-80">Specimen and Diagnostic Panel System</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-3 rounded-2xl transition-all active:scale-90"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                    <User size={12} className="mr-1" /> Subject Patient
                  </label>
                  <select 
                    required 
                    value={formData.patientId} 
                    onChange={e => setFormData({...formData, patientId: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="">-- Assign Patient --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                    <Stethoscope size={12} className="mr-1" /> Ordering Practitioner
                  </label>
                  <select 
                    value={formData.doctorId} 
                    onChange={e => setFormData({...formData, doctorId: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="">-- None / External Physician --</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <ListPlus size={16} className="mr-2 text-blue-600" /> Diagnostic Test Panel
                  </h4>
                  <button type="button" onClick={addTestRow} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">+ Add Entry</button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {(formData.tests || []).map((test, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 animate-in slide-in-from-right-4 duration-200">
                      <div className="col-span-7">
                        <div className="relative">
                          <select 
                            required
                            value={test.name}
                            onChange={e => handleTestSelection(index, e.target.value)}
                            className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold appearance-none cursor-pointer"
                          >
                            <option value="" disabled>-- Select Test from Catalog --</option>
                            {masterTests.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                      </div>
                      <div className="col-span-4 relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          type="number"
                          placeholder="Cost"
                          value={test.cost}
                          onChange={e => updateTestCost(index, parseFloat(e.target.value) || 0)}
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-bold"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button type="button" onClick={() => removeTestRow(index)} className="p-3 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-slate-700">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aggregate Settlement Cost</div>
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{calculateTotal().toFixed(2)} <span className="text-sm">EGP</span></div>
                </div>
                <div className="flex space-x-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-gray-400 font-bold hover:text-red-500 transition-all">Discard</button>
                  <button type="submit" className="px-12 py-4 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center">
                    Submit Requisition <ArrowRight size={18} className="ml-2" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ChevronDown = ({ className, size }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default LabManager;
