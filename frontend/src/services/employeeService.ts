import apiClient from './apiClient';
import type { Employee } from '../types';

export const employeeService = {
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await apiClient.get<Employee[]>('/employees');
    return response.data;
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    const response = await apiClient.get<Employee>(`/employees/${id}`);
    return response.data;
  },

  createEmployee: async (employeeData: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.post<Employee>('/employees', employeeData);
    return response.data;
  },

  updateEmployee: async (id: number, employeeData: Partial<Employee>): Promise<Employee> => {
    const response = await apiClient.put<Employee>(`/employees/${id}`, employeeData);
    return response.data;
  },

  deleteEmployee: async (id: number): Promise<any> => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },

  getEmployeesWithoutUser: async (): Promise<Employee[]> => {
    const response = await apiClient.get<Employee[]>('/employees/without-user');
    return response.data;
  },
};
