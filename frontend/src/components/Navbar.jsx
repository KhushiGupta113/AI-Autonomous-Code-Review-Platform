import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Github } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-950/50 backdrop-blur-md border-b border-white/5 flex items-center px-8 z-50 justify-between">
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300">
          <Activity className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-black tracking-tight text-white">
          AutoReview <span className="text-blue-500">AI</span>
        </span>
      </Link>

      <div className="flex items-center space-x-8">
        <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Documentation</Link>
        <Link to="/" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Pricing</Link>
        <div className="h-4 w-px bg-white/10" />
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noreferrer"
          className="text-slate-400 hover:text-white transition-all flex items-center gap-2 group"
        >
          <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold">Star on GitHub</span>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
