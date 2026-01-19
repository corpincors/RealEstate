import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X, Plus } from './Icons';

interface EditableSingleSelectProps {
  label: string;
  initialOptions: string[]; // Предопределенные опции
  selected: string;
  onChange: (value: string) => void;
  onAddCustomOption: (option: string) => void; // Callback для добавления пользовательской опции
  onRemoveOption: (option: string) => void; // Callback для удаления опции
  accentColor?: string;
}

const EditableSingleSelect: React.FC<EditableSingleSelectProps> = ({
  label,
  initialOptions,
  selected,
  onChange,
  onAddCustomOption,
  onRemoveOption,
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

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setInputValue(''); // Очищаем поле ввода после выбора
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true); // Открываем список при вводе
  };

  const handleAddCustomOption = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !initialOptions.includes(trimmedValue)) {
      onAddCustomOption(trimmedValue);
      onChange(trimmedValue); // Сразу выбираем добавленную опцию
      setInputValue(''); // Очищаем поле ввода
      setIsOpen(false); // Закрываем список после добавления
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
    onRemoveOption(option);
    if (selected === option) {
      onChange(''); // Сбрасываем выбранное значение, если удалили текущее
    }
  };

  const filteredOptions = useMemo(() => {
    return initialOptions.filter((option: string) =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [initialOptions, inputValue]);

  const bgColorClass = `bg-${accentColor}-50/50`;
  const borderColorClass = `border-${accentColor}-100`;
  // const accentClass = `accent-${accentColor}-600`; // Удалена неиспользуемая переменная

  return (
    <div className="relative space-y-2" ref={containerRef}>
      <label className={`text-[10px] font-black text-slate-900 uppercase tracking-wider ml-1`}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${bgColorClass} border ${borderColorClass} text-left p-4 rounded-2xl font-bold text-xs flex justify-between items-center transition hover:opacity-80`}
      >
        <span className={`truncate ${selected ? `text-slate-900` : 'text-slate-700'}`}>
          {selected || 'Выберите...'}
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
              onChange={handleInputChange}
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
                <div key={option} className="flex items-center justify-between gap-3 text-xs font-semibold cursor-pointer group">
                  <span
                    onClick={() => handleSelect(option)}
                    className={`flex-grow transition-colors ${selected === option ? `text-slate-900` : 'group-hover:text-blue-600'}`}
                  >
                    {option}
                  </span>
                  <button
                    type="button"
                    onClick={(e: React.MouseEvent) => handleRemove(e, option)}
                    className="p-1 bg-slate-50 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 transition"
                    title="Удалить"
                  >
                    <X className="w-3 h-3" />
                  </button>
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

export default EditableSingleSelect;