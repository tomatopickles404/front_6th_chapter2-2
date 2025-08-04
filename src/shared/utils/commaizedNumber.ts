export const commaizedNumber = (number: number): string => {
  return number.toLocaleString();
};

export const commaizedNumberWithUnit = (number: number, unit: string): string => {
  return `${number.toLocaleString()} ${unit}`;
};

export const commaziedNumberWithCurrency = (number: number, currency: string): string => {
  return `${currency}${number.toLocaleString()}`;
};
