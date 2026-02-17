export default {
  list: (filter, fail, success) => {
    console.log('[Mock] SMS list requested');
    success(0, '[]');
  },
};
