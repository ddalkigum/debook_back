const setDateTime = (deleteTime: number): string => {
  const timestamp = Date.now() + deleteTime * 1000;
  const timeDiff = 9 * 60 * 60 * 1000;

  return new Date(timestamp + timeDiff).toISOString().slice(0, 19).replace('T', ' ');
};

export default { setDateTime };
