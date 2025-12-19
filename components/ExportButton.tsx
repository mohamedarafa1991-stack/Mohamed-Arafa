
import React, { useState } from 'react';
import { Download, ChevronDown, FileText, Table, FileSpreadsheet } from 'lucide-react';
import { ExportService, ExportFormat } from '../services/ExportService';

interface ExportButtonProps {
  data: any[];
  fileName: string;
  variant?: 'primary' | 'secondary';
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, fileName, variant = 'secondary' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: ExportFormat) => {
    ExportService.exportData(data, fileName, format);
    setIsOpen(false);
  };

  const baseStyles = "flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all font-bold relative";
  const primaryStyles = "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100";
  const secondaryStyles = "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700";

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseStyles} ${variant === 'primary' ? primaryStyles : secondaryStyles}`}
      >
        <Download size={18} />
        <span>Export</span>
        <ChevronDown size={14} className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <button 
              onClick={() => handleExport('CSV')}
              className="w-full flex items-center space-x-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 text-left text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors"
            >
              <FileText size={16} className="text-blue-500" />
              <span>Export as CSV</span>
            </button>
            <button 
              onClick={() => handleExport('EXCEL')}
              className="w-full flex items-center space-x-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 text-left text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors border-t border-gray-50 dark:border-slate-700"
            >
              <FileSpreadsheet size={16} className="text-emerald-500" />
              <span>Export as Excel</span>
            </button>
            <button 
              onClick={() => handleExport('PDF')}
              className="w-full flex items-center space-x-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 text-left text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors border-t border-gray-50 dark:border-slate-700"
            >
              <Table size={16} className="text-red-500" />
              <span>Export as PDF</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
