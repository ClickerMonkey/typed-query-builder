import { Dialect } from './Dialect';
import { addExists } from './exprs/Exists';
import { addFeatures } from './feature';
import { addQuery } from './query';
import { ReservedWords } from './Reserved';


export const DialectBase = new Dialect();

DialectBase.addReservedWords(ReservedWords);
DialectBase.predicateBinaryAlias['!='] = '<>';
DialectBase.predicateBinaryListAlias['!='] = '<>';
DialectBase.predicateRowAlias['!='] = '<>';
DialectBase.joinTypeAlias['INNER'] = 'INNER JOIN';
DialectBase.joinTypeAlias['LEFT'] = 'LEFT JOIN';
DialectBase.joinTypeAlias['RIGHT'] = 'RIGHT JOIN';
DialectBase.joinTypeAlias['FULL'] = 'FULL JOIN';

addExists(DialectBase);
addFeatures(DialectBase);
addQuery(DialectBase);