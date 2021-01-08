import { RunFunctions } from '../Functions';


RunFunctions.acos = (x: number): number =>
{
  return Math.acos(x);
};

RunFunctions.acosd = (x: number): number =>
{
  return RunFunctions.degrees(RunFunctions.acos(x));
};

RunFunctions.asin = (x: number): number =>
{
  return Math.asin(x);
};

RunFunctions.asind = (x: number): number =>
{
  return RunFunctions.degrees(RunFunctions.asin(x));
};

RunFunctions.atan = (x: number): number =>
{
  return Math.atan(x);
};

RunFunctions.atand = (x: number): number =>
{
  return RunFunctions.degrees(RunFunctions.atan(x));
};

RunFunctions.atan2 = (y: number, x: number): number =>
{
  return Math.atan2(y, x);
};

RunFunctions.atan2d = (y: number, x: number): number =>
{
  return RunFunctions.degrees(RunFunctions.atan2(y, x));
};

RunFunctions.cos = (x: number): number =>
{
  return Math.cos(x);
};

RunFunctions.cosd = (x: number): number =>
{
  return RunFunctions.degrees(RunFunctions.cos(x));
};

RunFunctions.cot = (x: number): number =>
{
  return Math.tan(Math.PI / 2 - x);
};

RunFunctions.cotd = (x: number): number =>
{
  return RunFunctions.degrees(RunFunctions.cot(x));
};

RunFunctions.sin = (x: number): number =>
{
  return Math.sin(x);
};

RunFunctions.sind = (x: number): number =>
{
  return RunFunctions.degrees(RunFunctions.sin(x));
};

RunFunctions.tan = (x: number): number =>
{
  return Math.tan(x);
};

RunFunctions.tand = (x: number): number =>
{
  return RunFunctions.degrees(RunFunctions.tan(x));
};

RunFunctions.sinh = (x: number): number =>
{
  return Math.sinh(x);
};

RunFunctions.cosh = (x: number): number =>
{
  return Math.cosh(x);
};

RunFunctions.tanh = (x: number): number =>
{
  return Math.tanh(x);
};

RunFunctions.asinh = (x: number): number =>
{
  return Math.asinh(x);
};

RunFunctions.acosh = (x: number): number =>
{
  return Math.acosh(x);
};

RunFunctions.atanh = (x: number): number =>
{
  return Math.atanh(x);
};