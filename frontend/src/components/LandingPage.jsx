import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Loader2, Github, Shield, Cpu, BarChart3, ChevronRight } from 'lucide-react';

const LandingPage = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/analyze-repo', { repoUrl: url });
      navigate(`/dashboard/${response.data.repoId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit repository. Is the backend running?');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-24 pb-20 px-4 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

      <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-blue-400 text-sm font-medium mb-4">
            <Github className="w-4 h-4" />
            <span>Open Source Analysis Powered by AI</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
            Review Code with <br />
            <span className="text-gradient">Autonomous Intelligence</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your GitHub repository and let our AI engine scan for bugs, security vulnerabilities, and architectural improvements in seconds.
          </p>
        </div>
        
        <form 
          onSubmit={handleSubmit} 
          className="relative max-w-2xl mx-auto group animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-5 text-slate-500 w-6 h-6" />
            <input 
              type="url"
              required
              placeholder="Enter GitHub Repository URL..."
              className="w-full bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-lg rounded-2xl py-5 pl-14 pr-40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-2xl transition-all"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold transition-all flex items-center disabled:opacity-70 shadow-lg active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Analyze Now'}
              {!loading && <ChevronRight className="ml-1 w-5 h-5" />}
            </button>
          </div>
          {error && <p className="text-red-400 mt-4 text-sm font-medium animate-pulse">{error}</p>}
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
          <FeatureCard 
            icon={<Cpu className="w-6 h-6 text-blue-400" />} 
            title="AST Engine" 
            desc="Deep static analysis using abstract syntax tree parsing." 
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-green-400" />} 
            title="Security First" 
            desc="Identify OWASP risks and hardcoded secrets instantly." 
          />
          <FeatureCard 
            icon={<BarChart3 className="w-6 h-6 text-violet-400" />} 
            title="Quality Metrics" 
            desc="Comprehensive health scores based on industry standards." 
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card p-6 text-left hover:bg-white/10 transition-colors border-white/5">
    <div className="mb-4">{icon}</div>
    <h3 className="text-white font-bold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
