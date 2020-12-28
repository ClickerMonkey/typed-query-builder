import { ExprScalar } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addSelectDistinctOnFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.SELECT_DISTINCT_ON] = (exprs: ExprScalar<any>[], transform, out) => 
  {
    let x = '';

    x += 'DISTINCT ON (';
    x += exprs.map( e => transform(e, out ) ).join(', ');
    x += ')';
    
    return x;
  };

}