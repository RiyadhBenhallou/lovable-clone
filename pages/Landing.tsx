import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { initialPrompt: prompt } });
    }
  };

  const suggestions = [
    "A minimal personal portfolio with dark mode",
    "A pomodoro timer with sound alerts",
    "A currency converter dashboard",
    "A landing page for a coffee shop"
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl w-full z-10 flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/50 border border-gray-800 text-blue-400 text-sm font-medium mb-4">
           <Sparkles className="w-4 h-4" />
           <span>AI-Powered Website Builder</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2">
          Build simple web apps <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            with just text.
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl">
          Describe what you want to build, and watch it come to life instantly. 
          No coding required, just pure creativity.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl mt-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative flex items-center bg-gray-900 rounded-2xl border border-gray-800 p-2 shadow-2xl">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your dream website..."
              className="flex-1 bg-transparent border-none outline-none text-lg text-white px-4 py-3 placeholder:text-gray-600"
              autoFocus
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="bg-white text-gray-950 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
            {suggestions.map((suggestion, i) => (
                <button 
                    key={i}
                    onClick={() => {
                        setPrompt(suggestion);
                    }}
                    className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                >
                    {suggestion}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};