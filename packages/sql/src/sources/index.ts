import { Dialect } from '../Dialect';
import { addTable } from './Table';
import { addValues } from './Values';


export function addSources(dialect: Dialect)
{
  addTable(dialect);
  addValues(dialect);
}

export {
  addTable,
  addValues
};