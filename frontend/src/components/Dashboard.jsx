import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { AlertTriangle, Bug, Code, Zap, Loader2, ArrowRight, LayoutDashboard, FileText } from 'lucide-react';

const Dashboard = () => {
  const { repoId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/analysis/${repoId}`);
        if (res.data.repository.analysis_status === 'completed') {
          setData(res.data);
          setLoading(false);
          clearInterval(interval);
        } else if (res.data.repository.analysis_status === 'failed') {
          setData({ failed: true });
          setLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [repoId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
          <Loader2 className="w-20 h-20 text-blue-500 animate-spin relative z-10" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Analyzing Repository...</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Our AI is currently deep-scanning your repository, parsing AST nodes, and calculating quality metrics.
          </p>
        </div>
      </div>
    );
  }

  if (data?.failed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <div className="bg-red-500/10 p-6 rounded-full mb-6 border border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Analysis Failed</h2>
        <p className="text-slate-400 mb-8 max-w-sm">
          We encountered an issue while processing this repository. Please ensure the URL is correct and public.
        </p>
        <Link to="/" className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-lg border border-white/10 transition-all">
          Go Back Home
        </Link>
      </div>
    );
  }

  const { analysis, repository } = data;
  
  const issueData = [
    { name: 'Bugs', value: analysis.bug_count, color: '#f87171' },
    { name: 'Security', value: analysis.security_issues, color: '#ef4444' },
    { name: 'Performance', value: analysis.performance_issues, color: '#fbbf24' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
            <LayoutDashboard className="w-4 h-4" />
            <span>Analysis Overview</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Repository Insights</h1>
          <p className="text-slate-400 mt-2 font-mono text-sm bg-white/5 px-3 py-1 rounded-md border border-white/5 inline-block">
            {repository.repo_url}
          </p>
        </div>
        <div className="flex gap-4">
          <Link to={`/issues/${repoId}`} className="glass-card bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 flex items-center font-semibold transition-all border-white/10">
            Explorer Issues <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link to={`/health/${repoId}`} className="premium-gradient text-white px-6 py-2.5 rounded-2xl flex items-center font-bold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95">
            Full Report <FileText className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard title="Quality Score" value={analysis.quality_score} icon={<Code />} color="text-emerald-400" bgColor="bg-emerald-400/10" suffix="/100" />
        <ScoreCard title="Bugs Detected" value={analysis.bug_count} icon={<Bug />} color="text-rose-400" bgColor="bg-rose-400/10" />
        <ScoreCard title="Security Risks" value={analysis.security_issues} icon={<AlertTriangle />} color="text-red-500" bgColor="bg-red-500/10" />
        <ScoreCard title="Efficiency" value={analysis.performance_issues} icon={<Zap />} color="text-amber-400" bgColor="bg-amber-400/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Issue Distribution</h3>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-white/5 px-3 py-1 rounded-full">Severity Map</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={issueData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                  {issueData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            {issueData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-400 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col items-center justify-between">
          <div className="text-center w-full">
             <h3 className="text-xl font-bold text-white mb-2">Maintainability</h3>
             <p className="text-slate-500 text-sm">Calculated structural integrity</p>
          </div>
          <div className="relative py-12">
             <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full" />
             <div className="text-8xl font-black text-gradient relative z-10">{analysis.complexity_score}</div>
          </div>
          <div className="w-full space-y-4">
             <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full premium-gradient" style={{ width: `${analysis.complexity_score}%` }} />
             </div>
             <p className="text-center text-slate-400 text-sm">Target: &gt; 80 for production readiness</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScoreCard = ({ title, value, icon, color, bgColor, suffix = "" }) => (
  <div className="glass-card p-6 group hover:bg-white/10 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-wider">Live Stat</span>
    </div>
    <div>
      <h3 className="text-slate-400 font-semibold mb-1 text-sm">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black text-white">{value}</span>
        <span className="text-slate-500 font-bold text-lg">{suffix}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;
