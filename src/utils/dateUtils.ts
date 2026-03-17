import { format, startOfDay, endOfDay, isSameDay, addDays, subDays } from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM d, h:mm a');
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const getStartOfDay = (date: Date): Date => {
  return startOfDay(date);
};

export const getEndOfDay = (date: Date): Date => {
  return endOfDay(date);
};

export const getRelativeDate = (date: Date): string => {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const yesterday = subDays(today, 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, tomorrow)) return 'Tomorrow';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  
  return formatDate(date);
};