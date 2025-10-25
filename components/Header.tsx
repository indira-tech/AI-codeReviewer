import React from 'react';

interface HeaderProps {
  isManualOffline: boolean;
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ isManualOffline, onToggle }) => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-sky-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
            AI Code Reviewer
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`text-sm font-medium ${isManualOffline ? 'text-slate-400' : 'text-green-400'}`}>
            {isManualOffline ? 'Offline' : 'Online'}
          </span>
          <label htmlFor="offline-toggle" className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              id="offline-toggle" 
              className="sr-only peer"
              checked={!isManualOffline}
              onChange={onToggle}
            />
            <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-sky-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>
    </header>
  );
};

export default Header;