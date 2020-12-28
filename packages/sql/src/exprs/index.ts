import { Dialect } from '../Dialect';
import { addAggregate } from './Aggregate';
import { addBetween } from './Between';
import { addCase } from './Case';
import { addCast } from './Cast';
import { addConstant } from './Constant';
import { addDefault } from './Default';
import { addExists } from './Exists';
import { addField } from './Field';
import { addFunction } from './Function';
import { addIn } from './In';
import { addNot } from './Not';
import { addNull } from './Null';
import { addOperationBinary } from './OperationBinary';
import { addOperationUnary } from './OperationUnary';
import { addParam } from './Param';
import { addPredicateBinary } from './PredicateBinary';
import { addPredicateBinaryList } from './PredicateBinaryList';
import { addPredicateRow } from './PredicateRow';
import { addPredicates } from './Predicates';
import { addPredicateUnary } from './PredicateUnary';
import { addRaw } from './Raw';
import { addRow } from './Row';


export function addExprs(dialect: Dialect)
{
  addAggregate(dialect);
  addBetween(dialect);
  addCase(dialect);
  addCast(dialect);
  addConstant(dialect);
  addDefault(dialect);
  addExists(dialect);
  addField(dialect);
  addFunction(dialect);
  addIn(dialect);
  addNot(dialect);
  addNull(dialect);
  addOperationBinary(dialect);
  addOperationUnary(dialect);
  addParam(dialect);
  addPredicateBinary(dialect);
  addPredicateBinaryList(dialect);
  addPredicateRow(dialect);
  addPredicates(dialect);
  addPredicateUnary(dialect);
  addRaw(dialect);
  addRow(dialect);
}