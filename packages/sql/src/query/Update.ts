import { SourceKind, StatementUpdate } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getPredicates } from '../helpers/Predicates';
import { getStatementSet } from '../helpers/Set';


export function addUpdate(dialect: Dialect)
{
  dialect.transformer.setTransformer<StatementUpdate<any, any, any, any>>(
    StatementUpdate,
    (expr, transform, out) => 
    {
      const { _sources, _returning, _target, _sets, _where } = expr;

      const saved = out.saveSources();

      let x = '';

      const withs = _sources
        .filter( s => s.kind === SourceKind.WITH )
        .map( s => s.source )
      ;

      x += withs.map( w => 
      {
        const s = out.dialect.getFeatureOutput(DialectFeatures.WITH, w, out);

        out.sources.push(w);

        return s;
      }).join(' ');

      x += 'UPDATE ';

      const only = _sources.some( s => s.source === _target && s.kind === SourceKind.ONLY );
      if (only)
      {
        x += 'ONLY ';
      }

      x += out.dialect.quoteName(String(_target.table));

      out.sources.push(_target as any);
      
      if (_sets.length > 0)
      {
        x += ' SET ';
        x += _sets.map( s => getStatementSet( s, transform, out ) ).join(', ');
      }

      const froms = _sources
        .filter( s => s.kind === SourceKind.FROM )
        .map( s => s.source )
      ;

      if (froms.length > 0)
      {
        x += ' ';
        x += out.dialect.getFeatureOutput(DialectFeatures.UPDATE_FROM, froms, out);
      }

      if (_where.length > 0)
      {
        x += ' WHERE ';
        x += getPredicates(_where, 'AND', transform, out);
      }
      
      if (_returning.length > 0) 
      {
        x += ' ';
        x += out.dialect.getFeatureOutput(DialectFeatures.UPDATE_RETURNING, _returning, out );
      }

      out.restoreSources(saved);

      return x;
    }
  );
}