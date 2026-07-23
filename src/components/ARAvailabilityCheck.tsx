import React, { useState } from 'react';
import { 
  Search, Calendar, ExternalLink, CheckCircle2, XCircle, 
  Clock, ArrowRight, Building2, ChevronDown, ListFilter,
  BarChart3, Loader2, Edit3, X, Globe
} from 'lucide-react';
import { OIL_GAS_COMPANIES, POWER_COMPANIES } from '../constants';
import { checkARAvailability } from '../services/geminiService';
import { QRAvailabilityStatus } from '../types';

interface ARAvailabilityCheckProps {
  onClose: () => void;
}

const ARAvailabilityCheck: React.FC<ARAvailabilityCheckProps> = ({ onClose }) => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [searchedCompany, setSearchedCompany] = useState('');
  const [period, setPeriod] = useState('FY26');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QRAvailabilityStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    const companyToSearch = selectedCompany === 'Other' ? customCompany : selectedCompany;
    if (!companyToSearch) return;

    setSearchedCompany(companyToSearch);
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await checkARAvailability(companyToSearch, period);
      setResult(data);
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
      if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        setError("Gemini API rate limit exceeded. Please wait a minute and try again.");
      } else {
        setError("Failed to check availability. Please try again.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const themeClasses = {
    card: "bg-white border-[#E5E5F0] shadow-xl",
    input: "bg-white border-[#E5E5F0] text-[#1A1A2E]",
    textMuted: "text-[#888899]",
    accent: "text-[#5B5BF5]"
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return <CheckCircle2 className="w-6 h-6 text-[#1DB88E]" />;
      case 'Not Available': return <XCircle className="w-6 h-6 text-red-500" />;
      case 'Not confirmed': return <Clock className="w-6 h-6 text-[#E67E22]" />;
      default: return null;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-[#EEF9F6] border-[#1DB88E]/20 text-[#1DB88E]';
      case 'Not Available': return 'bg-red-50/70 border-red-200/50 text-red-600';
      case 'Not confirmed': return 'bg-[#FEF3EB] border-[#E67E22]/20 text-[#E67E22]';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
      <div className={`w-full max-w-2xl rounded-[2rem] border overflow-hidden animate-in zoom-in-95 duration-300 ${themeClasses.card}`}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#E5E5F0] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#3D3DC4] text-white">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1A1A2E]">AR Availability Monitor</h2>
              <p className={`text-xs font-medium ${themeClasses.textMuted}`}>Check latest annual financial report status</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-[#F3F3FE] transition-colors ${themeClasses.textMuted} hover:text-[#1A1A2E]`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Selection */}
            <div className="space-y-2">
              <label className={`text-sm font-bold flex items-center gap-2 ${themeClasses.textMuted}`}>
                <Building2 className="w-4 h-4" />
                Select Company
              </label>
              <div className="relative group">
                <select 
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className={`w-full appearance-none px-4 py-3.5 rounded-xl border-2 transition-all outline-none focus:ring-4 focus:ring-[#3D3DC4]/10 focus:border-[#3D3DC4] font-medium ${themeClasses.input}`}
                >
                  <option value="">Select a company...</option>
                  <optgroup label="Oil & Gas Assets">
                    {OIL_GAS_COMPANIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </optgroup>
                  <optgroup label="Power & Utility Assets">
                    {POWER_COMPANIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </optgroup>
                  <optgroup label="Standard Options">
                    <option value="Other">Other Company</option>
                  </optgroup>
                </select>
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${themeClasses.textMuted}`} />
              </div>
            </div>

            {selectedCompany === 'Other' && (
              <div className="space-y-2 animate-in slide-in-from-left-4">
                <label className={`text-sm font-bold flex items-center gap-2 ${themeClasses.textMuted}`}>
                  <Edit3 className="w-4 h-4" />
                  Company Name
                </label>
                <input 
                  type="text" 
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="e.g. HDFC Bank, Infy"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all outline-none focus:ring-4 focus:ring-[#3D3DC4]/10 focus:border-[#3D3DC4] font-medium ${themeClasses.input}`}
                />
              </div>
            )}

            {/* Period Selection */}
            <div className="space-y-2">
              <label className={`text-sm font-bold flex items-center gap-2 ${themeClasses.textMuted}`}>
                <Calendar className="w-4 h-4" />
                Fiscal Year
              </label>
              <input 
                type="text" 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. FY26"
                className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all outline-none focus:ring-4 focus:ring-[#3D3DC4]/10 focus:border-[#3D3DC4] font-medium ${themeClasses.input}`}
              />
            </div>
          </div>

          <button 
            onClick={handleCheck}
            disabled={(!selectedCompany || (selectedCompany === 'Other' && !customCompany.trim())) || isLoading}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] group btn-primary"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Check Result Status
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Result Area */}
          {result && (
            <div className={`p-6 rounded-2xl border-2 animate-in slide-in-from-top-4 duration-500 ${getStatusBg(result.status)} border-[#E5E5F0]`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm border border-[#E5E5F0]">
                    {getStatusIcon(result.status)}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white shadow-sm border border-[#E5E5F0] mb-1 inline-block text-[#5B5BF5]">
                      {result.status}
                    </span>
                    <h3 className="text-2xl font-black tracking-tight text-[#1A1A2E]">{searchedCompany}</h3>
                  </div>
                </div>
                {(() => {
                  const displayUrl = result.sourceUrl || '';
                  const displayTitle = result.sourceTitle || 'Official Website';
                  return (
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Source Registry</span>
                      {displayUrl ? (
                        <a 
                          href={displayUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`p-2.5 rounded-xl bg-white shadow-md border border-[#E5E5F0] hover:scale-110 transition-all flex items-center gap-2 ${themeClasses.accent}`}
                          title={displayTitle}
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span className="text-xs font-black uppercase tracking-tight">Access</span>
                        </a>
                      ) : (
                        <span className="p-2.5 rounded-xl bg-white shadow-md border border-[#E5E5F0] flex items-center gap-2 text-[#888899] text-xs font-bold">
                          <Globe className="w-5 h-5" />
                          {displayTitle}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl border border-[#E5E5F0] bg-white transition-all">
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-[#888899]">Release Information</p>
                  <p className="text-xl font-black flex items-center gap-2 text-[#1A1A2E]">
                    <Clock className={`w-5 h-5 ${themeClasses.accent}`} />
                    {result.expectedDate || (result.status === 'Available' ? 'Released' : (result.status === 'Not confirmed' ? 'TBA' : 'Pending'))}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[#E5E5F0] bg-white transition-all">
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-[#888899]">Target Period</p>
                  <p className="text-xl font-black flex items-center gap-2 text-[#1A1A2E]">
                    <Calendar className={`w-5 h-5 ${themeClasses.accent}`} />
                    {period}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-black uppercase tracking-wider mb-3 text-[#888899]">Intelligence Summary</p>
                <div className="p-6 rounded-xl border border-[#E5E5F0] leading-relaxed font-bold text-sm bg-white text-[#555566]">
                  {result.summary}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between text-[11px] font-black border-t border-dashed pt-6 border-slate-500/20">
                <div className="flex items-center gap-2">
                  <ListFilter className={`w-4 h-4 ${themeClasses.accent}`} />
                  <span className="text-[#888899]">Information Source:</span>
                  <span className="text-[#1A1A2E]">
                    {result.sourceTitle || (result.sourceUrl ? new URL(result.sourceUrl).hostname : 'Institutional Registry')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ARAvailabilityCheck;
