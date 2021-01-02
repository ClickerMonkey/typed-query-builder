import { NamedSource } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getNamedSource } from '../helpers/NamedSource';


export function addDeleteUsingFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.DELETE_USING] = (usings: NamedSource<any, any>[], transform, out) => 
  {
    return 'USING ' + usings.map( f => 
    {
      const s = getNamedSource(f, out);

      out.sources.push(f);

      return s;
    }).join(', ');
  };
}