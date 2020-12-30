import { SourceKind, StatementDelete } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getPredicates } from '../helpers/Predicates';


export function addDelete(dialect: Dialect)
{
  dialect.transformer.setTransformer<StatementDelete>(
    StatementDelete,
    (expr, transform, out) => 
    {
      const { _sources, _from, _where, _returning } = expr;

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
      
      x += 'DELETE FROM ';
      x += out.dialect.quoteName(String(_from.table));

      out.sources.push(_from as any);

      const usings = _sources
        .filter( s => s.kind === SourceKind.USING )
        .map( s => s.source )
      ;

      if (usings.length > 0) 
      {
        x += ' ';
        x += usings.map( u => 
        {
          const s = out.dialect.getFeatureOutput(DialectFeatures.DELETE_USING, u, out );

          out.sources.push(u);

          return s;
        }).join(' ');
      }

      if (_where.length > 0) 
      {
        x += ' WHERE ';
        x += getPredicates( _where, 'AND', transform, out );
      }

      if (_returning.length > 0) 
      {
        x += ' ';
        x += out.dialect.getFeatureOutput(DialectFeatures.DELETE_RETURNING, _returning, out );
      }

      out.restoreSources(saved);

      return x;
    }
  );
}