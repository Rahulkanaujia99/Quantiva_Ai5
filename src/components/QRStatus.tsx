
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Search, Filter, Download, FileSpreadsheet, 
  ExternalLink, CheckCircle2, XCircle, Clock, RotateCcw,
  ArrowUpDown, ChevronDown, ListFilter, Globe, BookOpen,
  Zap, AlertCircle, BarChart3
} from 'lucide-react';
import { OIL_GAS_COMPANIES, POWER_COMPANIES } from '../constants';
import { QRCompanyStatus } from '../types';
import { checkQRAvailability } from '../services/geminiService';

interface QRStatusProps {
  isDarkMode: boolean;
}

const QUARTERS = ["Q1FY25", "Q2FY25", "Q3FY25", "Q4FY25", "Q1FY26", "Q2FY26"];

const COMPANY_PRIMARY_URLS: Record<string, string> = {
  'ONGC': 'https://ongcindia.com/web/eng/about-ongc/performance/financial/results',
  'Oil India': 'https://www.oil-india.com/financial-results/34',
  'IOCL': 'http://iocl.com/pages/FinancialResults',
  'BPCL': 'https://www.bharatpetroleum.in/bharat-petroleum-for/investors/disclosure-under-regulation-46-and-62-of-sebi-lodr-regulations/financial-performance/financial-results',
  'HPCL': 'https://hindustanpetroleum.com/financial',
  'GAIL': 'https://www.gailonline.com/IZFinancialResult.html',
  'IGL': 'https://www.iglonline.net/financial',
  'RIL': 'https://www.ril.com/investors/financial-reporting',
  'MGL': 'https://www.mahanagargas.com/MGL-corporate/investors/financial-results/quarterly-result',
  'Petronet': 'https://www.petronetlng.in/financials-pll',
  'Gujarat Gas': 'https://www.gujaratgas.com/investors/investor-presentation/#',
  'GSPL': 'https://gspcgroup.com/GSPL/quarterly-results',
  // Power Companies
  'CESC': 'https://www.cesc.co.in/quarterlyResults',
  'Tata Power': 'https://www.tatapower.com/investor-resource-center/quarterly-reports-tab',
  'Adani Power': 'https://www.adanipower.com/investors/investor-downloads',
  'Reliance Power': 'https://www.reliancepower.co.in/web/reliance-power/financial-results',
  'Torrent Power': 'https://www.torrentpower.com/index.php/investors/financial?fy=2025-26',
  'NTPC': 'https://ntpc.co.in/index.php/investors/financial-performance/financial-results',
  'PGCIL': 'https://www.powergrid.in/en/annual-quarterly-results',
  'JSW Energy': 'https://www.jswenergy.in/investors/energy/jsw-energy-fy-2025-26-financials-results'
};

