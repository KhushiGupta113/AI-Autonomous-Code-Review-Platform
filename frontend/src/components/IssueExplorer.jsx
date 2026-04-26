import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Bug, Zap, Code, ArrowLeft, Filter, Search, ChevronRight } from 'lucide-react';

const IssueExplorer = () => {
  const { repoId } = useParams();
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/issues/${repoId}`);
        setIssues(res.data.issues);
      } catch (err) {
        console.error(err);
      }
    };
    fetchIssues();
  }, [repoId]);

  const filteredIssues = issues.filter(issue => {
    const matchesFilter = filter === 'all' || issue.type === filter;
    const matchesSearch = issue.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.file.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type) => {
    switch(type) {
      case 'bug': return <div className="p-2 bg-rose-500/10 rounded-lg"><Bug className="text-rose-400 w-5 h-5" /></div>;
      case 'security': return <div className="p-2 bg-red-500/10 rounded-lg"><ShieldAlert className="text-red-500 w-5 h-5" /></div>;
      case 'performance': return <div className="p-2 bg-amber-500/10 rounded-lg"><Zap className="text-amber-400 w-5 h-5" /></div>;
      default: return <div className="p-2 bg-blue-500/10 rounded-lg"><Code className="text-blue-400 w-5 h-5" /></div>;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Link to={`/dashboard/${repoId}`} className="text-slate-500 hover:text-white flex items-center transition-colors mb-4 text-sm font-semibold">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white tracking-tight">Issue Explorer</h1>
          <p className="text-slate-400 mt-2">Deep dive into the identified vulnerabilities and improvements.</p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search issues..."
              className="bg-slate-900 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
            {['all', 'bug', 'security', 'performance'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredIssues.length === 0 ? (
        <div className="glass-card p-20 text-center">
          <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
             <Filter className="text-slate-500 w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Issues Found</h3>
          <p className="text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredIssues.map((issue, idx) => (
            <div key={idx} className="glass-card p-6 hover:bg-white/10 transition-all group cursor-default">
              <div className="flex items-start gap-5">
                {getIcon(issue.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md border ${
                        issue.type === 'security' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        issue.type === 'bug' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {issue.type}
                      </span>
                      <span className="text-sm font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded-lg border border-white/5">
                        {issue.file.split('/').pop()}:{issue.line}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono hidden md:block">
                      {issue.file}
                    </div>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-lg font-medium group-hover:text-white transition-colors">
                    {issue.description}
                  </p>
                </div>
                <div className="hidden lg:block self-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <ChevronRight className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueExplorer;
