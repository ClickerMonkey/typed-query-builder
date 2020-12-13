import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { AggregateType } from '../Types';
import { Expr } from './Expr';
import { ExprScalar } from './Scalar';


export class ExprAggregate extends ExprScalar<number> 
{

  public static readonly id = 'agg';

  public constructor(
    public type: AggregateType,
    public distinct: boolean,
    public value?: ExprScalar<any>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.AGGREGATE;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      if (this.value) {
        traverse.step('value', this.value, (replace) => this.value = replace as any, () => this.value = undefined);
      }
    });
  }
  
  public isSimple(): boolean {
    return true;
  }

}