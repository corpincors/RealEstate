import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Plus, X } from './Icons';

interface EditableMultiSelectProps {
  label: string;
  prefix: string;
  initialOptions: string[]; // Предопределенные опции
  selected: string[];
  onChange: (selected: string[]) => void;
  accentColor?: string;
}

const EditableMultiSelect: React.FC<EditableMultiSelectProps> = ({ 
  label, 
  prefix, 
  initialOptions,
  selected, 
  onChange,
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

  // Объединяем предопределенные опции с любыми выбранными, которые не входят в предопределенные
  // Это гарантирует, что ранее сохраненные пользовательские опции видны в выпадающем списке
  const allAvailableOptions = useMemo(() => {
    const combined = [...initialOptions, ...selected];
    return Array.from(new Set(combined.filter(v => typeof v === 'string' && v.trim() !== ''))).sort();
  }, [initialOptions, selected]);

  const filteredOptions = allAvailableOptions.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  );

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item: string) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleAddCustomOption = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !selected.includes(trimmedValue)) {
      onChange([...selected, trimmedValue]);
      setInputValue(''); // Очищаем поле ввода после добавления
      inputRef.current?.focus(); // Возвращаем фокус на поле ввода
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Предотвращаем отправку формы
      handleAddCustomOption();
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
                  {/* Возможность удаления для всех опций, если они не являются частью initialOptions, или для всех выбранных */}
                  {/* Для простоты, позволим удалять все, что выбрано, если это не базовый набор, но для MultiSelect это обычно не нужно */}
                  {/* Если нужно удалять только пользовательские, то логика будет сложнее */}
                  {/* Здесь просто показываем, что можно удалить выбранный элемент */}
                  {selected.includes(option) && (
                    <button
                      type="button"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onChange(selected.filter(item => item !== option));
                      }}
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