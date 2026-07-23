import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Search, Filter, Download, FileSpreadsheet, 
  ExternalLink, CheckCircle2, XCircle, Clock, RotateCcw,
  ArrowUpDown, ChevronDown, ListFilter, Globe, BookOpen,
  Zap, AlertCircle, BarChart3
} from 'lucide-react';
import { OIL_GAS_COMPANIES, POWER_COMPANIES } from '../constants';
import { QRCompanyStatus } from '../types';
import { checkARAvailability } from '../services/geminiService';

interface ARStatusProps {}

const YEARS = ["FY24", "FY25", "FY26", "FY27"];

const ARStatus: React.FC<ARStatusProps> = () => {
  const [category, setCategory] = useState<'Oil & Gas' | 'Power' | 'Other'>('Oil & Gas');
  const [otherCompanyNameInput, setOtherCompanyNameInput] = useState('');
  const [year, setYear] = useState('FY26');
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
      quarter: year, // use quarter field to store year for compatibility
      status: 'Not Available',
      publishedDate: 'Checking...',
      source: 'Awaited',
      bseLink: c.bseLink,
      remarks: 'Sync required',
      category: category,
      downloadUrl: c.website || c.bseLink
    }));
    setData(initialData);
  }, [category, year]);

  const handleDownload = async (row: QRCompanyStatus) => {
    if (!row.downloadUrl) return;

    try {
      const fileName = `${row.companyName.replace(/\s+/g, '_')}_Annual_Report_${row.quarter}.pdf`;

      const response = await fetch(row.downloadUrl, { mode: 'cors' }).catch(() => {
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

      const newData = data.map(d => 
        d.companyName === row.companyName ? { ...d, status: 'Downloaded' as const } : d
      );
      setData(newData);
    } catch (err) {
      window.open(row.downloadUrl, '_blank');
      
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
    
    newData[dataIdx] = { ...company, remarks: 'Scanning...', publishedDate: '...' };
    setData([...newData]);

    const fetchWithRetry = async (cName: string, yr: string, retries = 3, backoff = 10000) => {
      for (let i = 0; i < retries; i++) {
        try {
          return await checkARAvailability(cName, yr);
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
      const result = await fetchWithRetry(company.companyName, year);
      if (result) {
        newData[dataIdx] = {
          ...company,
          status: result.status === 'Available' ? 'Available' :
                  result.status === 'Not confirmed' ? 'Not confirmed' :
                  result.status === 'Error' ? 'Error' : 'Not Available',
          publishedDate: result.expectedDate || (result.status === 'Available' ? 'Released' : (result.status === 'Not confirmed' ? 'TBA' : 'Pending')),
          source: result.sourceTitle || (result.status === 'Available' ? 'Official Portal' : 'Official Portal'),
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

    // Set all to checking state
    for (let i = 0; i < newData.length; i++) {
      newData[i] = { ...newData[i], remarks: 'Scan queued...', publishedDate: '...' };
    }
    setData([...newData]);

    const fetchWithRetry = async (cName: string, yr: string, retries = 3, backoff = 10000) => {
      for (let k = 0; k < retries; k++) {
        try {
          return await checkARAvailability(cName, yr);
        } catch (err: any) {
          const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
          const isRateLimit = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
          
          if (isRateLimit && k < retries - 1) {
            const waitTime = backoff * Math.pow(2, k);
            setError(`API rate limit hit. Pausing for ${Math.round(waitTime/1000)} seconds before retry...`);
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
        const result = await fetchWithRetry(company.companyName, year);
        if (result) {
          newData[i] = {
            ...newData[i],
            status: result.status === 'Available' ? 'Available' :
                    result.status === 'Not confirmed' ? 'Not confirmed' :
                    result.status === 'Error' ? 'Error' : 'Not Available',
            publishedDate: result.expectedDate || (result.status === 'Available' ? 'Released' : (result.status === 'Not confirmed' ? 'TBA' : 'Pending')),
            source: result.sourceTitle || (result.status === 'Available' ? 'Official Portal' : 'Official Portal'),
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
        newData[i] = { ...newData[i], status: 'Error', remarks: 'Scan failed. Rate limit or connection issue.' };
        setData([...newData]);
      }

      // Add a slight delay between requests to help respect rate limits
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    setIsRefreshing(false);
  };

  const handleAddCustomCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherCompanyNameInput.trim()) return;

    const newCompany: QRCompanyStatus = {
      companyName: otherCompanyNameInput.trim(),
      quarter: year,
      status: 'Not Available',
      publishedDate: 'Checking...',
      source: 'Awaited',
      remarks: 'Custom addition',
      category: 'Other',
      downloadUrl: ''
    };

    setData(prev => [...prev, newCompany]);
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
    let sortableItems = [...data];
    if (searchTerm.trim() !== '') {
      sortableItems = sortableItems.filter(item => 
        item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.remarks.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig, searchTerm]);

  const getStatusBadge = (status: QRCompanyStatus['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#1DB88E] border border-[#1DB88E]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Available
          </span>
        );
      case 'Not confirmed':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/20">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Not confirmed
          </span>
        );
      case 'Downloaded':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EEF2FF] text-[#4F46E5] border border-[#4F46E5]/20">
            <Download className="w-3.5 h-3.5" />
            Downloaded
          </span>
        );
      case 'Error':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Error
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#F43F5E] border border-[#F43F5E]/20">
            <XCircle className="w-3.5 h-3.5" />
            Not Available
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#5B5BF5] uppercase tracking-widest font-mono">FINANCIAL STATEMENTS RADAR</span>
            <span className="bg-[#5B5BF5]/10 text-[#5B5BF5] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">ANNUAL</span>
          </div>
          <h2 className="text-4xl font-extrabold text-[#1A1A2E] tracking-tight">Annual Report Status Monitor</h2>
          <p className="text-[#555566] text-sm font-semibold max-w-2xl">
            Real-time checking and retrieval of official corporate annual reports directly from investor relations portals.
          </p>
        </div>

        <button
          disabled={isRefreshing || data.length === 0}
          onClick={handleDeepScan}
          className="btn-primary px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-lg hover:scale-105 active:scale-100 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {isRefreshing ? (
             <>
               <RotateCcw className="w-4 h-4 animate-spin" />
               Scanning Registry...
             </>
          ) : (
             <>
               <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
               Deep Scan All
             </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {/* Control Filters Board */}
      <div className="p-6 bg-white border border-[#E5E5F0] rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setCategory('Oil & Gas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${category === 'Oil & Gas' ? 'bg-[#3D3DC4] text-white border-[#3D3DC4] shadow-md shadow-blue-500/10' : 'bg-transparent text-[#555566] border-[#E5E5F0] hover:bg-[#F3F3FE] hover:text-[#1A1A2E]'}`}
          >
            Oil & Gas Sector
          </button>
          <button 
            onClick={() => setCategory('Power')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${category === 'Power' ? 'bg-[#3D3DC4] text-white border-[#3D3DC4] shadow-md shadow-blue-500/10' : 'bg-transparent text-[#555566] border-[#E5E5F0] hover:bg-[#F3F3FE] hover:text-[#1A1A2E]'}`}
          >
            Power Sector
          </button>
          <button 
            onClick={() => setCategory('Other')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${category === 'Other' ? 'bg-[#3D3DC4] text-white border-[#3D3DC4] shadow-md shadow-blue-500/10' : 'bg-transparent text-[#555566] border-[#E5E5F0] hover:bg-[#F3F3FE] hover:text-[#1A1A2E]'}`}
          >
            Custom Registry
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Target Financial Year Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <span className="text-xs font-bold text-[#888899] uppercase tracking-wider shrink-0">Fiscal Year:</span>
            <div className="relative w-full sm:w-36">
              <select 
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E5E5F0] rounded-xl py-2.5 pl-4 pr-10 text-xs font-bold text-[#1A1A2E] appearance-none outline-none focus:border-[#3D3DC4] focus:ring-4 focus:ring-[#3D3DC4]/10 transition-all cursor-pointer"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899] pointer-events-none" />
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899]" />
            <input 
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E5F0] rounded-xl py-2 pl-10 pr-4 text-xs font-semibold focus:ring-4 focus:ring-[#3D3DC4]/10 focus:border-[#3D3DC4] transition-all outline-none text-[#1A1A2E]"
            />
          </div>
        </div>
      </div>

      {category === 'Other' && (
        <form onSubmit={handleAddCustomCompany} className="p-6 bg-white border border-[#E5E5F0] rounded-3xl flex flex-col sm:flex-row gap-4 items-end shadow-sm">
          <div className="space-y-2 flex-1 w-full">
            <label className="text-[11px] font-bold uppercase text-[#555566] tracking-wider">Add Custom Registry Company</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899]" />
              <input 
                type="text"
                placeholder="e.g., Bharat Heavy Electricals Limited"
                value={otherCompanyNameInput}
                onChange={(e) => setOtherCompanyNameInput(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E5E5F0] rounded-xl py-3 pl-11 pr-4 text-xs font-bold transition-all outline-none focus:ring-4 focus:ring-[#3D3DC4]/10 focus:border-[#3D3DC4] text-[#1A1A2E]"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="btn-primary w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0"
          >
            Add to Monitor
          </button>
        </form>
      )}

      {/* Main Companies Registry Table */}
      <div className="bg-white border border-[#E5E5F0] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5F0] bg-slate-50/50 text-[10px] font-bold text-[#888899] uppercase tracking-wider">
                <th className="py-4 px-6 select-none cursor-pointer hover:bg-slate-50" onClick={() => handleSort('companyName')}>
                  <div className="flex items-center gap-1">
                    Company Name
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-6 select-none cursor-pointer hover:bg-slate-50" onClick={() => handleSort('quarter')}>
                  <div className="flex items-center gap-1">
                    Fiscal Year
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-6 select-none cursor-pointer hover:bg-slate-50" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-6 select-none cursor-pointer hover:bg-slate-50" onClick={() => handleSort('publishedDate')}>
                  <div className="flex items-center gap-1">
                    Published / Expected
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-4 px-6">Official Registry Link</th>
                <th className="py-4 px-6">Intelligence Summary & Remarks</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5F0] text-[13px]">
              {sortedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                  <td className="py-4.5 px-6 font-extrabold text-[#1A1A2E]">{row.companyName}</td>
                  <td className="py-4.5 px-6 font-bold text-[#888899]">{row.quarter}</td>
                  <td className="py-4.5 px-6">{getStatusBadge(row.status)}</td>
                  <td className="py-4.5 px-6 font-bold text-[#555566]">
                    {row.publishedDate}
                  </td>
                  <td className="py-4.5 px-6">
                    {row.downloadUrl ? (
                      <a 
                        href={row.downloadUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#3D3DC4] hover:text-[#5B5BF5] font-bold"
                      >
                        Investor Portal
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[#888899] italic font-semibold">Not Linkable</span>
                    )}
                  </td>
                  <td className="py-4.5 px-6 font-semibold text-[#555566] max-w-sm truncate" title={row.remarks}>
                    {row.remarks}
                  </td>
                  <td className="py-4.5 px-6 text-right space-x-2 shrink-0 whitespace-nowrap">
                    <button 
                      onClick={() => handleSingleScan(row.companyName)}
                      className="px-3 py-1.5 rounded-lg border border-[#E5E5F0] hover:border-[#3D3DC4] hover:bg-[#F3F3FE] text-xs font-bold text-[#555566] hover:text-[#3D3DC4] transition-all"
                    >
                      Run Scan
                    </button>
                    <button 
                      disabled={row.status !== 'Available' && row.status !== 'Downloaded'}
                      onClick={() => handleDownload(row)}
                      className="p-1.5 rounded-lg border border-[#E5E5F0] hover:border-emerald-600 hover:bg-[#ECFDF5] text-xs font-bold text-[#555566] hover:text-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#E5E5F0] disabled:hover:bg-transparent disabled:hover:text-[#555566]"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs font-bold text-[#888899] italic uppercase tracking-wider bg-slate-50/10">
                    No matching companies found in this monitor category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ARStatus;
