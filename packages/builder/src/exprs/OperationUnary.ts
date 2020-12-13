import { ExprScalar } from '..';
import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { OperationUnaryType } from '../Types';
import { Expr } from './Expr';


export class ExprOperationUnary extends ExprScalar<number> 
{
  
  public static readonly id = '-a';
  
  public constructor(
    public type: OperationUnaryType,
    public value: ExprScalar<number>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.OPERATION_UNARY;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
    });
  }

}