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
    x += froms.map( s => getNamedSource(s, out) ).join(', ');
    
    return x;
  };

}