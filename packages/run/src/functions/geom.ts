import { RunFunctions } from '../Functions';
import { parseGenericGeometry } from '../util';


RunFunctions.geomCenter = (g) =>
{
  const gg = parseGenericGeometry(g);

  if (!gg) 
  {
    throw new Error('You can only find the center of a Geometry object');
  }

  return gg.center();
};

RunFunctions.geomContains = (g, h) =>
{
  const gg = parseGenericGeometry(g);
  const hh = parseGenericGeometry(h);

  if (!gg || !hh) 
  {
    throw new Error('You can only calculate containment of Geometry objects');
  }

  return gg.contains(hh);
};

RunFunctions.geomDistance = (g, h) =>
{
  const gg = parseGenericGeometry(g);
  const hh = parseGenericGeometry(h);

  if (!gg || !hh) 
  {
    throw new Error('You can only calculate distance of Geometry objects');
  }

  return gg.distance(hh);
};

RunFunctions.geomWithinDistance = (g, h, d) =>
{
  const gg = parseGenericGeometry(g);
  const hh = parseGenericGeometry(h);

  if (!gg || !hh) 
  {
    throw new Error('You can only calculate distance of Geometry objects');
  }

  return gg.withinDistance(hh, d);
};

RunFunctions.geomIntersection = () =>
{
  throw new Error('Geometry intersection is not supported in the runtime.');
};

RunFunctions.geomIntersects = (g, h) =>
{
  const gg = parseGenericGeometry(g);
  const hh = parseGenericGeometry(h);

  if (!gg || !hh) 
  {
    throw new Error('You can only calculate intersects of Geometry objects');
  }

  return gg.intersects(hh);
};

RunFunctions.geomTouches = (g, h) =>
{
  const gg = parseGenericGeometry(g);
  const hh = parseGenericGeometry(h);

  if (!gg || !hh) 
  {
    throw new Error('You can only calculate touches of Geometry objects');
  }

  return gg.intersects(hh);
};

RunFunctions.geomPoints = (g) =>
{
  const gg = parseGenericGeometry(g);

  if (!gg) 
  {
    throw new Error('You can only find the point count of a Geometry object');
  }

  return gg.getPointCount();
};

RunFunctions.geomPoint = (g, i) =>
{
  const gg = parseGenericGeometry(g);

  if (!gg) 
  {
    throw new Error('You can only find the point of a Geometry object');
  }

  return gg.getPoint(i);
};

RunFunctions.geomPointX = (a) =>
{
  return a.x;
};

RunFunctions.geomPointY = (a) =>
{
  return a.y;
};