"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Client } from '../../types';
import { PlusCircle, Users, Edit, Trash2 } from '../../components/Icons';
import ClientFormModal from '../components/ClientFormModal';
import { showSuccess, showError } from '../utils/toast';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

const API_URL = '/api/clients';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Client[] = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      showError("Не удалось загрузить список клиентов.");
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSaveClient = async (client: Client) => {
    try {
      if (editingClient) {
        const response = await fetch(`${API_URL}/${client.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(client),
        });
        if (!response.ok) throw new Error('Failed to update client');
        showSuccess('Клиент успешно обновлен!');
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(client),
        });
        if (!response.ok) throw new Error('Failed to add client');
        showSuccess('Клиент успешно добавлен!');
      }
      fetchClients();
      setIsModalOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error("Error saving client:", error);
      showError("Ошибка при сохранении клиента. Пожалуйста, проверьте консоль.");
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого клиента?')) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete client');
      fetchClients();
      showSuccess('Клиент успешно удален!');
    } catch (error) {
      console.error("Error deleting client:", error);
      showError("Ошибка при удалении клиента. Пожалуйста, проверьте консоль.");
    }
  };

  const openAddModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200">
            <Users className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">
              Клиенты
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">
              Управление клиентской базой
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl font-bold flex items-center gap-3 text-xs transition-all active:scale-95 bg-slate-100 hover:bg-slate-200 text-slate-600"
          >
            Объекты
          </Link>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            <PlusCircle className="w-5 h-5" /> Добавить клиента
          </button>
        </div>
      </header>

      <section className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-sm border border-slate-50 mb-12">
        {clients.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-medium">
            Пока нет клиентов. Добавьте первого клиента!
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider rounded-tl-2xl">
                    Имя клиента
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                    Номер телефона
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                    Последний звонок
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                    Запрос
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-black text-slate-400 uppercase tracking-wider rounded-tr-2xl">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {clients.map((client: Client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      {client.clientName || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {client.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDateTime(client.lastCalled)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs"> {/* Removed whitespace-nowrap and truncate */}
                      {client.request}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />
    </div>
  );
};

export default ClientsPage;