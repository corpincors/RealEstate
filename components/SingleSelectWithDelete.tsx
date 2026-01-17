import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from './Icons';

interface SingleSelectWithDeleteProps {
  label: string;
  options: string[]; // Все доступные районы (включая кастомные)
  initialOptions: string[]; // Изначальные, не удаляемые районы
  selected: string;
  onChange: (value: string) => void;
  onRemoveOption: (option: string) => void;
  accentColor?: string;
}

const SingleSelectWithDelete: React.FC<SingleSelectWithDeleteProps> = ({
  label,
  options,
  initialOptions,
  selected,
  onChange,
  onRemoveOption,
  accentColor = 'blue'
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true); // Открываем список при вводе
  };

  const handleRemove = (e: React.MouseEvent, option: string) => {
    e.stopPropagation(); // Предотвращаем закрытие списка при удалении
    onRemoveOption(option);
  };

  const filteredOptions = options.filter((option: string) =>
    option.toLowerCase().includes(selected.toLowerCase())
  );

  const bgColorClass = `bg-${accentColor}-50/50`;
  const borderColorClass = `border-${accentColor}-100`;
  // const accentClass = `accent-${accentColor}-600`; // Удалена неиспользуемая переменная

  return (
    <div className="relative space-y-2" ref={containerRef}>
      <label className={`text-[10px] font-black text-${accentColor}-500 uppercase tracking-wider ml-1`}>
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={selected}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Выберите или введите..."
          className={`w-full ${bgColorClass} border ${borderColorClass} text-left p-4 rounded-2xl font-bold text-xs flex justify-between items-center transition hover:opacity-80 pr-10`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
        >
          <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full bg-white border border-slate-100 shadow-2xl rounded-2xl mt-2 p-5 max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid gap-4">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option: string) => (
                <div key={option} className="flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer group">
                  <span
                    onClick={() => handleSelect(option)}
                    className="flex-grow group-hover:text-blue-600 transition-colors"
                  >
                    {option}
                  </span>
                  {!initialOptions.includes(option) && (
                    <button
                      type="button"
                      onClick={(e: React.MouseEvent) => handleRemove(e, option)}
                      className="p-1 bg-slate-50 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 transition"
                      title="Удалить район"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
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

export default SingleSelectWithDelete;