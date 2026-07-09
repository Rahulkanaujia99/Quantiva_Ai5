
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Sun, Moon, AlertCircle, Loader2, LayoutDashboard,
  TrendingUp, Globe, Briefcase, Zap, PieChart, Pickaxe, BarChart3,
  Search, Bell, Settings, User, FileText, Database, Archive, Mail,
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
  const isDarkMode = false;
  const [showQRCheck, setShowQRCheck] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'analysis' | 'archive' | 'qr-status' | 'qr-check' | 'settings'>('home');
  
  // Profile settings states
  const [profileName, setProfileName] = useState<string>('rahul Kanaujia');
  const [profileEmail, setProfileEmail] = useState<string>('rkanaujia75@gmail.com');
  const [profileOrg, setProfileOrg] = useState<string>('Penguin International');
  const [profileRole, setProfileRole] = useState<string>('Director');
  const [profileRegion, setProfileRegion] = useState<string>('Asia Pacific');
  const [profileSector, setProfileSector] = useState<string>('Energy & Utilities');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.displayName || 'rahul Kanaujia');
      setProfileEmail(currentUser.email || 'rkanaujia75@gmail.com');
    }
  }, [currentUser]);

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
    bg: "bg-[#FFFFFF] text-[#555566]",
    sidebar: "bg-[#FFFFFF] border-[#E5E5F0]",
    nav: "bg-[#FFFFFF] border-[#E5E5F0] shadow-sm",
    accent: "bg-[#3D3DC4] hover:bg-[#5B5BF5] text-white shadow-xl shadow-blue-500/10",
    textHeading: "text-[#1A1A2E]",
    card: "bg-[#FFFFFF] border-[#E5E5F0]"
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
          ? "bg-[#3D3DC4]/10 text-[#3D3DC4] border-[#3D3DC4]/20" 
          : "text-[#555566] hover:text-[#1A1A2E] hover:bg-[#F3F3FE]"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${((id === activeTab && id !== 'qr-check') || (id === 'qr-check' && showQRCheck)) ? 'text-[#3D3DC4]' : 'text-[#888899]'}`} />
        <span className="text-[15px] font-bold tracking-tight">{label}</span>
      </div>
      {status && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F3F3FE] text-[#5B5BF5]">
          {status}
        </span>
      )}
    </button>
  );

  return (
    <div className={`min-h-screen flex selection:bg-[#3D3DC4]/30 ${themeClasses.bg}`}>
      {/* Sidebar */}
      <aside className={`w-[280px] fixed inset-y-0 border-r z-50 flex flex-col p-6 space-y-8 ${themeClasses.sidebar}`}>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
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
                  <circle cx="50" cy="28" r="3" fill="#3D3DC4" stroke="none" />
                  <ellipse cx="50" cy="28" rx="6" ry="2" transform="rotate(-15, 50, 28)" strokeWidth="1.2" />
                </g>
              </g>
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3D3DC4" />
                  <stop offset="50%" stopColor="#5B5BF5" />
                  <stop offset="100%" stopColor="#1DB88E" />
                </linearGradient>
              </defs>
            </svg>
            <span className="tracking-tighter font-extrabold"><span className="text-[#1DB88E]">Quantiva</span> <span className="text-[#3D3DC4]">Ai</span></span>
          </h1>
          <p className="text-[10px] font-black text-[#5B5BF5] uppercase tracking-[0.3em] font-mono">Institutional Grade Intelligence</p>
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-[10px] font-black text-[#888899] uppercase tracking-widest px-2 mb-4">Core Modules</p>
          <SidebarLink id="home" icon={Home} label="Home" onClick={handleHome} />
          <SidebarLink id="analysis" icon={FileText} label="Report analysis" />
          <SidebarLink id="qr-check" icon={Search} label="Check QR availability" />
          <SidebarLink id="qr-status" icon={BarChart3} label="QR Status" />
          <SidebarLink id="archive" icon={Archive} label="Archive" />
        </div>

        <div className="pt-6 border-t border-[#E5E5F0] space-y-4">
          <button 
            className="w-full py-3.5 rounded-lg btn-primary text-white font-semibold text-sm transition-all tracking-tight"
            onClick={() => fileInputRef.current?.click()}
          >
            Generate Report
          </button>
          
          <div className="flex items-center justify-between px-1 gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#1DB88E] flex items-center justify-center font-bold text-sm text-white font-mono shadow-sm">
                {profile.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-[#1A1A2E] leading-snug truncate">{profileName}</span>
                <span className="text-[10px] text-[#888899] font-medium leading-none mt-0.5 truncate">{profileOrg || 'Penguin International'}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-[#3D3DC4]/10 text-[#3D3DC4] border border-[#3D3DC4]/20' : 'text-[#888899] hover:text-[#1A1A2E] hover:bg-[#F3F3FE]'}`}
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button 
                onClick={async () => {
                  try {
                    await signOut(auth);
                  } catch (e) {
                     console.error("Signout error:", e);
                   }
                }}
                className="p-2 text-[#888899] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[280px] flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 border-b border-[#E5E5F0] bg-white px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-6 w-full max-w-xl">
             <div className="relative w-full group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899] group-focus-within:text-[#3D3DC4] transition-colors" />
               <input 
                  type="text" 
                  placeholder="Search insights..." 
                  className="w-full bg-[#FFFFFF] border border-[#E5E5F0] rounded-xl py-2 pl-10 pr-4 text-sm font-semibold focus:ring-4 focus:ring-[#3D3DC4]/10 focus:border-[#3D3DC4] transition-all outline-none text-[#1A1A2E]"
               />
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl border border-[#E5E5F0] hover:bg-[#F3F3FE] transition-colors relative">
               <Bell className="w-5 h-5 text-[#555566]" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-[#3D3DC4] rounded-full border border-white"></span>
            </button>
            
            <div className="px-4 py-1.5 rounded-full bg-[#3D3DC4]/10 border border-[#3D3DC4]/20 text-[#3D3DC4] text-[11px] font-black uppercase tracking-wider font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </div>
            
            {/* Dynamic User profile info representing the logged-in user */}
            <div className="flex items-center gap-3.5 pl-3 border-l border-[#E5E5F0] py-0.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#1A1A2E] font-mono tracking-tight lowercase">
                  {profile.loginID}
                </p>
                <p className="text-[10px] font-semibold text-[#888899] lowercase tracking-wide mt-0.5">
                  {profile.email}
                </p>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#3D3DC4] to-[#5B5BF5] opacity-15 blur-md group-hover:opacity-30 transition-opacity duration-300" />
                <div className="relative p-[2px] rounded-xl bg-white border border-[#E5E5F0] group-hover:border-[#3D3DC4]/40 transition-all duration-300">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="User" 
                      className="w-8 h-8 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#F3F3FE] flex items-center justify-center font-bold text-xs text-[#5B5BF5] font-mono border border-[#5B5BF5]/20 shadow-inner">
                      {profile.initials}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#1DB88E] rounded-full border-2 border-white shadow-[0_0_8px_rgba(29,184,142,0.4)] animate-pulse" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto w-full space-y-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Document Ingestion View (Welcome/Home) */}
          {activeTab === 'home' && !extractedData && !isProcessing && (
            <div className="space-y-12">
              <div className="bg-hero-gradient rounded-[2rem] p-16 border border-[#E5E5F0] shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Column: Hero Info */}
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3F3FE] text-[#5B5BF5] border border-[#5B5BF5]/15">
                    <GreetingIcon className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">{greeting}</span>
                  </div>
                  <h2 className="text-[52px] font-extrabold tracking-tight leading-[1.1] text-[#1A1A2E]">
                    Financial <span className="text-[#3D3DC4]">Intelligence</span> <span className="text-[#1DB88E]">Synthesized</span>
                  </h2>
                  <p className="text-base text-[#555566] leading-relaxed max-w-lg font-medium">
                    {subText}. Quantiva's AI analyzer parses vectors of quarterly reports, ledger sheets, and filings into institutional-grade strategic insights instantly.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary px-8 py-3.5 rounded-lg text-sm font-semibold transition-all"
                    >
                      Upload Report
                    </button>
                    <button 
                      onClick={() => setActiveTab('qr-status')}
                      className="btn-outline px-8 py-3.5 rounded-lg text-sm font-semibold transition-all"
                    >
                      View Monitor
                    </button>
                  </div>
                </div>

                {/* Right Column: Upload Area */}
                <div 
                  className="w-full rounded-[1.5rem] border border-[#E5E5F0] bg-white p-10 flex flex-col items-center justify-center text-center transition-all card-hover cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-[#F3F3FE] border border-[#E5E5F0] flex items-center justify-center mb-6 shadow-sm">
                    <Upload className="w-6 h-6 text-[#3D3DC4]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">Import Financial Documents</h3>
                  <p className="text-[#555566] font-medium max-w-sm mb-6 text-sm leading-relaxed">
                    Drag & drop files or click to browse. Supported formats: PDF, XLSX, CSV, JSON (Max 5 files).
                  </p>
                  <button className="btn-primary px-8 py-3 rounded-lg text-xs tracking-wider uppercase font-semibold">
                    Select Files
                  </button>
                  <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-[#888899] uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-[#1DB88E]" />
                    AES-256 Encrypted Tunnel
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-3 space-y-6">
                  <div className="w-full rounded-[1.5rem] border border-[#E5E5F0] bg-white p-8">
                    <div className="flex items-center justify-between mb-6">
                       <h4 className="text-sm font-bold text-[#1A1A2E]">Active Processing Queue</h4>
                       <span className="badge-pill bg-[#F3F3FE] text-[#5B5BF5] border border-[#5B5BF5]/15">
                         {isProcessing ? 'Active Processing' : 'Queue Empty'}
                       </span>
                    </div>
                    
                    {pdfFiles.length === 0 ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="p-3 rounded-full bg-[#F3F3FE] border border-[#E5E5F0]">
                           <Database className="w-6 h-6 text-[#888899]" />
                        </div>
                        <p className="text-[#888899] font-semibold text-sm">No documents in the current staging environment.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pdfFiles.map((file, i) => (
                          <div key={i} className="p-4 rounded-xl border border-[#E5E5F0] bg-white flex items-center justify-between gap-6 card-hover">
                              <div className="p-3 rounded-lg border border-[#E5E5F0] bg-[#F3F3FE]">
                                <FileText className="w-5 h-5 text-[#3D3DC4]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="truncate">
                                      <p className="text-xs font-bold truncate text-[#1A1A2E]">{file.name}</p>
                                      <p className="text-[10px] font-semibold text-[#888899]">Ready for Analysis</p>
                                    </div>
                                    <div className="text-right">
                                      <button 
                                        onClick={() => setShowQRCheck(true)}
                                        className="btn-outline px-4 py-2 text-[10px] tracking-wider uppercase font-semibold transition-all active:scale-95"
                                      >
                                        Check Result Status
                                      </button>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full rounded-full overflow-hidden bg-[#F3F3FE]">
                                    <div className="h-full bg-[#1DB88E] w-full rounded-full"></div>
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
                  <div className="absolute inset-x-[-100px] inset-y-[-100px] bg-[#3D3DC4]/5 blur-[120px] rounded-full animate-pulse"></div>
                  <Loader2 className="w-20 h-20 text-[#3D3DC4] animate-spin relative z-10" />
               </div>
               <div className="text-center space-y-2 relative z-10">
                  <h2 className="text-3xl font-extrabold tracking-tight text-[#1A1A2E]">Neural Processing</h2>
                  <p className="text-[#555566] font-semibold text-sm">Synthesizing {pdfFiles.length} data streams into strategic intelligence...</p>
               </div>
               
               <div className="w-full max-w-2xl bg-white border border-[#E5E5F0] rounded-3xl p-8 space-y-6">
                  {pdfFiles.map((file, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between text-xs font-bold uppercase">
                          <span className="text-[#1A1A2E] truncate max-w-[200px]">{file.name}</span>
                          <span className="text-[#5B5BF5]">Parsing Vector {i+1}...</span>
                       </div>
                       <div className="h-1.5 w-full bg-[#F3F3FE] rounded-full overflow-hidden">
                          <div className="h-full bg-[#1DB88E] rounded-full animate-[progress-loading_3s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.5}s` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* Report Analysis View */}
          {activeTab === 'analysis' && !extractedData && !isProcessing && (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
              <div className="p-6 rounded-full bg-[#F3F3FE] text-[#5B5BF5]">
                <FileText className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A2E]">No Report Active</h3>
              <p className="text-[#555566] font-medium max-w-sm">Please upload a document on the Home screen to start a new analysis.</p>
              <button 
                onClick={() => setActiveTab('home')}
                className="btn-primary px-8 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider"
              >
                Back to Home
              </button>
            </div>
          )}

          {extractedData && (activeTab === 'analysis' || activeTab === 'home') && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
               <Dashboard data={extractedData} />
            </div>
          )}

          {/* Deep Dive removed/disabled */}

          {activeTab === 'qr-status' && (
            <QRStatus />
          )}

          {activeTab === 'qr-check' && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
               <QRAvailabilityCheck onClose={() => setActiveTab('home')} />
            </div>
          )}

          {activeTab === 'archive' && (
            <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 space-y-10">
              <div className="flex flex-col gap-2">
                <h2 className={`text-4xl font-extrabold tracking-tight ${themeClasses.textHeading}`}>Analysis Archive</h2>
                <p className="text-[#555566] font-semibold text-[15px]">Historical data from previously processed documents</p>
              </div>

              {archive.length === 0 ? (
                <div className="p-20 rounded-[3rem] border-2 border-dashed border-[#E5E5F0] bg-white flex flex-col items-center justify-center text-center space-y-4">
                   <div className="p-6 rounded-full bg-[#F3F3FE] border border-[#E5E5F0]">
                      <Archive className="w-12 h-12 text-[#888899]" />
                   </div>
                   <h3 className="text-xl font-bold text-[#1A1A2E]">No Archive Found</h3>
                   <p className="text-[#555566] font-medium max-w-sm">
                      Your analysis history will appear here once you process some reports.
                   </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {archive.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-6 rounded-3xl border ${themeClasses.card} group hover:border-[#5B5BF5] hover:shadow-[0_8px_32px_rgba(61,61,196,0.10)] transition-all cursor-pointer relative overflow-hidden`}
                      onClick={() => {
                        setExtractedData(item);
                        setActiveTab('analysis');
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 rounded-lg bg-[#F3F3FE] text-[#5B5BF5]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-[#888899] uppercase tracking-wider">
                          {idx === 0 ? 'Latest' : `Archive #${archive.length - idx}`}
                        </span>
                      </div>
                      
                      <h4 className="text-[15px] font-bold leading-snug mb-3 line-clamp-2 text-[#1A1A2E]">
                        {item.headline || item.summary.split('.')[0]}
                      </h4>
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-[#888899] uppercase tracking-wider">Revenue</span>
                          <span className="text-xs font-bold text-[#3D3DC4]">{item.financials.revenue}</span>
                        </div>
                        <div className="flex flex-col border-l border-[#E5E5F0] pl-4">
                          <span className="text-[8px] font-bold text-[#888899] uppercase tracking-wider">EBITDA</span>
                          <span className="text-xs font-bold text-[#5B5BF5]">{item.financials.ebitda}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-[#E5E5F0]">
                         <span className="text-[10px] font-bold text-[#3D3DC4] uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all">
                            View Report <ChevronRight className="w-3.5 h-3.5" />
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-[#5B5BF5] uppercase tracking-widest font-mono">INTELLIGENCE PROFILE</span>
                <h2 className="text-4xl font-extrabold text-[#1A1A2E]">Profile Settings</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Card: Avatar and Details */}
                <div className="p-8 bg-white border border-[#E5E5F0] rounded-[1.5rem] flex flex-col items-center text-center space-y-6 card-hover shadow-sm transition-all">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-[#3D3DC4] flex items-center justify-center font-extrabold text-2xl text-white shadow-lg relative">
                      {profile.initials}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 rounded-full bg-[#3D3DC4] hover:bg-[#5B5BF5] text-white shadow-md border-2 border-white transition-all cursor-pointer">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A2E]">{profileName}</h3>
                    <p className="text-xs text-[#888899] font-medium mt-1">{profileRole || 'Job Title Unset'}</p>
                  </div>

                  <div className="w-full border-t border-[#E5E5F0] pt-6 space-y-3.5 text-left text-xs font-semibold text-[#555566]">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#888899]" />
                      <span className="truncate">{profileEmail}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-[#888899]" />
                      <span>Preferred Region: <span className="text-[#3D3DC4] font-bold">{profileRegion || 'Unset'}</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-4 h-4 text-[#888899]" />
                      <span>Sector: <span className="text-[#3D3DC4] font-bold">{profileSector || 'Unset'}</span></span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Settings Forms */}
                <div className="lg:col-span-2 p-8 bg-white border border-[#E5E5F0] rounded-[1.5rem] card-hover shadow-sm transition-all space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-base font-bold text-[#1A1A2E] pb-3 border-b border-[#E5E5F0]">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase text-[#555566] tracking-wider">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899]" />
                          <input 
                            type="text" 
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full bg-white border border-[#E5E5F0] rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:border-[#3D3DC4] focus:ring-4 focus:ring-[#3D3DC4]/10 transition-all outline-none text-[#1A1A2E]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase text-[#555566] tracking-wider">Email Address (Advisory ID)</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899]" />
                          <input 
                            type="email" 
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full bg-white border border-[#E5E5F0] rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:border-[#3D3DC4] focus:ring-4 focus:ring-[#3D3DC4]/10 transition-all outline-none text-[#1A1A2E]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase text-[#555566] tracking-wider">Organization / Advisory firm</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899]" />
                          <input 
                            type="text" 
                            placeholder="E.g., McKinsey, BCG"
                            value={profileOrg}
                            onChange={(e) => setProfileOrg(e.target.value)}
                            className="w-full bg-white border border-[#E5E5F0] rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:border-[#3D3DC4] focus:ring-4 focus:ring-[#3D3DC4]/10 transition-all outline-none text-[#1A1A2E]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase text-[#555566] tracking-wider">Job Title / Corporate Role</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899]" />
                          <input 
                            type="text" 
                            placeholder="E.g., Senior Associate, Lead Advisor"
                            value={profileRole}
                            onChange={(e) => setProfileRole(e.target.value)}
                            className="w-full bg-white border border-[#E5E5F0] rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:border-[#3D3DC4] focus:ring-4 focus:ring-[#3D3DC4]/10 transition-all outline-none text-[#1A1A2E]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-base font-bold text-[#1A1A2E] pb-3 border-b border-[#E5E5F0]">Advisory Preferences</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase text-[#555566] tracking-wider">Primary Region Index</label>
                        <select 
                          value={profileRegion}
                          onChange={(e) => setProfileRegion(e.target.value)}
                          className="w-full bg-white border border-[#E5E5F0] rounded-xl py-3 px-4 text-xs font-bold focus:border-[#3D3DC4] focus:ring-4 focus:ring-[#3D3DC4]/10 transition-all outline-none text-[#1A1A2E]"
                        >
                          <option value="">Select Region...</option>
                          <option value="Americas">Americas</option>
                          <option value="Asia Pacific">Asia Pacific</option>
                          <option value="Europe">Europe</option>
                          <option value="Middle East">Middle East</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase text-[#555566] tracking-wider">Primary Focus Sector</label>
                        <select 
                          value={profileSector}
                          onChange={(e) => setProfileSector(e.target.value)}
                          className="w-full bg-white border border-[#E5E5F0] rounded-xl py-3 px-4 text-xs font-bold focus:border-[#3D3DC4] focus:ring-4 focus:ring-[#3D3DC4]/10 transition-all outline-none text-[#1A1A2E]"
                        >
                          <option value="">Select Focus Sector...</option>
                          <option value="Energy & Utilities">Energy & Utilities</option>
                          <option value="Oil & Gas">Oil & Gas</option>
                          <option value="Technology & AI">Technology & AI</option>
                          <option value="Healthcare & Bio">Healthcare & Bio</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        alert("Settings saved successfully!");
                      }}
                      className="px-6 py-3.5 bg-[#3D3DC4] hover:bg-[#5B5BF5] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg active:scale-95 btn-primary"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </div>
              </div>
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
          onClose={() => setShowQRCheck(false)} 
        />
      )}
    </div>
  );
};

export default App;
