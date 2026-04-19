import { useState, useMemo } from 'react';
import type { Transaction } from '../types';

export const useDateFilter = (transactions: Transaction[]) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTransactions = useMemo(() => {
    if (!startDate && !endDate) return transactions;

    return transactions.filter(t => {
      const d = t.date;
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    });
  }, [transactions, startDate, endDate]);

  const setDateRange = (start: string, end: string, filterName = 'custom') => {
    setStartDate(start);
    setEndDate(end);
    setActiveFilter(filterName);
  };

  const resetDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setActiveFilter('all');
  };

  return {
    startDate,
    endDate,
    activeFilter,
    filteredTransactions,
    setDateRange,
    resetDateFilter,
  };
};