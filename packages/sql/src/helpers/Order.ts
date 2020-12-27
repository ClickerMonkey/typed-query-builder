import { OrderBy } from '@typed-query-builder/builder';
import { DialectFeatures } from '../Features';
import { DialectOutput } from '../Output';


export function getOrder(order: OrderBy, out: DialectOutput): string
{
  let x = out.wrap( order.value );

  if (order.order)
  {
    x += ` ${order.order}`;
  }

  if (order.nullsLast !== undefined)
  {
    out.dialect.requireSupport(DialectFeatures.ORDER_NULLS);

    x += ` NULLS ${order.nullsLast ? 'LAST' : 'FIRST'}`;
  }

  return x;
}