import React from 'react';
import { X } from '../../components/Icons'; // Исправленный путь импорта

interface EditableDistrictListProps {
  districts: string[];
  onRemove: (district: string) => void;
}

const EditableDistrictList: React.FC<EditableDistrictListProps> = ({ districts, onRemove }) => {
  return (
    <div className="space-y-2">
      {districts.map((district) => (
        <div key={district} className="flex items-center justify-between bg-slate-100 p-3 rounded-xl text-sm font-semibold text-slate-700">
          <span>{district}</span>
          <button
            type="button"
            onClick={() => onRemove(district)}
            className="p-1 bg-slate-200 rounded-full hover:bg-red-100 text-slate-500 hover:text-red-600 transition"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default EditableDistrictList;