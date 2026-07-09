
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Sun, Moon, AlertCircle, Loader2, LayoutDashboard,
  TrendingUp, Globe, Briefcase, Zap, PieChart, Pickaxe, BarChart3,
  Search, Bell, Settings, User, FileText, Database, Archive, 
  ChevronRight, ShieldCheck, Gauge, Layers, Plus, Sparkles, Home, LogOut
} from 'lucide-react';
import { analyzeDocuments } from './services/geminiService';
import { ExtractedData } from './types';
import Dashboard from './components/Dashboard';
import QRAvailabilityCheck from './components/QRAvailabilityCheck';
import QRStatus from './components/QRStatus';
import { auth, signOut, onAuthStateChanged, User as FirebaseUser } from './services/firebase';
import { AuthScreen } from './components/AuthScreen';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pdfBase64List, setPdfBase64List] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [archive, setArchive] = useState<ExtractedData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isDarkMode = true;
  const [showQRCheck, setShowQRCheck] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'analysis' | 'archive' | 'qr-status' | 'qr-check'>('home');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0a0c14] flex flex-col justify-center items-center p-6 text-center select-none relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0c14] z-50 font-sans flex flex-col justify-center items-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-[#1e2433] flex items-center justify-center mb-6 shadow-2xl relative">
            <svg className="w-10 h-10 animate-pulse duration-[3000ms]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" stroke="url(#logo-grad-splash)" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-45" />
              <g stroke="url(#logo-grad-splash)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {/* Center ring linking elements */}
                <circle cx="50" cy="50" r="14" strokeWidth="1.5" strokeDasharray="3 3" className="opacity-60" />
                
                {/* Leaf Element 1: Earth (Top, 0 deg) */}
                <g transform="rotate(0, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M50 20 V42" strokeWidth="1.5" />
                  <path d="M50 26 L44 32 M50 32 L56 26" strokeWidth="1.2" />
                </g>
                
                {/* Leaf Element 2: Fire (72 deg) */}
                <g transform="rotate(72, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M50 38 C47 34 47 30 50 24 C53 30 53 34 50 38" strokeWidth="1.5" />
                </g>
                
                {/* Leaf Element 3: Air (144 deg) */}
                <g transform="rotate(144, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M44 26 C47 24 53 24 56 28 C54 32 46 32 50 36" strokeWidth="1.5" />
                </g>
                
                {/* Leaf Element 4: Water (216 deg) */}
                <g transform="rotate(216, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M50 24 C46 26 46 32 50 34 C54 35 54 39 50 40" strokeWidth="1.5" />
                </g>
                
                {/* Leaf Element 5: Cosmos (288 deg) */}
                <g transform="rotate(288, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <circle cx="50" cy="28" r="3" fill="#4fc7cf" stroke="none" />
                  <ellipse cx="50" cy="28" rx="6" ry="2" transform="rotate(-15, 50, 28)" strokeWidth="1.2" />
                </g>
              </g>
              <defs>
                <linearGradient id="logo-grad-splash" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4fc7cf" />
                  <stop offset="50%" stopColor="#35b0b8" />
                  <stop offset="100%" stopColor="#26a69a" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white tracking-tight">Initializing Secure Session</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mt-1">Quantiva Cryptographic Node</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={() => {}} />;
  }

  // Modern Profile Details Parser based on specific visual criteria requested (lowercase username, clean display details, elegant initials)
  const getProfileDetails = () => {
    const email = currentUser.email || "analyst@quantiva.ai";
    const localPart = email.split('@')[0].toLowerCase();
    
    // Extract a sleek, modern lowercased username (login ID) like rkanaujia75
    // Remove non-alphanumeric chars or dots for clean modern look if requested
    const loginID = (currentUser.displayName || localPart).toLowerCase().replace(/[^a-z0-9]/g, '');

    // Extract exactly 2 characters for modern initials (e.g. RK or KR)
    let initials = "US";
    if (currentUser.displayName) {
      const parts = currentUser.displayName.split(' ').filter(Boolean);
      if (parts.length >= 2) {
        initials = (parts[0][0] + parts[1][0]).toUpperCase();
      } else {
        initials = currentUser.displayName.substring(0, 2).toUpperCase();
      }
    } else {
      // Special case: kanaujia.rahul79 -> RK (Rahul Kanaujia)
      if (localPart.includes('kanaujia') && localPart.includes('rahul')) {
        initials = "RK";
      } else {
        const parts = localPart.split(/[\._-]/).filter(Boolean);
        if (parts.length >= 2) {
          const firstLetter = parts[0][0].toUpperCase();
          const secondLetter = parts[1][0].toUpperCase();
          // If of pattern last.first, reverse them so it looks like First Last initials
          if ((localPart.startsWith('kanaujia') || localPart.startsWith('k')) && (localPart.includes('rahul') || localPart.includes('.r'))) {
            initials = "RK";
          } else {
            initials = firstLetter + secondLetter;
          }
        } else {
          initials = localPart.substring(0, 2).toUpperCase();
        }
      }
    }
    return { loginID, email, initials };
  };

  const profile = getProfileDetails();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "";
    let subText = "All caught up — no tasks pending";
    let Icon = Sun;
    let iconColor = "text-amber-400";
    
    if (hour >= 5 && hour < 12) {
      greeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Good afternoon";
    } else if (hour >= 17 && hour < 21) {
      greeting = "Good evening";
    } else {
      greeting = "Moon night analysis";
      subText = "Deep learning initialized — night mode active";
      Icon = Moon;
      iconColor = "text-indigo-400";
    }
    
    return { greeting, subText, Icon, iconColor };
  };

  const { greeting, subText, Icon: GreetingIcon, iconColor } = getGreeting();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    
    if (files.length > 5) {
      setError("Maximum 5 files allowed at once.");
      return;
    }

    const validFiles = files.filter(file => file.type === 'application/pdf');
    if (validFiles.length === 0) {
      setError("Please upload valid PDF documents.");
      return;
    }

    setError(null);
    setPdfFiles(validFiles);
    setIsProcessing(true);
    setExtractedData(null);

    try {
      const base64List = await Promise.all(validFiles.map(fileToBase64));
      setPdfBase64List(base64List);
      const result = await analyzeDocuments(base64List);
      setExtractedData(result);
      setArchive(prev => [result, ...prev]);
    } catch (err: unknown) {
      console.error("Processing Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while analyzing the documents.";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const themeClasses = {
    bg: isDarkMode 
      ? "bg-[#0a0c14] text-slate-200" 
      : "bg-slate-50 text-slate-900",
    sidebar: isDarkMode
      ? "bg-[#0d111d] border-[#1e2433]"
      : "bg-white border-slate-200 shadow-sm",
    nav: isDarkMode
      ? "bg-[#0d111d]/80 border-[#1e2433]"
      : "bg-white/80 border-slate-200 shadow-sm",
    accent: "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xl shadow-blue-500/10",
    textHeading: isDarkMode
      ? "text-white"
      : "text-slate-900",
    card: isDarkMode
      ? "bg-[#111827] border-[#1e2433]"
      : "bg-white border-slate-200 shadow-sm"
  };

  const handleHome = () => {
    setExtractedData(null);
    setPdfFiles([]);
    setPdfBase64List([]);
    setActiveTab('home');
    setError(null);
  };

  const SidebarLink = ({ id, icon: Icon, label, status, onClick }: { id: 'analysis' | 'archive' | 'home' | 'qr-check' | 'qr-status', icon: React.ElementType, label: string, status?: string, onClick?: () => void }) => (
    <button 
      onClick={() => {
        if (onClick) onClick();
        else if (id === 'qr-check') setShowQRCheck(true);
        else setActiveTab(id as any);
      }}
      className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group border border-transparent ${
        ((id === activeTab && id !== 'qr-check') || (id === 'qr-check' && showQRCheck))
          ? "bg-blue-600/10 text-blue-500 border-blue-500/20" 
          : `text-slate-500 hover:${isDarkMode ? 'text-white bg-slate-800/40' : 'text-slate-900 bg-slate-100'}`
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-blue-400' : ''}`} />
        <span className="text-[15px] font-bold tracking-tight">{label}</span>
      </div>
      {status && (
        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {status}
        </span>
      )}
    </button>
  );

  return (
    <div className={`min-h-screen flex selection:bg-blue-500/30 ${themeClasses.bg}`}>
      {/* Sidebar */}
      <aside className={`w-[280px] fixed inset-y-0 border-r z-50 flex flex-col p-6 space-y-8 ${themeClasses.sidebar}`}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black flex items-center gap-3">
            <svg className="w-9 h-9 flex-shrink-0 animate-pulse duration-[4000ms]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" stroke="url(#logo-grad)" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-45" />
              <g stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {/* Center ring linking elements */}
                <circle cx="50" cy="50" r="14" strokeWidth="1.5" strokeDasharray="3 3" className="opacity-60" />
                
                {/* Leaf Element 1: Earth (Top, 0 deg) */}
                <g transform="rotate(0, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M50 20 V42" strokeWidth="1.5" />
                  <path d="M50 26 L44 32 M50 32 L56 26" strokeWidth="1.2" />
                </g>
                
                {/* Leaf Element 2: Fire (72 deg) */}
                <g transform="rotate(72, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M50 38 C47 34 47 30 50 24 C53 30 53 34 50 38" strokeWidth="1.5" />
                </g>
                
                {/* Leaf Element 3: Air (144 deg) */}
                <g transform="rotate(144, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M44 26 C47 24 53 24 56 28 C54 32 46 32 50 36" strokeWidth="1.5" />
                </g>
                
                {/* Leaf Element 4: Water (216 deg) */}
                <g transform="rotate(216, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M50 24 C46 26 46 32 50 34 C54 35 54 39 50 40" strokeWidth="1.5" />
                </g>
                
                {/* Leaf Element 5: Cosmos (288 deg) */}
                <g transform="rotate(288, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <circle cx="50" cy="28" r="3" fill="#4fc7cf" stroke="none" />
                  <ellipse cx="50" cy="28" rx="6" ry="2" transform="rotate(-15, 50, 28)" strokeWidth="1.2" />
                </g>
              </g>
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4fc7cf" />
                  <stop offset="50%" stopColor="#35b0b8" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[#eff4f9] tracking-tighter">Quantiva AI</span>
          </h1>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] font-mono">Institutional Grade Intelligence</p>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-4">Core Modules</p>
          <SidebarLink id="home" icon={Home} label="Home" onClick={handleHome} />
          <SidebarLink id="analysis" icon={FileText} label="Report analysis" />
          <SidebarLink id="qr-check" icon={Search} label="Check QR availability" />
          <SidebarLink id="qr-status" icon={BarChart3} label="QR Status" />
          <SidebarLink id="archive" icon={Archive} label="Archive" />
        </div>

        <div className="pt-6 border-t border-[#1e2433] space-y-4">
          <button 
            className="w-full py-5 rounded-2xl gradient-button text-white font-black text-lg transition-all tracking-tight"
            onClick={() => fileInputRef.current?.click()}
          >
            Generate Report
          </button>
          
          <div className="flex items-center justify-between px-2 gap-4">
            <button className="p-2 text-slate-500 hover:text-white transition-colors" title="Settings"><Settings className="w-5 h-5" /></button>
            <button 
              onClick={async () => {
                try {
                  await signOut(auth);
                } catch (e) {
                   console.error("Signout error:", e);
                }
              }}
              className="flex items-center gap-2 p-2.5 px-4 gradient-button rounded-xl transition-all text-xs font-black uppercase tracking-wider focus:outline-none text-white shadow-lg active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span className="text-white">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[280px] flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className={`sticky top-0 z-40 border-b backdrop-blur-xl px-8 flex items-center justify-between h-20 ${themeClasses.nav}`}>
          <div className="flex items-center gap-6 w-full max-w-xl">
             <div className="relative w-full group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
               <input 
                  type="text" 
                  placeholder="Search insights..." 
                  className={`w-full border rounded-xl py-2.5 pl-12 pr-4 text-sm font-semibold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all outline-none ${
                    isDarkMode ? 'bg-slate-900/50 border-[#1e2433] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
               />
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl border border-[#1e2433] hover:bg-slate-800 transition-colors relative">
               <Bell className="w-5 h-5 text-slate-400" />
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#111827]"></span>
            </button>
            
            {/* Dynamic User profile info representing the logged-in user */}
            <div className="flex items-center gap-3.5 pl-3 border-l border-[#1e2433] py-0.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white font-mono tracking-tight lowercase">
                  {profile.loginID}
                </p>
                <p className="text-[10px] font-bold text-slate-500 lowercase tracking-wide mt-0.5">
                  {profile.email}
                </p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#26a69a] to-[#4fc7cf] opacity-35 blur-md group-hover:opacity-70 transition-opacity duration-300" />
                <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#1e2433] to-[#0d121d] border border-[#1e2439] group-hover:border-[#26a69a]/40 transition-all duration-300">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="User" 
                      className="w-8.5 h-8.5 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-br from-[#111827] to-[#1e2433] flex items-center justify-center font-black text-xs text-[#26a69a] font-mono border border-[#26a69a]/20 shadow-inner">
                      {profile.initials}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#26a69a] rounded-full border-2 border-[#090d16] shadow-[0_0_8px_rgba(38,166,154,0.6)] animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto w-full space-y-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Document Ingestion View (Welcome/Home) */}
          {activeTab === 'home' && !extractedData && !isProcessing && (
            <div className="space-y-12">
              <div className="flex flex-col">
                <div className="flex items-center gap-4 mb-2">
                  <GreetingIcon className={`w-10 h-10 ${iconColor}`} />
                  <h2 className={`text-6xl font-black tracking-tight leading-tight ${themeClasses.textHeading}`}>{greeting}</h2>
                </div>
                <p className={`text-[19px] font-bold transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{subText}</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Main Upload Area */}
                <div 
                  className={`w-full rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center transition-all bg-transparent group gradient-border-blue-green cursor-pointer`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-24 h-24 rounded-full bg-slate-900 border border-[#1e2433] flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">Import Financial Documents</h3>
                  <p className="text-slate-500 font-bold max-w-md mb-10 text-[15px] leading-relaxed">
                    Drag and drop your Quarterly Reports, Ledger Sheets, or SEC Filings. Supported formats: PDF, XLSX, CSV, JSON.
                  </p>
                  <button className="gradient-button px-16 py-5 rounded-3xl font-black text-2xl text-white active:scale-95 transition-all tracking-tight">
                    Select Files
                  </button>
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    AES-256 Encrypted Tunnel
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-3 space-y-6">
                  <div className={`p-8 rounded-[2rem] bg-transparent gradient-border-blue-green`}>
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-[15px] font-black text-white">Active Processing Queue</h4>
                       <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                         {isProcessing ? 'Active Processing' : 'Queue Empty'}
                       </span>
                    </div>
                    
                    {pdfFiles.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-slate-900 border border-[#1e2433]">
                           <Database className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-slate-500 font-bold text-[15px]">No documents in the current staging environment.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pdfFiles.map((file, i) => (
                          <div key={i} className={`p-4 rounded-xl border flex items-center justify-between gap-6 ${
                            isDarkMode ? 'bg-[#0d111d]/40 border-[#1e2433]' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-[#1e2433]' : 'bg-slate-50 border-slate-100'}`}>
                                <FileText className={`w-5 h-5 opacity-60 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="truncate">
                                      <p className={`text-xs font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{file.name}</p>
                                      <p className="text-[10px] font-bold text-slate-500">Ready for Analysis</p>
                                    </div>
                                    <div className="text-right">
                                      <button 
                                        onClick={() => setShowQRCheck(true)}
                                        className="flex items-center gap-2 px-6 py-2 rounded-xl gradient-button text-[10px] font-black text-white uppercase tracking-widest transition-all active:scale-95"
                                      >
                                        <Search className="w-3 h-3" />
                                        Check Result Status
                                      </button>
                                    </div>
                                </div>
                                <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                    <div className="h-full bg-emerald-500 w-full rounded-full"></div>
                                </div>
                              </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="mt-20 flex flex-col items-center justify-center space-y-12">
               <div className="relative">
                  <div className="absolute inset-x-[-100px] inset-y-[-100px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse"></div>
                  <Loader2 className="w-24 h-24 text-blue-500 animate-spin relative z-10" />
               </div>
               <div className="text-center space-y-2 relative z-10">
                  <h2 className="text-4xl font-black tracking-tight text-white">Neural Processing</h2>
                  <p className="text-slate-500 font-bold text-[15px]">Synthesizing {pdfFiles.length} data streams into strategic intelligence...</p>
               </div>
               
               <div className="w-full max-w-2xl bg-slate-900/40 border border-[#1e2433] rounded-3xl p-8 space-y-6">
                  {pdfFiles.map((file, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between text-xs font-black uppercase">
                          <span className="text-white truncate max-w-[200px]">{file.name}</span>
                          <span className="text-blue-400">Parsing Vector {i+1}...</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full animate-[progress-loading_3s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.5}s` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Report Analysis View */}
          {activeTab === 'analysis' && !extractedData && !isProcessing && (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
              <div className="p-6 rounded-full bg-blue-500/10 text-blue-500">
                <FileText className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-white">No Report Active</h3>
              <p className="text-slate-500 font-bold max-w-sm">Please upload a document on the Home screen to start a new analysis.</p>
              <button 
                onClick={() => setActiveTab('home')}
                className="gradient-button px-8 py-3 rounded-2xl font-black text-white"
              >
                Back to Home
              </button>
            </div>
          )}

          {extractedData && (activeTab === 'analysis' || activeTab === 'home') && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
               <Dashboard data={extractedData} isDarkMode={isDarkMode} />
            </div>
          )}

          {/* Deep Dive removed/disabled */}

          {activeTab === 'qr-status' && (
            <QRStatus isDarkMode={isDarkMode} />
          )}

          {activeTab === 'qr-check' && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <QRAvailabilityCheck isDarkMode={isDarkMode} onClose={() => setActiveTab('home')} />
            </div>
          )}

          {activeTab === 'archive' && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 space-y-10">
              <div className="flex flex-col gap-2">
                <h2 className={`text-4xl font-black tracking-tight ${themeClasses.textHeading}`}>Analysis Archive</h2>
                <p className="text-slate-500 font-bold text-[15px]">Historical data from previously processed documents</p>
              </div>

              {archive.length === 0 ? (
                <div className={`p-20 rounded-[3rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4`}>
                   <div className="p-6 rounded-full bg-slate-900 border border-[#1e2433]">
                      <Archive className="w-12 h-12 text-slate-600" />
                   </div>
                   <h3 className="text-xl font-black text-white">No Archive Found</h3>
                   <p className="text-slate-500 font-bold max-w-sm">
                      Your analysis history will appear here once you process some reports.
                   </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {archive.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-6 rounded-3xl border ${themeClasses.card} group hover:border-blue-500/50 transition-all cursor-pointer relative overflow-hidden`}
                      onClick={() => {
                        setExtractedData(item);
                        setActiveTab('analysis');
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg bg-blue-500/10 text-blue-400`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {idx === 0 ? 'Latest' : `Archive #${archive.length - idx}`}
                        </span>
                      </div>
                      
                      <h4 className={`text-[15px] font-black leading-snug mb-3 line-clamp-2 ${themeClasses.textHeading}`}>
                        {item.headline || item.summary.split('.')[0]}
                      </h4>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Revenue</span>
                          <span className="text-xs font-black text-blue-400">{item.financials.revenue}</span>
                        </div>
                        <div className="flex flex-col border-l border-slate-800 pl-4">
                          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">EBITDA</span>
                          <span className="text-xs font-black text-indigo-400">{item.financials.ebitda}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/40">
                         <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                            View Report <ChevronRight className="w-3 h-3" />
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".pdf" 
          multiple 
        />
      </main>

      {showQRCheck && (
        <QRAvailabilityCheck 
          isDarkMode={isDarkMode} 
          onClose={() => setShowQRCheck(false)} 
        />
      )}
    </div>
  );
};

export default App;
