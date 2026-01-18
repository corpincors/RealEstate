"use client";

import React, { useState, useEffect } from 'react';
import { Client } from '../../types';
import { X, Phone, MessageSquare, Calendar, User } from '../../components/Icons'; // Import User icon

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  editingClient: Client | null;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingClient,
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    clientName: '', // Initialize clientName
    phoneNumber: '',
    lastCalled: new Date().toISOString(),
    request: '',
  });

  useEffect(() => {
    if (editingClient) {
      setFormData(editingClient);
    } else if (isOpen) {
      setFormData({
        clientName: '', // Reset clientName for new client
        phoneNumber: '',
        lastCalled: new Date().toISOString(),
        request: '',
      });
    }
  }, [editingClient, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phoneNumber || !formData.request) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }

    const newClient: Client = {
      ...formData as Client,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      lastCalled: formData.lastCalled || new Date().toISOString(),
    };
    onSave(newClient);
  };

  const formatDateForInput = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[95vh] rounded-[3rem] overflow-y-auto relative custom-scrollbar animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-[900] text-slate-900 tracking-tight">
              {editingClient ? 'Редактировать клиента' : 'Добавить нового клиента'}
            </h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1">Управление контактами</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Имя клиента</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Имя Фамилия"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 pl-12 outline-none font-bold text-slate-700 transition shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Номер телефона</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+380 XX XXX XX XX"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 pl-12 outline-none font-bold text-slate-700 transition shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Последний звонок</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                <input
                  type="datetime-local"
                  name="lastCalled"
                  value={formatDateForInput(formData.lastCalled || new Date().toISOString())}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl p-4 pl-12 outline-none font-bold text-slate-700 transition shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Запрос клиента</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-blue-300" />
                <textarea
                  name="request"
                  value={formData.request}
                  onChange={handleChange}
                  placeholder="Ищет 2-комнатную квартиру в центре..."
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[2rem] p-4 pl-12 outline-none font-medium text-slate-700 min-h-[100px] transition shadow-sm"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-[900] uppercase tracking-[0.25em] shadow-2xl shadow-blue-200 transition-all active:scale-[0.98]"
          >
            {editingClient ? 'Сохранить изменения' : 'Добавить клиента'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientFormModal;