import { InsertPriority } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addInsertPriorityFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.INSERT_PRIORITY] = (priority: InsertPriority, transform, out) => 
  {
    return out.dialect.insertPriority.get(priority);
  };
}