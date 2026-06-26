import apiClient from './apiClient';
import type { Client, CreateClientDTO } from '../types';

export const clientService = {
  getAllClients: async (): Promise<Client[]> => {
    const response = await apiClient.get<Client[]>('/clients');
    return response.data;
  },

  getClientById: async (id: number): Promise<Client> => {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response.data;
  },

  createClient: async (clientData: CreateClientDTO): Promise<Client> => {
    const response = await apiClient.post<Client>('/clients', clientData);
    return response.data;
  },

  updateClient: async (id: number, clientData: Partial<CreateClientDTO>): Promise<Client> => {
    const response = await apiClient.put<Client>(`/clients/${id}`, clientData);
    return response.data;
  },

  deleteClient: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },

  searchClients: async (searchTerm: string): Promise<Client[]> => {
    const response = await apiClient.get<Client[]>(`/clients/search?query=${searchTerm}`);
    return response.data;
  },

  findByIdentificationNumber: async (identificationNumber: string): Promise<Client | null> => {
    const response = await apiClient.get<Client>(`/clients/identification/${identificationNumber}`);
    return response.data;
  },
};