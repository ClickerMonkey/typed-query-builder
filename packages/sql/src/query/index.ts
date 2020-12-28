import { Dialect } from '../Dialect';
import { addDelete } from './Delete';
import { addExistential } from './Existential';
import { addFirst } from './First';
import { addFirstValue } from './FirstValue';
import { addInsert } from './Insert';
import { addJson } from './Json';
import { addList } from './List';
import { addSelect } from './Select';
import { addSet } from './Set';
import { addUpdate } from './Update';


export function addQuery(dialect: Dialect)
{
  addDelete(dialect);
  addExistential(dialect);
  addFirst(dialect);
  addFirstValue(dialect);
  addInsert(dialect);
  addJson(dialect);
  addList(dialect);
  addSelect(dialect);
  addSet(dialect);
  addUpdate(dialect);
}