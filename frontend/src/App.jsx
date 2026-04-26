import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import IssueExplorer from './components/IssueExplorer';
import CodeHealthReport from './components/CodeHealthReport';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col pt-16">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard/:repoId" element={<Dashboard />} />
            <Route path="/issues/:repoId" element={<IssueExplorer />} />
            <Route path="/health/:repoId" element={<CodeHealthReport />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
