import { useContext } from 'react';
// Ensure this path is correct
import { AppContext } from '../contexts/AppContext.js';

export const useAppContext = () => {
  return useContext(AppContext);
};