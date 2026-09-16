import { PlateValidationError } from "../errors/licensePlate.errors.ts";

export const formatPlateInput = (value: string, previous = ""): string => {
  const compact = value.trim().toUpperCase().replace(/-/g, "");
  const compactRgx = /^(?:[A-Z]{0,3}|[A-Z]{3}\d{0,4})$/;

  if (!compactRgx.test(compact)) {
    return previous;
  }

  return compact.length > 3
    ? `${compact.slice(0, 3)}-${compact.slice(3)}`
    : compact;
};

export const normalizePlate = (value: string): string => {
  const valueRgx = /^([A-Z]{3})-?(\d{3,4})$/;
  const match = valueRgx.exec(value.trim().toUpperCase());

  if (!match) {
    throw new PlateValidationError();
  }

  return `${match[1]}${match[2]!.padStart(4, "0")}`;
};

export const displayPlate = (value: string): string => {
  const compact = value.replace(/-/g, "").toUpperCase();
  const compactRgx = /^[A-Z]{3}\d{3,4}$/;

  return compactRgx.test(compact)
    ? `${compact.slice(0, 3)}-${compact.slice(3)}`
    : value;
};

export const isValidPlate = (value: string): boolean => {
  try {
    normalizePlate(value);
    return true;
  } catch {
    return false;
  }
};
