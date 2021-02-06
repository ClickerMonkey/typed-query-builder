
import { isArray, isNumber, isString } from '@typed-query-builder/builder';
import { RunFunctions } from '../Functions';


RunFunctions.lower = (x: string): string =>
{
  return isString(x) ? x.toLowerCase() : x;
};

RunFunctions.upper = (x: string): string =>
{
  return isString(x) ? x.toUpperCase() : x;
};

RunFunctions.trim = (x: string): string =>
{
  return isString(x) ? x.trim() : x;
};

RunFunctions.trimLeft = (x: string): string =>
{
  return isString(x) ? x.trimLeft() : x;
};

RunFunctions.trimRight = (x: string): string =>
{
  return isString(x) ? x.trimRight() : x;
};

RunFunctions.concat = (...values: string[]): string =>
{
  return isArray(values) ? values.join('') : values;
};

RunFunctions.length = (x: string): number =>
{
  return isString(x) ? x.length : 0;
};

RunFunctions.indexOf = (x: string, search: string): number =>
{
  return isString(x) ? x.indexOf(search) + 1 : -1;
};

RunFunctions.substring = (x: string, start: number, length?: number): string =>
{
  return isString(x) ? x.substring(start, isNumber(length) ? start + length : undefined) : '';
};

RunFunctions.regexGet = (x: string, regex: string): string =>
{
  return new RegExp(regex).exec(x)?.[0] || '';
};

RunFunctions.regexReplace = (x: string, pattern: string, replacement: string, flags?: string): string =>
{
  return isString(x) ? x.replace(new RegExp(pattern, flags), replacement) : '';
};

RunFunctions.char = (n: number): string =>
{
  return isNumber(n) ? String.fromCharCode(n) : '';
};

RunFunctions.join = (separator: string, ...values: string[]): string =>
{
  return isArray(values) ? values.join(separator) : '';
};

RunFunctions.format = (format: string, ...values: string[]): string =>
{
  // NOT supported at the moment.
  return '';
};

RunFunctions.left = (x: string, n: number): string =>
{
  return isString(x) ? x.substring(0, n) : '';
};

RunFunctions.right = (x: string, n: number): string =>
{
  return isString(x) ? x.substring(x.length - n) : '';
};

RunFunctions.padLeft = (x: string, length: number, padding?: string): string =>
{
  if (!isString(x) || !isNumber(length)) {
    return x;
  }

  const remaining = length - x.length;

  if (remaining <= 0) return x;

  const pad = padding || ' ';
  const repeated = RunFunctions.repeat(pad, Math.ceil(remaining / pad.length));

  return repeated.substring(0, remaining) + x;
};

RunFunctions.padRight = (x: string, length: number, padding?: string): string =>
{
  if (!isString(x) || !isNumber(length)) {
    return x;
  }

  const remaining = length - x.length;

  if (remaining <= 0) return x;

  const pad = padding || ' ';
  const repeated = RunFunctions.repeat(pad, Math.ceil(remaining / pad.length));

  return x + repeated.substring(0, remaining);
};

RunFunctions.md5 = (x: string): string =>
{
  // NOT supported at the moment.
  return '';
};

RunFunctions.repeat = (x: string, n: number): string =>
{
  if (!isString(x)) {
    return '';
  }

  let r = '';

  while (--n >= 0) {
    r += x;
  }

  return r;
};

RunFunctions.replace = (x: string, from: string, to: string): string =>
{
  return isString(x) ? x.split(from).join(to) : x;
};

RunFunctions.reverse = (x: string): string =>
{
  return isString(x) ? x.split('').reverse().join('') : x;
};

RunFunctions.startsWith = (x: string, y: string): boolean =>
{
  return isString(x) && isString(y) ? y.length <= x.length && x.substring(0, y.length) === y : false;
};