import { createContext, useContext, ReactNode, useEffect } from 'react';

interface DarkModeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const darkMode = false; // ALTID lys mode

  useEffect(() => {
    // Fjern dark class hvis den stadig sidder
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('darkMode');
  }, []);

  const toggleDarkMode = () => {
    console.log("Dark mode er midlertidigt slået fra");
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}