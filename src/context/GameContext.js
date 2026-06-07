import React, { createContext, useContext, useState, useCallback } from 'react';
import { saveGame, loadGame } from '../utils/storage';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [playerName, setPlayerName] = useState('');
  const [party, setParty] = useState([]);
  const [bag, setBag] = useState({ pokeballs: 5, potions: 0 });
  const [currentArea, setCurrentArea] = useState('Route 1');

  const addToParty = useCallback((pokemon) => {
    setParty(prev => prev.length < 6 ? [...prev, pokemon] : prev);
  }, []);

  const updatePartyMember = useCallback((index, updated) => {
    setParty(prev => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const replaceParty = useCallback((newParty) => {
    setParty(newParty);
  }, []);

  const usePokeball = useCallback(() => {
    setBag(prev => ({ ...prev, pokeballs: Math.max(0, prev.pokeballs - 1) }));
  }, []);

  const addPokeball = useCallback((n = 1) => {
    setBag(prev => ({ ...prev, pokeballs: prev.pokeballs + n }));
  }, []);

  const save = useCallback(async () => {
    return saveGame({ playerName, party, bag, currentArea });
  }, [playerName, party, bag, currentArea]);

  const load = useCallback(async () => {
    const data = await loadGame();
    if (!data) return false;
    setPlayerName(data.playerName ?? '');
    setParty(data.party ?? []);
    setBag(data.bag ?? { pokeballs: 5, potions: 0 });
    setCurrentArea(data.currentArea ?? 'Route 1');
    return true;
  }, []);

  return (
    <GameContext.Provider value={{
      playerName, setPlayerName,
      party, setParty,
      bag,
      currentArea, setCurrentArea,
      addToParty,
      updatePartyMember,
      replaceParty,
      usePokeball,
      addPokeball,
      save,
      load,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
