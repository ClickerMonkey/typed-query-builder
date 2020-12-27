import { OrderBy } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getOrder } from '../helpers/Order';
import { DialectFeatures } from '../Features';

export function addAggregateOrder(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.AGGREGATE_ORDER] = (_order: OrderBy[], transform, out) => {
    return 'ORDER BY ' + _order.map( (o) => getOrder(o, out) ).join(', ');
  };
}