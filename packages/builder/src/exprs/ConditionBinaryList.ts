import { ExprKind, ExprScalar, Traverser, Expr, ConditionBinaryListPass, ConditionBinaryListType, isArray } from '../internal';


export class ExprConditionBinaryList<T> extends ExprScalar<boolean> 
{
  
  public static readonly id = ExprKind.CONDITION_BINARY_LIST;

  public constructor(
    public type: ConditionBinaryListType,
    public pass: ConditionBinaryListPass,
    public value: ExprScalar<T>,
    public test: ExprScalar<T[]> | ExprScalar<T>[]
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.CONDITION_BINARY_LIST;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
      traverse.step('test', () => {
        const test = this.test;
        if (isArray(test)) {
          for (let i = 0; i < test.length; i++) {
            traverse.step(i, test[i], (replace) => test[i] = replace as any);
          }
        } else {
          traverse.step(0, test, (replace) => this.test = replace as any);
        }
      });
    });
  }

}