export default {
  setItem: async (key, value) => {
    console.log(`[Mock] EncryptedStorage setItem: ${key}`);
    localStorage.setItem(key, value);
  },
  getItem: async key => {
    console.log(`[Mock] EncryptedStorage getItem: ${key}`);
    return localStorage.getItem(key);
  },
  removeItem: async key => localStorage.removeItem(key),
  clear: async () => localStorage.clear(),
};
