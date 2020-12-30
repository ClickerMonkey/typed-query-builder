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

      const saved = out.saveSources();
      const allSources = _criteria.sources.map( s => s.source );

      let x = '';

      const withs = _criteria.sources
        .filter( s => s.kind === SourceKind.WITH )
        .map( s => s.source )
      ;

      x += withs.map( w => 
      {
        const s = out.dialect.getFeatureOutput(DialectFeatures.WITH, w, out) 

        out.sources.push(w);

        return s;
      }).join(' ');

      x += 'SELECT ';

      if (_distinctOn.length > 0)
      {
        x += out.addSources(allSources, () => out.dialect.getFeatureOutput(DialectFeatures.SELECT_DISTINCT_ON, _distinctOn, out));
        x += ' ';
      }
      else if (_distinct)
      {
        x += 'DISTINCT ';
      }

      out.restoreSources(saved);

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