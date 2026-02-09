
import { User, SummaryItem } from '../types';

const USERS_KEY = 'summdir_users';
const SUMMARIES_KEY = 'summdir_summaries';
const SESSION_KEY = 'summdir_session';

export const getStoredUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User) => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getStoredSummaries = (userId: string): SummaryItem[] => {
  const data = localStorage.getItem(SUMMARIES_KEY);
  const all: SummaryItem[] = data ? JSON.parse(data) : [];
  return all.filter(s => s.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
};

export const addSummary = (summary: SummaryItem) => {
  const data = localStorage.getItem(SUMMARIES_KEY);
  const all: SummaryItem[] = data ? JSON.parse(data) : [];
  all.push(summary);
  localStorage.setItem(SUMMARIES_KEY, JSON.stringify(all));
};

export const setCurrentSession = (user: User | null) => {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const getCurrentSession = (): User | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};
