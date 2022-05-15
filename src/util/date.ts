const setDateTime = (deleteTime: number): string => {
  const timestamp = Date.now() + deleteTime;
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
};

export default { setDateTime };
