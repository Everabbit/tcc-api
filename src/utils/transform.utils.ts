export const toBase64 = (str: string) => {
  return Buffer.from(str).toString('base64');
};

export const fromBase64 = (str: string) => {
  return Buffer.from(str, 'base64').toString('ascii');
};
