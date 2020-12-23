import { isArray, ExprAggregate, AggregateFunctions } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';
import { getOrder } from './Order';
import { getWindow } from './Window';


export function addAggregate(dialect: Dialect)
{
  dialect.transformer.setTransformer<ExprAggregate<{}, [], string, any, AggregateFunctions>>(
    ExprAggregate,
    (expr, transform, out) => 
    {
      const { _type, _values, _filter, _distinct, _order, _overWindow, _overWindowDefinition } = expr;

      let args = ['*'];

      if (isArray(_values) && _values.length > 0) {
        args = _values.map( v => out.wrap(v) );
      }

      let prefix = '';
      let suffix =  '';

      if (_distinct) {
        out.dialect.requireSupport(DialectFeatures.AGGREGATE_DISTINCT);

        prefix = 'DISTINCT ';
      }

      if (_order && _order.length > 0) {
        out.dialect.requireSupport(DialectFeatures.AGGREGATE_ORDER);

        suffix = ' ORDER BY ' + _order.map( (o) => getOrder(o, out) ).join(', ');
      }

      let x = dialect.getFunctionString(_type, args, prefix, suffix);

      if (_filter) {
        out.dialect.requireSupport(DialectFeatures.AGGREGATE_FILTER);

        x += ` FILTER (WHERE ${transform(_filter, out)})`;
      }

      if (_overWindow) {
        out.dialect.requireSupport(DialectFeatures.AGGREGATE_OVER);

        x += ` OVER ${dialect.nameQuoter(_overWindow, dialect)})`;
      }
      else if (_overWindowDefinition) {
        out.dialect.requireSupport(DialectFeatures.AGGREGATE_OVER);

        x += ` OVER (${getWindow(_overWindowDefinition, out)})`;
      }

      return x;
    }
  );
}