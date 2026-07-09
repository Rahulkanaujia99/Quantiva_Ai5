import React, { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider,
  githubProvider,
  OAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from '../services/firebase';
import { 
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, 
  Check, ArrowRight, User as UserIcon, RefreshCw, KeyRound,
  Copy, ExternalLink
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Field values
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Verification states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Real-time validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize Microsoft OAuth Provider
  const microsoftProvider = new OAuthProvider('microsoft.com');
  microsoftProvider.setCustomParameters({
    prompt: 'select_account'
  });

  // Pull remembered email if configured
  useEffect(() => {
    const savedEmail = localStorage.getItem('quantiva_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Validation routines
  const validateEmail = (val: string): boolean => {
    if (!val) {
      setEmailError('Email address is a required field');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Enter a valid electronic mail formatting (e.g. employee@company.com)');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string, isSignUp: boolean = false): boolean => {
    if (!val) {
      setPasswordError('Password credential code is required');
      return false;
    }
    
    // Custom requirements: At least 1 capital alphabet & at least 8 characters length
    if (isSignUp) {
      if (val.length < 8) {
        setPasswordError('Required criteria missing: Must be at least 8 characters long');
        return false;
      }
      const hasCapital = /[A-Z]/.test(val);
      if (!hasCapital) {
        setPasswordError('Required criteria missing: Must contain at least 1 uppercase capital letter');
        return false;
      }
    }
    
    setPasswordError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) validateEmail(val);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordError) validatePassword(val, mode === 'signup');
  };

  const getGreeting = (): string => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      return 'Good Morning';
    } else if (hours >= 12 && hours < 18) {
      return 'Good Afternoon';
    } else {
      return 'Moonlight Analysis';
    }
  };

  // Federated Identity Integrations
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMsg('Federated Google access authorized successfully! Synchronizing system context...');
      setTimeout(() => {
        onAuthSuccess();
      }, 700);
    } catch (err: any) {
      console.error('Google SSO Auth Error:', err);
      setErrorMsg(getFriendlyFirebaseError(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await signInWithPopup(auth, microsoftProvider);
      setSuccessMsg('Federated Microsoft AD access authorized! Accessing secure workspace...');
      setTimeout(() => {
        onAuthSuccess();
      }, 700);
    } catch (err: any) {
      console.error('Microsoft SSO Auth Error:', err);
      setErrorMsg(getFriendlyFirebaseError(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await signInWithPopup(auth, githubProvider);
      setSuccessMsg('Federated GitHub access authorized! Synchronizing developer profile...');
      setTimeout(() => {
        onAuthSuccess();
      }, 700);
    } catch (err: any) {
      console.error('GitHub SSO Auth Error:', err);
      setErrorMsg(getFriendlyFirebaseError(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const getFriendlyFirebaseError = (code: string): string => {
    const errorStr = (code || '').toLowerCase();
    if (errorStr.includes('unauthorized-domain') || errorStr.includes('unauthorized_domain')) {
      return `This domain ("${window.location.hostname || 'localhost'}") is not listed in your Firebase project's Authorized Domains. To fix this: navigate to Firebase Console -> Authentication -> Settings, look for "Authorized domains", and add "${window.location.hostname || 'localhost'}" to the list.`;
    }
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Incorrect verification password or secret. Please verify and try again.';
      case 'auth/user-not-found':
        return 'The specified credentials represent a new node. Please select Create Account to construct it.';
      case 'auth/email-already-in-use':
        return 'Electronic identity node already exists in our cluster. Choose Sign In mode instead.';
      case 'auth/weak-password':
        return 'Select a secure secret code: min 8 characters and containing at least 1 capital letter.';
      case 'auth/invalid-email':
        return 'The identity label provided has invalid syntax formatting.';
      case 'auth/popup-closed-by-user':
        return 'Federated authentication popup window was shut by user. Attempt link again.';
      case 'auth/network-request-failed':
        return 'Gateway link interrupted. Check your network client tunnel.';
      default:
        return `Gateway rejection code: ${code.replace('auth/', '').replace(/-/g, ' ')}`;
    }
  };

  // Submit Password Reset Email
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) return;

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Security reset transmission successfully dispatched! Check your mail inbox.');
    } catch (err: any) {
      console.error('Password reset transmission code exception:', err);
      setErrorMsg(getFriendlyFirebaseError(err.code || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'forgot') {
      await handleForgotPasswordSubmit(e);
      return;
    }

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password, mode === 'signup');

    if (!isEmailValid || !isPasswordValid) return;

    if (mode === 'signup' && !name.trim()) {
      setNameError('Full name is required for registration audit trail');
      return;
    } else {
      setNameError(null);
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        
        if (rememberMe) {
          localStorage.setItem('quantiva_remembered_email', email);
        } else {
          localStorage.removeItem('quantiva_remembered_email');
        }

        setSuccessMsg('Access authorized! Redirecting to dashboard...');
        setTimeout(() => {
          onAuthSuccess();
        }, 800);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        
        if (rememberMe) {
          localStorage.setItem('quantiva_remembered_email', email);
        } else {
          localStorage.removeItem('quantiva_remembered_email');
        }

        setSuccessMsg('Corporate security node successfully constructed! Logging in...');
        setTimeout(() => {
          onAuthSuccess();
        }, 1100);
      }
    } catch (err: any) {
      console.error('Identity flow exception:', err);
      // Auto-suggest to register if non-existent during sign-in
      if (err.code === 'auth/user-not-found' && mode === 'login') {
        setErrorMsg('Security directory node not found. Let\'s initialize a new account for you.');
        setMode('signup');
      } else {
        setErrorMsg(getFriendlyFirebaseError(err.code || err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#F3F6FF] via-[#F8F9FC] to-[#EEF9F6] flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-x-hidden font-sans">
      
      {/* Dynamic Blur Shapes matching enterprise analytics portal dashboard code */}
      <div className="absolute top-[-80px] right-[-80px] w-[350px] h-[350px] bg-[#3D3DC4]/12 rounded-full blur-[100px] pointer-events-none transform rotate-45"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#1DB88E]/12 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main interactive split card auth portal layout */}
      <div id="auth-container-root" className="w-full max-w-[950px] bg-white/45 backdrop-blur-xl rounded-[2.2rem] shadow-[0_24px_64px_rgba(61,61,196,0.08)] border border-white/40 overflow-hidden min-h-[620px] flex flex-col md:flex-row relative z-10 transition-all duration-500">
        
        {/* ================= PANEL A: THE DYNAMIC SLIDING BANNER (AQUAMARINE INTEGRATED DESIGN) ================= */}
        <div 
          className={`w-full md:w-[41%] bg-dark-panel p-8 md:p-12 flex flex-col justify-between items-center text-center relative overflow-hidden transition-transform duration-700 ease-in-out z-20 ${
            mode === 'login' ? 'md:translate-x-[143.9%]' : 'md:translate-x-0'
          }`}
        >
          {/* Watermark Logo Backdrop (Perfect alignment & premium styling) */}
          <div className="absolute inset-0 z-0 opacity-[0.24] pointer-events-none flex items-center justify-center select-none">
            <svg className="w-[320px] h-[320px] animate-[spin_180s_linear_infinite] text-[#1DB88E]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
              <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {/* Center linking ring */}
                <circle cx="50" cy="50" r="14" strokeWidth="1.2" strokeDasharray="2 2" />
                
                {/* Leaf Element 1: Earth (Top, 0 deg) */}
                <g transform="rotate(0, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M50 20 V42" strokeWidth="1.2" />
                  <path d="M50 26 L44 32 M50 32 L56 26" strokeWidth="1.0" />
                </g>
                
                {/* Leaf Element 2: Fire (72 deg) */}
                <g transform="rotate(72, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M50 38 C47 34 47 30 50 24 C53 30 53 34 50 38" strokeWidth="1.2" />
                </g>
                
                {/* Leaf Element 3: Air (144 deg) */}
                <g transform="rotate(144, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M44 26 C47 24 53 24 56 28 C54 32 46 32 50 36" strokeWidth="1.2" />
                </g>
                
                {/* Leaf Element 4: Water (216 deg) */}
                <g transform="rotate(216, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <path d="M50 24 C46 26 46 32 50 34 C54 35 54 39 50 40" strokeWidth="1.2" />
                </g>
                
                {/* Leaf Element 5: Cosmos (288 deg) */}
                <g transform="rotate(288, 50, 50)">
                  <path d="M50 12 C40 20 38 34 50 42 C62 34 60 20 50 12" />
                  <circle cx="50" cy="28" r="3" fill="#3D3DC4" stroke="none" />
                  <ellipse cx="50" cy="28" rx="6" ry="2" transform="rotate(-15, 50, 28)" strokeWidth="1.0" />
                </g>
              </g>
            </svg>
          </div>

          {/* Institutional Branding Header Group - Perfectly Aligned Center */}
          <div className="w-full flex items-center justify-center gap-3 relative z-10 mb-8 md:mb-0">
            <svg className="w-9 h-9 flex-shrink-0 animate-pulse duration-[4000ms]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" stroke="url(#logo-grad-auth)" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-45" />
              <g stroke="url(#logo-grad-auth)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <linearGradient id="logo-grad-auth" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1DB88E" />
                  <stop offset="50%" stopColor="#2DE0B0" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col text-left">
              <span className="font-serif text-[28px] font-bold leading-none tracking-normal text-white uppercase">Quantiva</span>
              <span className="font-serif text-[28px] font-bold leading-none tracking-widest text-white uppercase mt-1">Ai</span>
            </div>
          </div>

          {/* Beautiful dynamically shifting visual banners depending on Selected mode */}
          <div className="my-auto relative z-10 py-6 text-center">
            {mode === 'login' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white text-center">
                  {getGreeting()}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-[270px] mx-auto mb-8 font-medium text-center">
                  Establish a secure connection with your active enterprise analytics workspace dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setEmailError(null);
                    setPasswordError(null);
                    setNameError(null);
                  }}
                  className="px-8 py-3 rounded-full border-2 border-[#1DB88E] hover:bg-[#1DB88E]/10 text-[#1DB88E] transition-all duration-300 text-xs font-bold uppercase tracking-wider active:scale-95 shadow-sm focus:outline-none"
                >
                  CREATE NEW ACCOUNT
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-3xl md:text-3xl font-extrabold tracking-tight mb-4 text-white text-center">
                  Secure Workspace Setup
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-[270px] mx-auto mb-8 font-medium text-center">
                  Construction of a new administrator node requires unique electronic identification.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setEmailError(null);
                    setPasswordError(null);
                    setNameError(null);
                  }}
                  className="px-8 py-3 rounded-full border-2 border-[#1DB88E] hover:bg-[#1DB88E]/10 text-[#1DB88E] transition-all duration-300 text-xs font-bold uppercase tracking-wider active:scale-95 shadow-sm focus:outline-none"
                >
                  ALREADY REGISTERED? SIGN IN
                </button>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-3xl md:text-3.5xl font-extrabold tracking-tight mb-4 text-white text-center">
                  Reset Password Flow
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-[270px] mx-auto mb-8 font-medium text-center">
                  Enter your electronic identity. We'll dispatch a cryptographic secure reset link instantly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setEmailError(null);
                    setPasswordError(null);
                  }}
                  className="px-8 py-3 rounded-full border-2 border-[#1DB88E] hover:bg-[#1DB88E]/10 text-[#1DB88E] transition-all duration-300 text-xs font-bold uppercase tracking-wider active:scale-95 shadow-sm focus:outline-none"
                >
                  RETURN TO SIGN IN
                </button>
              </div>
            )}
          </div>

          {/* Secure SSL Lock label footer details */}
          <div className="text-[10px] text-slate-400/80 font-semibold tracking-wider flex items-center gap-1.5 relative z-10 mt-8 md:mt-0 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1DB88E]" />
            <span>AES-256 SSL CLUSTER ACTIVE</span>
          </div>
        </div>

        {/* ================= PANEL B: AUTHENTICATION FORM WRAPPER (LIGHT SLEEK BACKGROUNDS) ================= */}
        <div 
          className="w-full md:w-[59%] bg-white p-8 md:p-12 flex flex-col justify-center items-center transition-all duration-500"
        >
          <div className="w-full max-w-[390px] flex flex-col">
            
            {/* Main Interactive Screen Title */}
            <div className="text-center mb-8">
              <h1 className="text-[29.25px] font-sans font-extrabold text-[#3D3DC4] tracking-tight">
                {mode === 'login' && 'Welcome Analyst'}
                {mode === 'signup' && 'Create Admin Account'}
                {mode === 'forgot' && 'Reset Secure Secret'}
              </h1>
              <p className="text-[14px] leading-relaxed text-[#555566] mt-2 font-medium">
                {mode === 'login' && 'Enter verification credentials to access your database workspace'}
                {mode === 'signup' && 'Register your identity on secure cloud node keys'}
                {mode === 'forgot' && 'Provide your certified identity node email label'}
              </p>
            </div>

            {/* Informational Error/Success Banners */}
            {errorMsg && (
              errorMsg.includes('unauthorized-domain') || errorMsg.includes('Authorized Domains') ? (
                <div className="bg-amber-500/5 border border-amber-500/25 text-amber-800 p-4 rounded-[1.2rem] flex flex-col gap-3.5 mb-5 animate-in fade-in slide-in-from-top-1.5 duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider font-mono">Firebase Authorized Domain Required</h4>
                      <p className="text-[11px] text-amber-800/80 leading-normal mt-0.5">
                        This preview environment is not listing this deployment domain under your Authorized Domains list in the Firebase console.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between gap-3">
                    <span className="text-[10px] font-mono text-slate-700 break-all select-all font-bold">
                      {window.location.hostname}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.hostname);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-2.5 py-1.5 rounded-md bg-[#3D3DC4] hover:bg-[#5B5BF5] text-[10px] text-white flex items-center gap-1 font-bold transition-all shrink-0 uppercase active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white" />
                          <span>Copy Client Host</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-600 leading-relaxed font-medium space-y-1 bg-slate-50 p-2.5 rounded-lg">
                    <p className="font-bold text-amber-700 flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider mb-1">
                      <span>Quick Resolution Steps:</span>
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[10.5px]">
                      <li>Open the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#3D3DC4] font-bold hover:underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-2.5 h-2.5 inline-block" /></a>.</li>
                      <li>Go to <strong className="text-slate-800 font-bold">Authentication</strong> &gt; <strong className="text-slate-800 font-bold">Settings</strong> tab.</li>
                      <li>On the left menu, click on <strong className="text-slate-800 font-bold">Authorized domains</strong>.</li>
                      <li>Click <strong className="text-[#1DB88E] font-bold">Add domain</strong>, paste the domain copied above, and save.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/5 border border-red-500/15 text-red-600 p-3.5 rounded-xl flex items-start gap-2.5 mb-5 animate-in fade-in slide-in-from-top-1.5 duration-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <p className="text-xs text-red-600 leading-tight font-bold">{errorMsg}</p>
                </div>
              )
            )}

            {successMsg && (
              <div className="bg-[#1DB88E]/5 border border-[#1DB88E]/20 text-[#1DB88E] p-3.5 rounded-xl flex items-center gap-2.5 mb-5 animate-in fade-in duration-200">
                <div className="w-4.5 h-4.5 rounded-full bg-[#1DB88E]/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-[#1DB88E] stroke-[3.5]" />
                </div>
                <p className="text-xs font-bold text-[#1DB88E] leading-snug">{successMsg}</p>
              </div>
            )}

            {/* Main authorization client control form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Registration full-name input field (visible on signup only) */}
              {mode === 'signup' && (
                <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                  <span className="text-[12px] font-bold uppercase text-[#555566] tracking-wider">FULL NAME</span>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899]" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full bg-[#F3F6FF] text-[#1A1A2E] border rounded-xl py-3 pl-11 pr-4 text-xs font-bold transition-all outline-none focus:bg-white focus:ring-4 focus:ring-[#3D3DC4]/10 ${
                        nameError ? 'border-red-500/40 focus:border-red-500/60' : 'border-[#D8E2FD] focus:border-[#3D3DC4]/50'
                      }`}
                    />
                  </div>
                  {nameError && (
                    <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" />
                      {nameError}
                    </p>
                  )}
                </div>
              )}

              {/* Email credentials authentication input label node */}
              <div className="space-y-1">
                <span className="text-[12px] font-bold uppercase text-[#555566] tracking-wider">EMAIL ADDRESS</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899]" />
                  <input
                    type="email"
                    value={email}
                    disabled={isLoading}
                    onChange={handleEmailChange}
                    placeholder="certified@enterprise.com"
                    className={`w-full bg-[#F3F6FF] border text-[#1A1A2E] rounded-xl py-3 pl-11 pr-4 text-xs font-bold transition-all outline-none focus:bg-white focus:ring-4 focus:ring-[#3D3DC4]/10 ${
                      emailError 
                        ? 'border-red-500/40 focus:border-red-500/60' 
                        : 'border-[#D8E2FD] focus:border-[#3D3DC4]/50'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-0.5 ml-1">
                    <AlertCircle className="w-3 h-3" />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password authorization criteria input node (Login / Registration modes only) */}
              {mode !== 'forgot' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[12px] font-bold uppercase text-[#555566] tracking-wider">PASSWORD SECRET</span>
                    {mode === 'signup' && (
                      <span className="text-[9px] text-[#3D3DC4] font-mono select-none">REQUIRED: 1 CAPITAL, MIN 8 CHARS</span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888899]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      disabled={isLoading}
                      onChange={handlePasswordChange}
                      placeholder={mode === 'signup' ? "Create strong password" : "••••••••"}
                      className={`w-full bg-[#F3F6FF] border text-[#1A1A2E] rounded-xl py-3 pl-11 pr-11 text-xs font-bold transition-all outline-none focus:bg-white focus:ring-4 focus:ring-[#3D3DC4]/10 ${
                        passwordError 
                          ? 'border-red-500/40 focus:border-red-500/60' 
                          : 'border-[#D8E2FD] focus:border-[#3D3DC4]/50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#888899] hover:text-[#555566] transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-0.5 ml-1">
                      <AlertCircle className="w-3 h-3" />
                      {passwordError}
                    </p>
                  )}
                </div>
              )}

              {/* Remember user cookies checkbox & Forget Link navigation switches */}
              {mode === 'login' && (
                <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-[#555566]">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      rememberMe 
                        ? "bg-[#3D3DC4] border-[#3D3DC4] text-white" 
                        : "border-[#E5E5F0] bg-white group-hover:border-slate-500"
                    }`}>
                      {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                    </div>
                    <span className="group-hover:text-slate-700">Remember Me</span>
                  </label>

                  <button 
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setEmailError(null);
                      setPasswordError(null);
                    }}
                    className="transition-colors focus:outline-none text-[#555566] hover:text-[#3D3DC4] tracking-wide font-mono text-[10px]"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Central primary button submission handle container */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#1DB88E] hover:bg-[#169a77] text-white font-extrabold text-xs tracking-widest uppercase transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-[#1DB88E]/10 hover:shadow-[0_12px_24px_-4px_rgba(29,184,142,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus:outline-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>PROCESSING SECURE STATE...</span>
                    </>
                  ) : (
                    <>
                      {mode === 'login' && <span>SIGN IN WORKSPACE</span>}
                      {mode === 'signup' && <span>INITIALIZE NODE ADMIN</span>}
                      {mode === 'forgot' && <span>DISPATCH RECOVERY LINK</span>}
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Alternating access gateways (Log in vs Sign up helper) */}
            <div className="mt-5 text-center">
              {mode === 'login' ? (
                <p className="text-xs text-[#555566] font-medium">
                  Don't have an administrator access node yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setEmailError(null);
                      setPasswordError(null);
                    }}
                    className="text-[#3D3DC4] hover:text-[#5B5BF5] font-bold underline outline-none"
                  >
                    Create Account
                  </button>
                </p>
              ) : mode === 'signup' ? (
                <p className="text-xs text-[#555566] font-medium">
                  Already registered in security database node?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setEmailError(null);
                      setPasswordError(null);
                    }}
                    className="text-[#3D3DC4] hover:text-[#5B5BF5] font-bold underline outline-none"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setEmailError(null);
                    setPasswordError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-[#3D3DC4] hover:text-[#5B5BF5] font-bold underline outline-none"
                >
                  Back to Sign In Gateway
                </button>
              )}
            </div>

            {/* Divider lines for Federated Single-Sign-On integrations */}
            {mode !== 'forgot' && (
              <>
                <div className="relative flex items-center justify-center my-6">
                  <div className="w-full border-t border-[#E5E5F0]"></div>
                  <span className="absolute px-3.5 bg-white text-[9px] font-bold text-[#888899] uppercase tracking-widest font-mono">
                    FEDERATED IDENTITY LOG IN
                  </span>
                </div>

                {/* Direct Google and Microsoft SSO Option Buttons as requested */}
                <div className="grid grid-cols-2 gap-2 pb-2">
                  {/* Google Authentication popup handle */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white border border-[#E5E5F0] hover:border-[#5B5BF5] hover:bg-[#F3F3FE] text-[#555566] hover:text-[#1A1A2E] font-bold text-[10.5px] transition-all focus:outline-none uppercase active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.1.31-2.9 3.25l4.5 3.5c2.64-2.43 4.15-6 4.15-10.15z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.5-3.5c-1.24.83-2.82 1.33-4.43 1.33-3.12 0-5.76-2.11-6.72-4.96l-4.66 3.6C1.6 21.09 6.36 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 13.96c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3l-4.66-3.6C.19 7.09 0 9.4 0 11.66s.19 4.57.62 5.9l4.66-3.6z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 6.36 0 1.6 2.91.62 5.9l4.66 3.6c.96-2.85 3.6-4.75 6.72-4.75z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Certified Microsoft AD Authentication popup handle */}
                  <button
                    type="button"
                    onClick={handleMicrosoftSignIn}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white border border-[#E5E5F0] hover:border-[#5B5BF5] hover:bg-[#F3F3FE] text-[#555566] hover:text-[#1A1A2E] font-bold text-[10.5px] transition-all focus:outline-none uppercase active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M0 0h11v11H0z" />
                      <path fill="#80bb1a" d="M12 0h11v11H12z" />
                      <path fill="#00a1f1" d="M0 12h11v11H0z" />
                      <path fill="#ffb900" d="M12 12h11v11H12z" />
                    </svg>
                    <span>Microsoft</span>
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
