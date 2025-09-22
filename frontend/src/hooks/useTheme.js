import { useContext, createContext, useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return systemTheme;
};

export const useThemeMode = () => {
  const [themeMode, setThemeMode] = useLocalStorage('theme-mode', 'system');
  const systemTheme = useSystemTheme();

  const effectiveTheme = themeMode === 'system' ? systemTheme : themeMode;

  const toggleTheme = () => {
    setThemeMode(prev => {
      switch (prev) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'system';
        case 'system':
        default:
          return 'light';
      }
    });
  };

  const setTheme = (theme) => {
    if (['light', 'dark', 'system'].includes(theme)) {
      setThemeMode(theme);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', effectiveTheme);
      
      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [effectiveTheme]);

  return {
    themeMode,
    effectiveTheme,
    systemTheme,
    toggleTheme,
    setTheme,
    isDark: effectiveTheme === 'dark',
    isLight: effectiveTheme === 'light',
    isSystem: themeMode === 'system'
  };
};

export const useColorMode = () => {
  const { effectiveTheme, toggleTheme, setTheme } = useThemeMode();
  
  return {
    colorMode: effectiveTheme,
    toggleColorMode: toggleTheme,
    setColorMode: setTheme
  };
};

export const usePreferredColorScheme = () => {
  const [preferredScheme, setPreferredScheme] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'no-preference';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightQuery = window.matchMedia('(prefers-color-scheme: light)');

    const handleDarkChange = (e) => {
      if (e.matches) setPreferredScheme('dark');
    };

    const handleLightChange = (e) => {
      if (e.matches) setPreferredScheme('light');
    };

    darkQuery.addEventListener('change', handleDarkChange);
    lightQuery.addEventListener('change', handleLightChange);

    return () => {
      darkQuery.removeEventListener('change', handleDarkChange);
      lightQuery.removeEventListener('change', handleLightChange);
    };
  }, []);

  return preferredScheme;
};

export const useThemeVariables = () => {
  const { effectiveTheme } = useThemeMode();

  const getThemeVariable = (variableName) => {
    if (typeof document === 'undefined') return null;
    
    const root = document.documentElement;
    return getComputedStyle(root).getPropertyValue(`--${variableName}`).trim();
  };

  const setThemeVariable = (variableName, value) => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    root.style.setProperty(`--${variableName}`, value);
  };

  return {
    theme: effectiveTheme,
    getThemeVariable,
    setThemeVariable
  };
};

export default useTheme;


