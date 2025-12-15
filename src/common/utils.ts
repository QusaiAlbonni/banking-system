import { parsePhoneNumberFromString } from 'libphonenumber-js';
export function isClassExtending(childClass: Function, parentClass: Function) {
  let proto = childClass;

  while (proto) {
    if (proto === parentClass) return true;
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

export type Constructable<T = any> = new (...args: any[]) => T;
export type RequireOnly<T, K extends keyof T> = Pick<T, K> &
  Partial<Omit<T, K>>;

export function makeAnother<T extends Object>(obj: T, ...args: any[]): T {
  const Cls = obj.constructor as new (...args: any[]) => T;
  return new Cls(...args);
}

export function mergeDefined<T>(obj: T, partial: Partial<T>): T {
  for (const key of Object.keys(partial)) {
    const value = partial[key];
    if (value !== undefined) {
      obj[key] = value;
    }
  }
  return obj;
}
export function mergeDefinedV2<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  (Object.keys(source) as Array<keyof T>).forEach((k) => {
    const v = source[k];

    if (v !== undefined && Object.prototype.hasOwnProperty.call(source, k)) {
      target[k] = v as T[typeof k];
    }
  });
  return target;
}
export function mergeDefinedImmutable<T extends Record<string, any>>(
  obj: T,
  partial: Partial<T>,
): T {
  const out = { ...obj } as T;
  (Object.keys(partial) as Array<keyof T>).forEach((k) => {
    const v = partial[k];
    if (v !== undefined && Object.prototype.hasOwnProperty.call(partial, k)) {
      out[k] = v as T[typeof k];
    }
  });
  return out;
}

export function getCountryFromPhoneNumber(phoneNumber: string) {
  const parsedNumber = parsePhoneNumberFromString(phoneNumber);
  return parsedNumber ? parsedNumber.country : null;
}

export function toBoolean(v: unknown) {
  if (Array.isArray(v)) v = v[0];
  if (v === true || v === false) return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes' || s === 'y') return true;
    if (s === 'false' || s === '0' || s === 'no' || s === 'n') return false;
  }
  if (typeof v === 'number') return v === 1;
  return v;
}
