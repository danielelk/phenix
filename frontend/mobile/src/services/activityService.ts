import api from './api';
import { Activity, Participant, Expense, Presence, ManualParticipant } from '../types';

const activityService = {
  getActivitiesByDateRange: async (startDate: string, endDate: string) => {
    return await api.get('/activities/calendar', {
      params: { startDate, endDate },
    });
  },

  getActivityById: async (id: number) => {
    return await api.get(`/activities/${id}`);
  },

  startActivity: async (id: number) => {
    return await api.post(`/activities/${id}/start`, {
      started_at: new Date().toISOString(),
    });
  },

  completeActivity: async (id: number) => {
    return await api.post(`/activities/${id}/complete`, {
      completed_at: new Date().toISOString(),
    });
  },

  savePresence: async (
    activityId: number, 
    participants: Presence[], 
    manualParticipants: ManualParticipant[]
  ) => {
    return await api.post(`/activities/${activityId}/presence`, {
      participants,
      manualParticipants,
    });
  },

  getExpenses: async (activityId: number) => {
    return await api.get(`/activities/${activityId}/expenses`);
  },

  addExpense: async (activityId: number, expense: {
    title: string;
    amount: number;
    description?: string;
  }) => {
    return await api.post(`/activities/${activityId}/expenses`, expense);
  },

  deleteExpense: async (activityId: number, expenseId: number) => {
    return await api.delete(`/activities/${activityId}/expenses/${expenseId}`);
  },
};

export default activityService;