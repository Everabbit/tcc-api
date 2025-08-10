export const getUsernameInitials = (username: string): string => {
  if (!username) return '';
  const names = username.split(' ');
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  } else {
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  }
};

export const clone = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};
