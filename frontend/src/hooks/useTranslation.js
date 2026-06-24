// src/hooks/useTranslation.js
import { useTheme } from '../contexts/ThemeContext';

export const useTranslation = () => {
  const { t } = useTheme();
  return { t };
};