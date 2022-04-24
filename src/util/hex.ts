const generateHexString = (length: number): string => {
  const hex = '01234567890abcdef';
  let output = '';
  for (let i = 0; i < length; i++) {
    output += hex.charAt(Math.floor(Math.random() * hex.length));
  }
  return output;
};

export default { generateHexString };
