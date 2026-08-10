import React, { useState } from 'react';
import ResumeUploader from './components/ResumeUploader';
import AnalysisResults from './components/AnalysisResults';
// In main.jsx or App.jsx
import './index.css';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-12 px-6">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          AI Career Intelligence Suite
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Automated resume parsing, AI feedback generation, and ATS job targeting.
        </p>
      </header>

      <main className="w-full flex flex-col items-center">
        <ResumeUploader onAnalysisComplete={setAnalysisResult} />
        <AnalysisResults data={analysisResult} />
      </main>
    </div>
  );
}