
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from './Icons';

interface MultiSelectProps {
  label: string;
  prefix: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  accentColor?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ 
  label, 
  prefix, 
  options, 
  selected, 
  onChange,
  accentColor = 'blue'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const getDisplayText = () => {
    if (selected.length === 0) return 'Выберите...';
    if (selected.length === 1) return selected[0];
    return `${prefix}: ${selected.length}`;
  };

  const bgColorClass = `bg-${accentColor}-50/50`;
  const borderColorClass = `border-${accentColor}-100`;
  const accentClass = `accent-${accentColor}-600`;

  return (
    <div className="relative space-y-2" ref={containerRef}>
      <label className={`text-[10px] font-black text-${accentColor}-500 uppercase tracking-wider ml-1`}>
        {label}
      </label>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${bgColorClass} border ${borderColorClass} text-left p-4 rounded-2xl font-bold text-xs flex justify-between items-center transition hover:opacity-80`}
      >
        <span className={`truncate ${selected.length > 0 ? `text-${accentColor}-600` : 'text-slate-700'}`}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full bg-white border border-slate-100 shadow-2xl rounded-2xl mt-2 p-5 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid gap-4">
            {options.map(option => (
              <label key={option} className="flex items-center gap-3 text-xs font-semibold cursor-pointer group">
                <input 
                  type="checkbox" 
                  className={`w-4 h-4 rounded border-slate-300 ${accentClass} transition`}
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span className="group-hover:text-blue-600 transition-colors">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
