import { Dialect } from './Dialect';
import { ReservedWords } from './Reserved';


export const DialectBase = new Dialect();

DialectBase.addReservedWords(ReservedWords);
DialectBase.predicateBinaryAlias['!='] = '<>';
DialectBase.predicateBinaryListAlias['!='] = '<>';
DialectBase.predicateRowAlias['!='] = '<>';