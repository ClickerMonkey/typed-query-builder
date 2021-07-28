import { ExprScalar, StatementSet, _Boolean } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getPredicates } from '../helpers/Predicates';
import { getStatementSet } from '../helpers/Set';

export function addInsertUpdateDuplicateFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.INSERT_SET_ON_DUPLICATE] = ({ sets, where }: { sets: StatementSet<any>[], where: ExprScalar<_Boolean>[] }, transform, out) => 
  {
    let x = '';

    x += 'ON CONFLICT DO UPDATE SET ';
    x += sets.map( s => getStatementSet( s, transform, out ) ).join(', ');

    if (where.length > 0)
    {
      x += ' WHERE ';
      x += out.modify({ excludeSource: true }, () => getPredicates( where, 'AND', transform, out ));
    }

    return x;
  };
}