import { Dialect } from './Dialect';
import { addExprs } from './exprs';
import { addFeatures } from './feature';
import { addQuery } from './query';
import { ReservedWords } from './Reserved';
import { addSources } from './sources';


export const DialectBase = new Dialect();

DialectBase.addReservedWords(ReservedWords);
DialectBase.predicateBinary.alias('!=', '<>');
DialectBase.predicateBinary.alias('DISTINCT', '<>');
DialectBase.predicateBinary.alias('NOT DISTINCT', '=');
DialectBase.predicateBinaryList.alias('!=', '<>');
DialectBase.predicateRow.alias('!=', '<>');
DialectBase.predicateRow.alias('DISTINCT', 'IS DISTINCT FROM');
DialectBase.predicateRow.alias('NOT DISTINCT', 'IS NOT DISTINCT FROM');
DialectBase.joinType.aliases({
  INNER: 'INNER JOIN',
  LEFT: 'LEFT JOIN',
  RIGHT: 'RIGHT JOIN',
  FULL: 'FULL JOIN',
});
DialectBase.valueFormatter.push(
  Dialect.FormatBoolean,
  Dialect.FormatTemporal,
  Dialect.FormatInterval,
  Dialect.FormatGeometry,
  Dialect.FormatDate,
  Dialect.FormatString,
  Dialect.FormatNumber,
  Dialect.FormatNull,
);

addExprs(DialectBase);
addFeatures(DialectBase);
addQuery(DialectBase);
addSources(DialectBase);