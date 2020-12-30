import { NamedSource } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getNamedSource } from '../helpers/NamedSource';


export function addUpdateFromFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.UPDATE_FROM] = (froms: NamedSource<any, any>[], transform, out) => 
  {
    let x = '';

    x += 'FROM ';
    x += froms.map( f => 
    {
      const s = getNamedSource(f, out);

      out.sources.push(f);

      return s;
    }).join(', ');
    
    return x;
  };

}