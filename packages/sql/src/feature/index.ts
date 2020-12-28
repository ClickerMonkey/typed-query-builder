import { Dialect } from '../Dialect';
import { addAggregateDistinctFeature } from './AggregateDistinct';
import { addAggregateFilterFeature } from './AggregateFilter';
import { addAggregateOrderFeature } from './AggregateOrder';
import { addDefaultFeature } from './Default';
import { addDeleteReturningFeature } from './DeleteReturning';
import { addDeleteUsingFeature } from './DeleteUsing';
import { addInsertIgnoreDuplicateFeature } from './InsertIgnoreDuplicate';
import { addInsertPriorityFeature } from './InsertPriority';
import { addInsertReturningFeature } from './InsertReturning';
import { addInsertUpdateDuplicateFeature } from './InsertUpdateDuplicate';
import { addSelectDistinctOnFeature } from './SelectDistinctOn';
import { addUpdateFromFeature } from './UpdateFrom';
import { addUpdateReturningFeature } from './UpdateReturning';
import { addWithFeature } from './With';
import { addWithRecursiveFeature } from './WithRecursive';


export function addFeatures(dialect: Dialect)
{
  addAggregateDistinctFeature(dialect);
  addAggregateFilterFeature(dialect);
  addAggregateOrderFeature(dialect);
  addDefaultFeature(dialect);
  addDeleteReturningFeature(dialect);
  addDeleteUsingFeature(dialect);
  addInsertIgnoreDuplicateFeature(dialect);
  addInsertPriorityFeature(dialect);
  addInsertReturningFeature(dialect);
  addInsertUpdateDuplicateFeature(dialect);
  addSelectDistinctOnFeature(dialect);
  addUpdateFromFeature(dialect);
  addUpdateReturningFeature(dialect);
  addWithFeature(dialect);
  addWithRecursiveFeature(dialect);
}