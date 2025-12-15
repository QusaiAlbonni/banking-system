// src/common/transformers.ts
export const toOptionalNumber = (val: any) => {
  if (val === null || val === undefined || val === '') return undefined;
  const n = Number(val);
  return Number.isFinite(n) ? n : undefined;
};

export const toNumber = (val: any) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : val;
};

export const toBoolean = (val: any) => {
  if (val === null || val === undefined || val === '') return undefined;
  const s = String(val).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'off'].includes(s)) return false;
  // fallback: treat non-empty as true
  return Boolean(val);
};

export const toDateOrUndefined = (val: any) => {
  if (val === null || val === undefined || val === '') return undefined;
  // allow timestamp number or ISO string
  const t = typeof val === 'number' ? new Date(val) : new Date(String(val));
  return isNaN(t.getTime()) ? undefined : t;
};

export const toEnum =
  <T>(enumObj: any) =>
  (val: any) => {
    if (val === null || val === undefined || val === '') return undefined;
    const s = String(val);
    // try direct match (string values)
    if (Object.values(enumObj).includes(s)) return s as unknown as T;
    // try matching by key (case-insensitive)
    const foundKey = Object.keys(enumObj).find(
      (k) => k.toLowerCase() === s.toLowerCase(),
    );
    if (foundKey) return enumObj[foundKey] as unknown as T;
    // try numeric index
    const maybeNum = Number(val);
    if (
      !Number.isNaN(maybeNum) &&
      Object.values(enumObj).includes(maybeNum as any)
    )
      return maybeNum as unknown as T;
    return undefined;
  };

export const toNumberArray = (val: any) => {
  if (val === null || val === undefined || val === '') return undefined;
  if (Array.isArray(val)) return val.map((v) => Number(v));
  if (typeof val === 'string') {
    // accept JSON array like "[1,2]" or comma list "1,2,3"
    const s = val.trim();
    if (s.startsWith('[')) {
      try {
        return JSON.parse(s).map((x: any) => Number(x));
      } catch {
        /* fallthrough */
      }
    }
    return s
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((x) => !Number.isNaN(x));
  }
  return undefined;
};
