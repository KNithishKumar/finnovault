import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileText, FileSpreadsheet, BarChart2 } from 'lucide-react';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const [format, setFormat] = useState('pdf');
  const [range, setRange] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.downloadReport({ format, range });
      
      // Determine file extension
      let extension = 'pdf';
      if (format === 'excel') extension = 'xlsx';
      else if (format === 'csv') extension = 'csv';

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Finnovault_Report_${range}_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`${format.toUpperCase()} Report downloaded successfully!`);
    } catch (err) {
      toast.error('Could not generate report files. Try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Statement Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Generate and download financial accounting ledgers and summaries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Settings Card */}
        <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft space-y-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Export Configuration</h3>
          
          <div className="space-y-4">
            {/* Format select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">File Format</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setFormat('pdf')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition ${
                    format === 'pdf'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500'
                  }`}
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-xs">PDF Document</span>
                </button>
                <button
                  onClick={() => setFormat('excel')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition ${
                    format === 'excel'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500'
                  }`}
                >
                  <FileSpreadsheet className="w-6 h-6" />
                  <span className="text-xs">Excel Sheet</span>
                </button>
                <button
                  onClick={() => setFormat('csv')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition ${
                    format === 'csv'
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500'
                  }`}
                >
                  <BarChart2 className="w-6 h-6" />
                  <span className="text-xs">CSV Data</span>
                </button>
              </div>
            </div>

            {/* Time range select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Report Time Interval</label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none text-slate-800 dark:text-white"
              >
                <option value="weekly">Weekly Statement (Past 7 Days)</option>
                <option value="monthly">Monthly Statement (Current Month)</option>
                <option value="yearly">Yearly Statement (Full Calendar Year)</option>
              </select>
            </div>

            <button
              onClick={handleDownload}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl text-sm shadow-soft transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {loading ? 'Compiling Statement...' : 'Download Statement'}
            </button>
          </div>
        </div>

        {/* Info card */}
        <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-900 shadow-soft flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Finnovault Reports Engine</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
              Downloaded statements compile all transactions logged in the designated timeframe.
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-450 list-disc list-inside space-y-2">
              <li>PDF format generates a formatted audit statement showing assets vs liability summaries.</li>
              <li>Excel spreadsheet contains raw rows ready for sorting, editing, or uploading into tax software.</li>
              <li>CSV logs data in basic tabular strings compatible with bulk processors.</li>
            </ul>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-900 pt-4 mt-4 text-[10px] text-slate-400">
            Note: All asset values are calculated according to the live timezone and database states.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
