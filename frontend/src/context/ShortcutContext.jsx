import React, { createContext, useContext, useEffect, useState } from 'react';

const ShortcutContext = createContext();

export const ShortcutProvider = ({ children }) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const togglePalette = () => {
    setIsPaletteOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
      
      // Close on escape
      if (e.key === 'Escape') {
        setIsPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ShortcutContext.Provider value={{ isPaletteOpen, setIsPaletteOpen, togglePalette }}>
      {children}
    </ShortcutContext.Provider>
  );
};

export const useShortcuts = () => useContext(ShortcutContext);
