import { isArray, ExprAggregate, AggregateFunctions } from '@typed-query-builder/builder';
import { Dialect, DialectParamsAggregate } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getWindow } from '../helpers/Window';


export function addAggregate(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprAggregate<{}, [], string, any, AggregateFunctions>>(
    ExprAggregate,
    (expr, transform, out) => 
    {
      const { _type, _values, _filter, _distinct, _order, _overWindow, _overWindowDefinition } = expr;

      const requiredArgument = out.dialect.aggregateRequiresArgument[_type];
      const params: Partial<DialectParamsAggregate> = {};

      if (isArray(_values) && _values.length > 0) 
      {
        const args = _values.map( v => out.wrap(v) );

        params.args = args.join(', ');
        params.argCount = args.length;
        params.argList = args;

        for (let i = 0; i < args.length; i++)
        {
          params[i] = args[i];
        }
      }
      else if (requiredArgument)
      {
        params.args = requiredArgument;
        params[0] = requiredArgument;
        params.argCount = 1;
        params.argList = [requiredArgument];
      }

      if (_distinct) 
      {
        params.distinct = out.dialect.getFeatureOutput(DialectFeatures.AGGREGATE_DISTINCT, expr, out) + ' ';
      }

      if (_order && _order.length > 0) 
      {
        params.order = ' ' + out.dialect.getFeatureOutput(DialectFeatures.AGGREGATE_ORDER, _order, out);
      }

      params.name = dialect.functionsUpper ? String(_type).toUpperCase() : String(_type);

      if (_filter)
      {
        params.filter = ' ' + out.dialect.getFeatureOutput(DialectFeatures.AGGREGATE_FILTER, _filter, out);
      }

      if (_overWindow) 
      {
        out.dialect.requireSupport(DialectFeatures.AGGREGATE_OVER);

        params.over = ` OVER ${dialect.quoteName(_overWindow)}`;
      }
      else if (_overWindowDefinition) 
      {
        out.dialect.requireSupport(DialectFeatures.AGGREGATE_OVER);

        params.over = ` OVER (${getWindow(_overWindowDefinition, out)})`;
      }

      return out.dialect.aggregates.get(_type, params);
    }
  );
}