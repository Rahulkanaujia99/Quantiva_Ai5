import React from 'react';
import { 
  CheckCircle2, CircleDollarSign, BarChart3, PieChart, 
  TrendingUp, Globe, Briefcase, Zap, Sparkles, Activity,
  ChevronRight, Box, Share2, Copy, Rocket, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell, Legend
} from 'recharts';
import { ExtractedData, StrategicPoint } from '../types';

interface DashboardProps {
  data: ExtractedData;
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, isDarkMode }) => {
  const cardBase = `rounded-[1.5rem] border transition-all duration-300 ${
    isDarkMode ? 'bg-[#0f1423] border-[#1e2433]' : 'bg-white border-slate-200 shadow-sm'
  }`;

  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = isDarkMode ? 'text-slate-500' : 'text-slate-400';

  const chartData = data.chartData && data.chartData.length > 0 ? data.chartData : [];

  const MetricCard = ({ label, value, color, dataKey }: { 
    label: string, 
    value: string,
    color: string,
    dataKey: 'revenue' | 'ebitda' | 'pat'
  }) => (
    <div className={`${cardBase} p-6 flex flex-col justify-between group hover:border-blue-500/30 overflow-hidden relative`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${textMuted}`}>{label}</h4>
        <div className={`px-2 py-0.5 rounded text-[9px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20`}>
          Trends
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <p className={`text-4xl font-black tracking-tight ${textPrimary}`}>{value}</p>
          <span className={`text-xs font-bold uppercase ${textMuted}`}>Value</span>
        </div>
        
        {/* Real Chart */}
        <div className="h-24 w-full pt-4 relative">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color === 'bg-blue-400' ? '#60a5fa' : color === 'bg-indigo-400' ? '#818cf8' : '#34d399'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color === 'bg-blue-400' ? '#60a5fa' : color === 'bg-indigo-400' ? '#818cf8' : '#34d399'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={color === 'bg-blue-400' ? '#60a5fa' : color === 'bg-indigo-400' ? '#818cf8' : '#34d399'} 
                  fillOpacity={1} 
                  fill={`url(#gradient-${dataKey})`} 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-slate-800 rounded-lg">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">No trend data found</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-600 mt-2">
            <span>{chartData.length > 0 ? chartData[0].quarter : 'N/A'}</span>
            <span>{chartData.length > 0 ? chartData[chartData.length - 1].quarter : 'N/A'}</span>
        </div>

        <button className={`flex items-center gap-2 text-[9px] font-black transition-colors uppercase tracking-widest pt-2 ${textMuted} hover:${textPrimary}`}>
           <Copy className="w-3 h-3" />
           Copy Dataset
        </button>
      </div>
    </div>
  );

  const StrategyCard = ({ title, icon: Icon, items, count }: { title: string, icon: React.ElementType, items: StrategicPoint[], count: number }) => (
    <div className={`${cardBase} p-6 h-full flex flex-col ${isDarkMode ? 'bg-[#0d111d]/50' : 'bg-slate-50/50'}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
           <div className={`p-2 rounded-lg bg-blue-500/10 text-blue-400`}>
              <Icon className="w-5 h-5" />
           </div>
           <h4 className={`text-base font-black ${textPrimary}`}>{title}</h4>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
           {count}
        </div>
      </div>
      
      <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
        {items.map((item, i) => (
          <div key={i} className={`p-4 rounded-xl border group hover:border-blue-500/30 transition-all ${isDarkMode ? 'bg-[#1a2035]/50 border-slate-800/20' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex justify-between items-start mb-2 gap-2">
              <h5 className={`text-sm font-black leading-tight ${textPrimary}`}>{item.title}</h5>
              {item.value && (
                <span className="shrink-0 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase whitespace-nowrap">
                   {item.value}
                </span>
              )}
            </div>
            <p className={`text-[13px] font-bold leading-relaxed mb-3 ${textSecondary}`}>
              {item.details}
            </p>
            {item.impact && (
              <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-800/30' : 'border-slate-100'}`}>
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-normal">
                  # IMPACT: {item.impact}
                </p>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className={`text-xs font-bold italic ${textMuted}`}>No data available in this category.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      {/* Executive Intelligence Summary */}
      <section className={`${cardBase} p-10 relative overflow-hidden bg-gradient-to-br ${isDarkMode ? 'from-[#111827] to-[#0d111d]' : 'from-slate-50 to-white'}`}>
        <div className="relative z-10 space-y-6">
           <div className="flex items-center gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">EXECUTIVE INTELLIGENCE SUMMARY</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]"> • Q3 2024 • ANALYST REPORT</span>
              </div>
           </div>
           
           <div className="space-y-8">
              <div className="flex items-start gap-4">
                 <Sparkles className="w-8 h-8 text-blue-400 mt-2 shrink-0" />
                 <h2 className="text-3xl font-black tracking-tight leading-tight text-[#f2f2f2]">
                    {data.headline || data.summary.split('.')[0]}
                 </h2>
              </div>
              
              <p className={`text-[15px] font-bold leading-relaxed max-w-5xl ${textSecondary}`}>
                 {data.summary}
              </p>
           </div>

            <div className="flex items-center gap-4 pt-4">
               <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all gradient-button text-white active:scale-95">
                  <Copy className="w-3 h-3" />
                  Copy Full Analysis
               </button>
            </div>
        </div>

        {/* Decorative background for dark mode */}
        {isDarkMode && (
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none select-none">
             <div className="w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from)_0%,_transparent_70%)] from-blue-500/40"></div>
          </div>
        )}
      </section>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard 
           label="REVENUE" 
           value={data.financials.revenue || "N/A"} 
           color="bg-blue-400"
           dataKey="revenue"
         />
         <MetricCard 
           label="EBITDA" 
           value={data.financials.ebitda || "N/A"} 
           color="bg-indigo-400"
           dataKey="ebitda"
         />
         <MetricCard 
           label="PAT" 
           value={data.financials.pat || "N/A"} 
           color="bg-emerald-400"
           dataKey="pat"
         />
      </div>

      {/* Performance Drivers Section */}
      <div className={`${cardBase} p-8 ${isDarkMode ? 'bg-[#0a0f1d]' : 'bg-white'}`}>
         <div className="flex items-center gap-3 mb-8">
            <Activity className="w-6 h-6 text-amber-500" />
            <h3 className={`text-xl font-black ${textPrimary}`}>Performance Drivers</h3>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'REVENUE ANALYSIS', text: data.financialDrivers.revenue, color: 'text-blue-500' },
              { label: 'EBITDA ANALYSIS', text: data.financialDrivers.ebitda, color: 'text-indigo-500' },
              { label: 'PAT ANALYSIS', text: data.financialDrivers.pat, color: 'text-emerald-500' }
            ].map((driver, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-[#1e2433]' : 'bg-slate-50 border-slate-200'}`}>
                 <p className={`text-[11px] font-black ${driver.color} uppercase tracking-[0.2em] mb-3`}>{driver.label}</p>
                 <p className={`text-[15px] font-bold leading-relaxed whitespace-pre-line ${textPrimary}`}>
                   {driver.text || "Report metrics data not sufficiently detailed for specific narrative analysis."}
                 </p>
              </div>
            ))}
         </div>
      </div>

      {/* Strategic Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
         <StrategyCard 
           title="Investments & Capex" 
           icon={TrendingUp} 
           items={data.investments_capex} 
           count={data.investments_capex.length}
         />
         <StrategyCard 
           title="Partnerships & JVs" 
           icon={Globe} 
           items={data.partnerships_jvs} 
           count={data.partnerships_jvs.length}
         />
         <StrategyCard 
           title="M&A & Expansions" 
           icon={Briefcase} 
           items={data.mna_expansions} 
           count={data.mna_expansions.length}
         />
         <StrategyCard 
           title="Strategic Dev" 
           icon={Zap} 
           items={data.strategic_dev} 
           count={data.strategic_dev.length}
         />
         <StrategyCard 
           title="Future Plans" 
           icon={Activity} 
           items={data.future_plans} 
           count={data.future_plans.length}
         />
      </div>
    </div>
  );
};

export default Dashboard;
