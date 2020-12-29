import { Dialect } from './Dialect';
import { addExprs } from './exprs';
import { addFeatures } from './feature';
import { addQuery } from './query';
import { ReservedWords } from './Reserved';
import { addSources } from './sources';


export const DialectBase = new Dialect();

DialectBase.addReservedWords(ReservedWords);
DialectBase.predicateBinaryAlias['!='] = '<>';
DialectBase.predicateBinaryListAlias['!='] = '<>';
DialectBase.predicateRowAlias['!='] = '<>';
DialectBase.joinTypeAlias['INNER'] = 'INNER JOIN';
DialectBase.joinTypeAlias['LEFT'] = 'LEFT JOIN';
DialectBase.joinTypeAlias['RIGHT'] = 'RIGHT JOIN';
DialectBase.joinTypeAlias['FULL'] = 'FULL JOIN';
DialectBase.valueFormatter.push(
  Dialect.FormatBoolean,
  Dialect.FormatDate,
  Dialect.FormatString,
  Dialect.FormatNumber,
  Dialect.FormatNull,
);

addExprs(DialectBase);
addFeatures(DialectBase);
addQuery(DialectBase);
addSources(DialectBase);