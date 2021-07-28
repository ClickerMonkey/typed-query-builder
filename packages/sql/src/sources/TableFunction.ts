import { SourceFunction } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';


export function addTableFunction(dialect: Dialect)
{
  dialect.transformer.setTransformer<SourceFunction<any, any, any>>(
    SourceFunction,
    (expr, transform, out) => 
    {
      const paramNames = Object.keys(expr.parameters);
      const paramIndices = paramNames.map(p => parseInt(p));
      const paramsIndexOnly = paramIndices.every(p => isFinite(p));
      const params = paramsIndexOnly
        ? paramIndices.sort().map(String)
        : paramNames;

      const args: string[] = out.dialect.hasSupport(DialectFeatures.FUNCTION_NAMED_PARAMS) && !paramsIndexOnly
        ? params.map(paramKey =>
            out.dialect.quoteName(String(paramKey)) +
            out.dialect.namedFunctionParameterDelimiter + 
            out.wrap(expr.parameters[paramKey])
          )
        : params.map(paramKey => out.wrap(expr.parameters[paramKey]))
      ;

      let x = '';
      x += String(expr.table.table);
      x += '(';
      x += args.join(', ');
      x += ')';

      return x;
    }
  ); 
}