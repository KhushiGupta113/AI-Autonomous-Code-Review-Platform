import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Shield, Activity, Target, Award, ArrowLeft, Download } from 'lucide-react';

const CodeHealthReport = () => {
  const { repoId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/analysis/${repoId}`);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReport();
  }, [repoId]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-pulse text-blue-400 font-medium">Generating detailed report...</div>
      </div>
    );
  }

  const { analysis } = data;

  const radarData = [
    { subject: 'Security', A: 100 - (analysis.security_issues * 20), fullMark: 100 },
    { subject: 'Bugs', A: 100 - (analysis.bug_count * 15), fullMark: 100 },
    { subject: 'Performance', A: 100 - (analysis.performance_issues * 10), fullMark: 100 },
    { subject: 'Maintainability', A: analysis.complexity_score, fullMark: 100 },
    { subject: 'Quality', A: analysis.quality_score, fullMark: 100 },
  ];

  const getHealthStatus = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-400/10' };
    if (score >= 70) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    if (score >= 50) return { label: 'Average', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10' };
  };

  const status = getHealthStatus(analysis.quality_score);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <Link to={`/dashboard/${repoId}`} className="text-slate-400 hover:text-white flex items-center transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Dashboard
        </Link>
        <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 flex items-center transition-all">
          <Download className="mr-2 w-4 h-4" /> Export PDF
        </button>
      </div>

      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">Code Health Report</h1>
        <div className={`inline-flex items-center px-4 py-1.5 rounded-full ${status.bg} ${status.color} border border-current/20 font-semibold text-sm`}>
          Overall Status: {status.label}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Activity className="mr-2 text-blue-400" /> Metrics Distribution
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="mr-2 text-red-400" /> Executive Summary
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Based on the analysis of your repository, the code quality is rated as <span className={status.color}>{status.label}</span> with an overall quality score of <strong>{analysis.quality_score}/100</strong>. 
              We detected <strong>{analysis.bug_count} bugs</strong> and <strong>{analysis.security_issues} security risks</strong> that require immediate attention.
            </p>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="mr-2 text-violet-400" /> Top Recommendations
            </h3>
            <ul className="space-y-3">
              {[
                analysis.security_issues > 0 && "Address high-priority security vulnerabilities in your codebase.",
                analysis.bug_count > 0 && "Fix identified bugs to improve application stability.",
                analysis.complexity_score < 70 && "Refactor complex functions to improve maintainability.",
                "Review performance bottlenecks in nested loops.",
              ].filter(Boolean).map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Project Maturity</h3>
              <p className="text-slate-400 text-sm">Comparison against industry standards</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
              <Award className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeHealthReport;
