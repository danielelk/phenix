// src/styles/theme.ts
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const colors = {
  primary: '#f5a623',
  primaryLight: '#ffc166',
  primaryDark: '#e09000',
  secondary: '#3366cc',
  secondaryLight: '#5588ee',
  secondaryDark: '#2255aa',
  success: '#28a745',
  info: '#17a2b8',
  warning: '#ffc107',
  danger: '#dc3545',
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  background: '#f8f9fa',
  backgroundLight: '#ffffff',
  backgroundDark: '#e9ecef',
  border: '#dcdee2',
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.backgroundLight,
    accent: colors.primary,
    error: colors.danger,
    text: colors.text,
    disabled: colors.textMuted,
    placeholder: colors.textMuted,
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const fonts = {
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
};