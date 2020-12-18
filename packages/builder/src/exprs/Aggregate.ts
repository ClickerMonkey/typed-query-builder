import { OrderBy } from '../Order';
import { FunctionArgumentValues, FunctionResult } from '../Functions';
import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { AggregateFunctions, OrderDirection } from '../types';
import { Expr } from './Expr';
import { ExprScalar } from './Scalar';


export class ExprAggregate<A extends keyof Aggs, Aggs = AggregateFunctions> extends ExprScalar<FunctionResult<A, Aggs>> 
{

  public static readonly id = ExprKind.AGGREGATE;

  public constructor(
    public type: A,
    public values: FunctionArgumentValues<A, Aggs>,
    public distinct?: boolean,
    public filter?: ExprScalar<boolean>,
    public order: OrderBy[] = [],
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.AGGREGATE;
  }

  public aggregateDistinct(): this {
    this.distinct = true;

    return this;
  }

  public aggregateAll(): this {
    this.distinct = false;

    return this;
  }

  public filterBy(condition: ExprScalar<boolean>): this {
    this.filter = condition;

    return this;
  }

  public orderBy(expr: ExprScalar<any>, dir?: OrderDirection, nullsLast?: boolean): this {
    this.order.push(new OrderBy(expr, dir, nullsLast));

    return this;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('values', () => {
        for (let i = 0; this.values.length; i++) {
          traverse.step(i, this.values[i], (replace) => this.values[i] = replace as any);
        }
      });
      traverse.step('orderBy', () => {
        for (let i = 0; i < this.order.length; i++) {
          traverse.step(i, this.order[i].value, (replace) => this.order[i].value = replace as any);
        }
      });
      if (this.filter) {
        traverse.step('filter', this.filter, (replace) => this.filter = replace as any, () => this.filter = undefined);
      }
    });
  }
  
  public isSimple(): boolean {
    return !this.filter;
  }

}