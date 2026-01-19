import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Plus, X } from './Icons';

interface EditableMultiSelectProps {
  label: string;
  prefix: string;
  initialOptions: string[]; // All available options (constants + custom)
  constantOptions: string[]; // Original, non-removable constant options
  selected: string[];
  onChange: (selected: string[]) => void;
  onAddCustomOption: (option: string) => void;
  onRemoveOption: (option: string) => void; // New prop for global removal
  accentColor?: string;
}

const EditableMultiSelect: React.FC<EditableMultiSelectProps> = ({ 
  label, 
  prefix, 
  initialOptions, // Now includes all options
  constantOptions = [], // Добавлено значение по умолчанию
  selected, 
  onChange,
  onAddCustomOption,
  onRemoveOption, // Destructure new prop
  accentColor = 'blue'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    console.log(`EditableMultiSelect (${label}): initialOptions updated`, initialOptions); // Добавлен лог
  }, [initialOptions, label]);

  // filteredOptions now just uses initialOptions directly, as it's already combined
  const filteredOptions = useMemo(() => {
    return initialOptions.filter(option =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [initialOptions, inputValue]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item: string) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleAddCustomOption = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !initialOptions.includes(trimmedValue)) { // Check against all initial options
      onAddCustomOption(trimmedValue);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomOption();
    }
  };

  const handleRemove = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    onRemoveOption(option); // Call the global remove handler
    // Also deselect if it was selected for the current property
    onChange(selected.filter(item => item !== option));
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
        onClick={() => {
          setIsOpen(!isOpen);
          console.log(`EditableMultiSelect: Toggling dropdown for ${label}. New state: ${!isOpen}`);
        }}
        className={`w-full ${bgColorClass} border ${borderColorClass} text-left p-4 rounded-2xl font-bold text-xs flex justify-between items-center transition hover:opacity-80`}
      >
        <span className={`truncate ${selected.length > 0 ? `text-${accentColor}-600` : 'text-slate-700'}`}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-slate-100 shadow-2xl rounded-2xl mt-2 p-5 max-h-64 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Добавить свой вариант..."
              className="flex-grow bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl p-2 text-xs font-medium outline-none transition"
            />
            <button
              type="button"
              onClick={handleAddCustomOption}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition"
              title="Добавить"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid gap-4">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option: string) => (
                <label key={option} className="flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer group">
                  <div className="flex items-center gap-3 flex-grow">
                    <input 
                      type="checkbox" 
                      className={`w-4 h-4 rounded border-slate-300 ${accentClass} transition`}
                      checked={selected.includes(option)}
                      onChange={() => toggleOption(option)}
                    />
                    <span className="group-hover:text-blue-600 transition-colors">{option}</span>
                  </div>
                  {!constantOptions.includes(option) && ( // Only show delete for non-constant options
                    <button
                      type="button"
                      onClick={(e: React.MouseEvent) => handleRemove(e, option)}
                      className="p-1 bg-slate-50 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 transition"
                      title="Удалить"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </label>
              ))
            ) : (
              <p className="text-xs text-slate-500">Нет совпадений</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableMultiSelect;