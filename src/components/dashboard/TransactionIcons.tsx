
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

export const IncomeIcon = () => {
  return <ArrowDown className="h-4 w-4 text-green-600" />
};

export const ExpenseIcon = () => {
  return <ArrowUp className="h-4 w-4 text-red-600" />
};
