import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVE_KEY = 'pokemon_save_v1';

export async function saveGame(data) {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export async function loadGame() {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function hasSave() {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    return !!raw;
  } catch {
    return false;
  }
}

export async function deleteSave() {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
    return true;
  } catch {
    return false;
  }
}
