
import { isNumber } from '@typed-query-builder/builder';
import { RunFunctions } from '../Functions';


RunFunctions.abs = (x: number): number =>
{
  return x < 0 ? -x : x;
};

RunFunctions.ceil = (x: number): number =>
{
  return Math.ceil(x);
};

RunFunctions.floor = (x: number): number =>
{
  return Math.floor(x);
};

RunFunctions.exp = (x: number): number =>
{
  return Math.exp(x);
};

RunFunctions.ln = (x: number): number =>
{
  return Math.log2(x) / Math.LOG2E;
};

RunFunctions.mod = (x: number, y: number): number =>
{
  return y === 0 ? 0 : x % y;
};

RunFunctions.power = (x: number, y: number): number =>
{
  return Math.pow(x, y);
};

RunFunctions.sqrt = (x: number): number =>
{
  return Math.sqrt(x);
};

RunFunctions.cbrt = (x: number): number =>
{
  return Math.cbrt(x);
};

RunFunctions.degrees = (x: number): number =>
{
  return x * Math.PI / 180;
};

RunFunctions.radians = (x: number): number =>
{
  return x * 180 / Math.PI;
};

RunFunctions.div = (x: number, y: number): number =>
{
  return y === 0 ? 0 : Math.floor(x / y);
};

RunFunctions.factorial = (x: number): number =>
{
  return x <= 1 ? x : x * RunFunctions.factorial(x - 1);
};

RunFunctions.gcd = (x: number, y: number): number =>
{
  return !y ? x : RunFunctions.gcd(y, x % y);
};

RunFunctions.lcm = (x: number, y: number): number =>
{
  return (x * y) / RunFunctions.gcd(x, y);
};

RunFunctions.log10 = (x: number): number =>
{
  return Math.log10(x);
};

RunFunctions.log = (x: number, y: number): number =>
{
  return Math.log10(x) / Math.log2(y);
};

RunFunctions.pi = (): number =>
{
  return Math.PI;
};

RunFunctions.round = (x: number): number =>
{
  return Math.round(x);
};

RunFunctions.sign = (x: number): number =>
{
  return x === 0 ? 0 : x < 0 ? -1 : 1;
};

RunFunctions.truncate = (x: number): number =>
{
  return x < 0 ? Math.ceil(x) : Math.floor(x);
};

RunFunctions.random = (max?: number, min?: number): number =>
{
  const a = isNumber(max) ? max : 1;
  const b = isNumber(min) ? min : 0;
  const c = Math.min(a, b);
  const d = Math.max(a, b);

  return Math.random() * (d - c) + c;
};