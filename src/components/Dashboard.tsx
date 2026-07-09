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
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const cardBase = "card-base card-hover";
  const textPrimary = "text-[#1A1A2E]";
  const textSecondary = "text-[#555566]";
  const textMuted = "text-[#888899]";

  const chartData = data.chartData && data.chartData.length > 0 ? data.chartData : [];

  const MetricCard = ({ label, value, color, dataKey }: { 
    label: string, 
    value: string,
    color: string,
    dataKey: 'revenue' | 'ebitda' | 'pat'
  }) => (
    <div className={`${cardBase} p-6 flex flex-col justify-between overflow-hidden relative`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] ${textMuted}`}>{label}</h4>
        <div className="badge-pill bg-[#F3F3FE] text-[#5B5BF5] border border-[#5B5BF5]/15 text-[10px]">
          Trends
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <p className="text-[40px] font-extrabold tracking-tight text-[#4545DD]">{value}</p>
          <span className={`text-xs font-semibold uppercase ${textMuted}`}>Value</span>
        </div>
        
        {/* Real Chart */}
        <div className="h-24 w-full pt-4 relative">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color === 'bg-blue-400' ? '#3D3DC4' : color === 'bg-indigo-400' ? '#5B5BF5' : '#1DB88E'} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={color === 'bg-blue-400' ? '#3D3DC4' : color === 'bg-indigo-400' ? '#5B5BF5' : '#1DB88E'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={color === 'bg-blue-400' ? '#3D3DC4' : color === 'bg-indigo-400' ? '#5B5BF5' : '#1DB88E'} 
                  fillOpacity={1} 
                  fill={`url(#gradient-${dataKey})`} 
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-[#E5E5F0] rounded-lg">
              <p className="text-[11px] font-black text-[#888899] uppercase tracking-widest">No trend data found</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-[#888899] mt-2">
            <span>{chartData.length > 0 ? chartData[0].quarter : 'N/A'}</span>
            <span>{chartData.length > 0 ? chartData[chartData.length - 1].quarter : 'N/A'}</span>
        </div>

        <button className={`flex items-center gap-2 text-[9px] font-black transition-colors uppercase tracking-widest pt-2 ${textMuted} hover:text-[#3D3DC4]`}>
           <Copy className="w-3 h-3" />
           Copy Dataset
        </button>
      </div>
    </div>
  );

  const StrategyCard = ({ title, icon: Icon, items, count }: { title: string, icon: React.ElementType, items: StrategicPoint[], count: number }) => (
    <div className={`${cardBase} p-6 h-full flex flex-col bg-white`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-lg bg-[#F3F3FE] text-[#5B5BF5]">
              <Icon className="w-5 h-5" />
           </div>
           <h4 className="text-base font-extrabold text-[#1A1A2E]">{title}</h4>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#F3F3FE] text-[#5B5BF5]">
           {count}
        </div>
      </div>
      
      <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
        {items.map((item, i) => (
          <div key={i} className="p-4 rounded-xl border border-[#E5E5F0] bg-white group hover:border-[#5B5BF5] transition-all">
            <div className="flex justify-between items-start mb-2 gap-2">
              <h5 className="text-sm font-bold leading-tight text-[#1A1A2E]">{item.title}</h5>
              {item.value && (
                <span className="shrink-0 badge-pill bg-[#F3F3FE] text-[#5B5BF5]">
                   {item.value}
                </span>
              )}
            </div>
            <p className="text-[13px] font-medium leading-relaxed mb-3 text-[#555566]">
              {item.details}
            </p>
            {item.impact && (
              <div className="pt-3 border-t border-[#E5E5F0]">
                <p className="text-[10px] font-semibold text-[#1DB88E] uppercase tracking-wider leading-normal">
                  # IMPACT: {item.impact}
                </p>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs font-semibold italic text-[#888899]">No data available in this category.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      {/* Executive Intelligence Summary */}
      <section className={`${cardBase} p-10 relative overflow-hidden bg-hero-gradient`}>
        <div className="relative z-10 space-y-6">
           <div className="flex items-center gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-bold text-[#5B5BF5] uppercase tracking-wider">EXECUTIVE SUMMARY</span>
                <span className="text-[10px] font-bold text-[#888899] uppercase tracking-wider"> • Q3 2024 • ANALYST REPORT</span>
              </div>
           </div>
           
           <div className="space-y-6">
              <div className="flex items-start gap-4">
                 <Sparkles className="w-8 h-8 text-[#5B5BF5] mt-1 shrink-0" />
                 <h2 className="text-3xl font-extrabold tracking-tight leading-snug text-[#1A1A2E]">
                    {data.headline || data.summary.split('.')[0]}
                 </h2>
              </div>
              
              <p className="text-base text-[#555566] leading-relaxed max-w-5xl">
                 {data.summary}
              </p>
           </div>

           <div className="flex items-center gap-4 pt-4">
              <button className="btn-primary px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center gap-2">
                 <Copy className="w-3.5 h-3.5" />
                 Copy Full Analysis
              </button>
           </div>
        </div>
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
      <div className={`${cardBase} p-8 bg-white`}>
         <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-[#5B5BF5]" />
            <h3 className="text-xl font-extrabold text-[#1A1A2E]">Performance Drivers</h3>
         </div>

         <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'REVENUE ANALYSIS', text: data.financialDrivers.revenue, color: 'text-[#3D3DC4]' },
              { label: 'EBITDA ANALYSIS', text: data.financialDrivers.ebitda, color: 'text-[#5B5BF5]' },
              { label: 'PAT ANALYSIS', text: data.financialDrivers.pat, color: 'text-[#1DB88E]' }
            ].map((driver, i) => (
              <div key={i} className="p-6 rounded-xl border border-[#E5E5F0] bg-white hover:border-[#5B5BF5] transition-all">
                 <p className={`text-[10px] font-bold ${driver.color} uppercase tracking-wider mb-2`}>{driver.label}</p>
                 <p className="text-[14px] font-medium leading-relaxed whitespace-pre-line text-[#555566]">
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