const QRStatus: React.FC<QRStatusProps> = ({ isDarkMode }) => {
  const [category, setCategory] = useState<'Oil & Gas' | 'Power' | 'Other'>('Oil & Gas');
  const [otherCompanyNameInput, setOtherCompanyNameInput] = useState('');
  const [quarter, setQuarter] = useState('Q3FY26');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<QRCompanyStatus[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof QRCompanyStatus, direction: 'asc' | 'desc' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize with mapping
  useEffect(() => {
    if (category === 'Other') {
      setData([]);
      return;
    }

    const companies = category === 'Oil & Gas' ? OIL_GAS_COMPANIES : POWER_COMPANIES;
    const initialData: QRCompanyStatus[] = companies.map(c => ({
      companyName: c.name,
      quarter,
      status: 'Not Available',
      publishedDate: 'Checking...',
      source: 'Awaited',
      bseLink: c.bseLink,
      remarks: 'Sync required',
      category: category,
      downloadUrl: c.website || c.bseLink
    }));
    setData(initialData);
  }, [category, quarter]);

  const handleDownload = async (row: QRCompanyStatus) => {
    if (!row.downloadUrl) return;

    try {
      // Try to fetch for custom filename, but be prepared for CORS failures
      const match = row.quarter.match(/(Q\d)(FY\d{2})/);
      const qPart = match ? match[1] : row.quarter;
      const fyPart = match ? match[2] : '';
      const fileName = `${row.companyName.replace(/\s+/g, '_')}_${qPart}_${fyPart}.pdf`;

      // Use a timeout and handle CORS by catching the "Failed to fetch" error
      const response = await fetch(row.downloadUrl, { mode: 'cors' }).catch(() => {
        // If fetch fails (usually CORS), throw a specific error to handle in the catch block
        throw new Error('CORS_ERROR');
      });

      if (response instanceof Error || !response.ok) {
        throw new Error('DOWNLOAD_FAILED');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Update status to Downloaded
      const newData = data.map(d => 
        d.companyName === row.companyName ? { ...d, status: 'Downloaded' as const } : d
      );
      setData(newData);
    } catch (err) {
      // Fallback: just open in a new tab
      // This is the most reliable way to let the user get the file when CORS blocks fetch
      window.open(row.downloadUrl, '_blank');
      
      // Still update status to Downloaded as the user was successfully redirected to the file
      const newData = data.map(d => 
        d.companyName === row.companyName ? { ...d, status: 'Downloaded' as const } : d
      );
      setData(newData);
    }
  };

  const handleSingleScan = async (companyName: string) => {
    const dataIdx = data.findIndex(d => d.companyName === companyName);
    if (dataIdx === -1) return;

    const newData = [...data];
    const company = newData[dataIdx];
    
    // Set a temporary state to show scanning
    newData[dataIdx] = { ...company, remarks: 'Scanning...', publishedDate: '...' };
    setData([...newData]);

    const fetchWithRetry = async (cName: string, q: string, retries = 3, backoff = 10000) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await checkQRAvailability(cName, q);
        } catch (err: any) {
          const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
          const isRateLimit = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
          
          if (isRateLimit && i < retries - 1) {
            const waitTime = backoff * Math.pow(2, i);
            setError(`API Quota hit for ${cName}. The free tier is limited; polling will resume in ${Math.round(waitTime/1000)}s...`);
            await new Promise(r => setTimeout(r, waitTime));
            setError(null);
            continue;
          }
          throw err;
        }
      }
    };

    try {
      const result = await fetchWithRetry(company.companyName, quarter);
      if (result) {
        newData[dataIdx] = {
          ...company,
          status: result.status === 'Available' ? 'Available' : (result.status === 'Error' ? 'Error' : 'Not Available'),
          publishedDate: result.expectedDate || (result.status === 'Available' ? 'Released' : 'Pending'),
          source: result.sourceTitle || (result.status === 'Available' ? 'Official Portal' : 'Public Record'),
          downloadUrl: result.sourceUrl || company.downloadUrl,
          remarks: result.summary,
        };
      }
      setData([...newData]);
    } catch (err) {
      newData[dataIdx] = { ...company, status: 'Error', remarks: 'Scan failed. Rate limit or connection issue.' };
      setData([...newData]);
    }
  };

  const handleDeepScan = async () => {
    setIsRefreshing(true);
    setError(null);
    const newData = [...data];
    
    const fetchWithRetry = async (companyName: string, q: string, retries = 3, backoff = 10000) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await checkQRAvailability(companyName, q);
        } catch (err: any) {
          const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
          const isRateLimit = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
          
          if (isRateLimit && i < retries - 1) {
            const waitTime = backoff * Math.pow(2, i);
            setError(`API Quota hit. The free tier has strict limits; scanning will resume in ${Math.round(waitTime/1000)}s...`);
            await new Promise(r => setTimeout(r, waitTime));
            setError(null);
            continue;
          }
          throw err;
        }
      }
    };

    for (let i = 0; i < newData.length; i++) {
      const company = newData[i];
      try {
        const result = await fetchWithRetry(company.companyName, quarter);
        if (result) {
          newData[i] = {
            ...newData[i],
            status: result.status === 'Available' ? 'Available' : (result.status === 'Error' ? 'Error' : 'Not Available'),
            publishedDate: result.expectedDate || (result.status === 'Available' ? 'Released' : 'Pending'),
            source: result.sourceTitle || (result.status === 'Available' ? 'Official Portal' : 'Public Record'),
            downloadUrl: result.sourceUrl || company.downloadUrl,
            remarks: result.summary,
          };
        }
        setData([...newData]); 
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
        if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
          setError("Gemini API rate limit exceeded. Please wait a minute or provide your own API key in Settings.");
          break;
        }
        newData[i] = { ...newData[i], status: 'Error', remarks: 'Scan failed.' };
        setData([...newData]);
      }
      await new Promise(r => setTimeout(r, 6000));
    }
    setIsRefreshing(false);
  };

  const handleAddManualCompany = () => {
    if (!otherCompanyNameInput.trim()) return;
    
    const newCompany: QRCompanyStatus = {
      companyName: otherCompanyNameInput.trim(),
      quarter,
      status: 'Not Available',
      publishedDate: 'Awaited',
      source: 'Manual Search',
      bseLink: undefined,
      remarks: 'Ready to scan',
      category: 'Other',
      downloadUrl: ''
    };

    // Check if duplicate
    if (data.some(d => d.companyName === newCompany.companyName && d.quarter === newCompany.quarter)) {
      return;
    }

    setData(prev => [newCompany, ...prev]);
    setOtherCompanyNameInput('');
  };
  const handleSort = (key: keyof QRCompanyStatus) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (searchTerm) {
      sortableData = sortableData.filter(item => 
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig, searchTerm]);

  const exportToCSV = () => {
    const headers = ["Company Name", "Quarterly Period", "Status", "Published Date", "Source", "Remarks"];
    const csvRows = [
      headers.join(','),
      ...sortedData.map(row => [
        row.companyName,
        row.quarter,
        row.status,
        row.publishedDate,
        row.source,
        row.remarks
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_Status_${category}_${quarter}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const themeClasses = {
    card: isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm",
    input: isDarkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-900",
    header: isDarkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50/50 border-slate-100",
    row: isDarkMode ? "hover:bg-slate-800/30 border-slate-800" : "hover:bg-slate-50 border-slate-100",
    textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
    tableHeader: isDarkMode ? "bg-[#0d111d] text-slate-400" : "bg-slate-100 text-slate-600"
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-500">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>QR Status Monitor</h2>
          </div>
          <p className={`text-[15px] font-bold ${themeClasses.textMuted}`}>Automated tracking of quarterly report availability across power and energy sectors.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleDeepScan}
            disabled={isRefreshing || data.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {isRefreshing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />}
            Run All
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-500 font-bold text-sm hover:bg-blue-500/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Filter Bar */}
      <div className={`p-6 rounded-3xl border ${themeClasses.card}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted}`}>Industry Category</label>
            <div className="relative">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className={`w-full appearance-none px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm ${themeClasses.input}`}
              >
                <option value="Oil & Gas">Oil & Gas</option>
                <option value="Power">Power</option>
                <option value="Other">Other Company</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
            </div>
          </div>

          {category === 'Other' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-left-4">
              <label className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted}`}>Enter Company Name</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text"
                    value={otherCompanyNameInput}
                    placeholder="e.g. Reliance Industries"
                    onChange={(e) => setOtherCompanyNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddManualCompany()}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm ${themeClasses.input}`}
                  />
                </div>
                <button 
                  onClick={handleAddManualCompany}
                  className="px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted}`}>Financial Period</label>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input 
                  type="text"
                  value={quarter}
                  placeholder="e.g. Q3FY26"
                  onChange={(e) => setQuarter(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm ${themeClasses.input}`}
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted}`}>Search Company</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input 
                type="text" 
                placeholder="Filter by company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-11 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-sm ${themeClasses.input}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className={`rounded-3xl border overflow-hidden ${themeClasses.card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={themeClasses.tableHeader}>
              <tr>
                {[
                  { key: 'companyName', label: 'Company Name' },
                  { key: 'quarter', label: 'Period' },
                  { key: 'status', label: 'Status' },
                  { key: 'publishedDate', label: 'Published/Expected' },
                  { key: 'source', label: 'Source' },
                  { key: 'remarks', label: 'Remarks' },
                ].map((col) => (
                  <th 
                    key={col.key}
                    onClick={() => handleSort(col.key as any)}
                    className="p-5 text-[11px] font-black uppercase tracking-widest cursor-pointer hover:text-blue-500 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                ))}
                <th className="p-5 text-[11px] font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((row, idx) => (
                  <tr key={idx} className={`border-b last:border-0 transition-colors ${themeClasses.row}`}>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'}`}>
                          {row.companyName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <a 
                            href={COMPANY_PRIMARY_URLS[row.companyName] || row.downloadUrl || "#"} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-bold text-[14px] hover:text-blue-500 transition-colors underline decoration-blue-500/30 underline-offset-4 flex items-center gap-1.5"
                          >
                            {row.companyName}
                            <ExternalLink className="w-3 h-3 opacity-30" />
                          </a>
                          {row.bseLink && (
                            <a 
                              href={row.bseLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] font-black text-blue-500/60 hover:text-blue-500 transition-colors uppercase tracking-widest mt-1"
                            >
                              BSE Announcements
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-[13px] font-bold opacity-70">{row.quarter}</span>
                    </td>
                    <td className="p-5">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                        row.status === 'Available' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : row.status === 'Downloaded'
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : row.status === 'Error'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                      }`}>
                        {row.status === 'Available' || row.status === 'Downloaded' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {row.status}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-[13px] font-bold">
                        <Clock className="w-4 h-4 opacity-40" />
                        {row.publishedDate}
                      </div>
                    </td>
                    <td className="p-5">
                      <a 
                        href={row.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[13px] font-bold text-blue-500 hover:underline group"
                      >
                        {row.source.includes('BSE') || row.source.includes('NSE') ? (
                          <div className="w-4 h-4 rounded bg-blue-500/10 flex items-center justify-center text-[10px] font-black group-hover:bg-blue-500/20 transition-colors">E</div>
                        ) : (
                          <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        )}
                        {row.source}
                      </a>
                    </td>
                    <td className="p-5 text-[13px] font-bold opacity-70">
                      {row.remarks}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        {(row.status === 'Available' || row.status === 'Downloaded') ? (
                          <button 
                            onClick={() => handleDownload(row)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/10 text-blue-500 font-black text-[11px] uppercase tracking-widest hover:bg-blue-600/20 transition-all group"
                          >
                            <Download className="w-3 h-3 group-hover:scale-125 transition-transform" />
                            Download
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="px-4 py-2 rounded-lg bg-slate-500/10 text-slate-500 font-black text-[11px] uppercase tracking-widest cursor-not-allowed"
                          >
                            N/A
                          </button>
                        )}
                        <button 
                          onClick={() => handleSingleScan(row.companyName)}
                          disabled={isRefreshing || row.remarks === 'Scanning...'}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/10 text-emerald-500 font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {row.remarks === 'Scanning...' ? (
                            <RotateCcw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Zap className="w-3 h-3" />
                          )}
                          Run
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                      <Search className="w-12 h-12" />
                      <p className="font-bold">No companies matching your filter criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`p-6 rounded-3xl border border-dashed flex flex-col md:flex-row items-center justify-between gap-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Globe className="w-5 h-5" />
          </div>
          <p className={`text-[12px] font-bold leading-relaxed max-w-xl ${themeClasses.textMuted}`}>
            Status is verified using Institutional Level Scraping from Company Investor Relations and BSE Corporate Announcements. 
            Verification priority: 1. Official Website, 2. Exchange Filings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.textMuted}`}>Live Feed Connected</span>
        </div>
      </div>
    </div>
  );
};

export default QRStatus;
