import { SourceKind, QuerySelect } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getCriteria } from '../helpers/Criteria';
import { getLock } from '../helpers/Lock';


export function addSelect(dialect: Dialect)
{
  dialect.transformer.setTransformer<QuerySelect<any, any, any>>(
    QuerySelect,
    (expr, transform, out) => 
    {
      const { _criteria, _distinct, _distinctOn, _locks } = expr;

      let x = '';

      const withs = _criteria.sources
        .filter( s => s.kind === SourceKind.WITH )
        .map( s => s.source )
      ;

      x += withs.map( w => out.dialect.getFeatureOutput(DialectFeatures.WITH, w, out) ).join(' ');

      x += 'SELECT ';

      if (_distinctOn)
      {
        x += out.dialect.getFeatureOutput(DialectFeatures.SELECT_DISTINCT_ON, _distinctOn, out);
        x += ' ';
      }
      else if (_distinct)
      {
        x += 'DISTINCT ';
      }

      x += getCriteria(_criteria, transform, out, true, true, true, true, true);

      if (_locks.length > 0)
      {
        x += ' ';
        x += _locks.map( l => getLock( l, out ) ).join(' ');
      }

      return x;
    }
  );
}