import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { ConditionBinaryType } from '../types';
import { Expr } from './Expr';
import { ExprScalar } from './Scalar';


export class ExprConditionBinary<T> extends ExprScalar<boolean> 
{
  
  public static readonly id = 'a?b';

  public constructor(
    public type: ConditionBinaryType,
    public value: ExprScalar<T>,
    public test: ExprScalar<T>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.CONDITION_BINARY;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
      traverse.step('test', this.test, (replace) => this.test = replace as any);
    });
  }

}