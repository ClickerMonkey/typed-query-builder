import { ExprScalar } from '..';
import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { OperationBinaryType } from '../Types';
import { Expr } from './Expr';


export class ExprOperationBinary extends ExprScalar<number> 
{
  
  public static readonly id = 'a+b';

  public constructor(
    public type: OperationBinaryType,
    public first: ExprScalar<number>,
    public second: ExprScalar<number>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.OPERATION_BINARY;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('first', this.first, (replace) => this.first = replace as any);
      traverse.step('second', this.second, (replace) => this.second = replace as any);
    });
  }

}