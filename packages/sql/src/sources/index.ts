import { Dialect } from '../Dialect';
import { addTable } from './Table';
import { addTableFunction } from './TableFunction';
import { addValues } from './Values';


export function addSources(dialect: Dialect)
{
  addTable(dialect);
  addTableFunction(dialect);
  addValues(dialect);
}

export {
  addTable,
  addTableFunction,
  addValues,
};