import { createContext, useContext } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Always use light theme
  const theme = 'light';

  const value = {
    theme: 'light',
    toggleTheme: () => {}, // No-op
    setLightTheme: () => {},
    setDarkTheme: () => {},
    isDark: false,
    isLight: true,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
