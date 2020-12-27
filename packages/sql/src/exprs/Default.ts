import { ExprDefault } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addDefault(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprDefault>(
    ExprDefault,
    (expr, transform, out) => 
    {
      return out.dialect.getFeatureOutput(DialectFeatures.DEFAULT, null, out);
    }
  );
}