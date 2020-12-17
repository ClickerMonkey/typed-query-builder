import { Name } from '../types';
import { Select } from '../select/Select';
import { ExprScalar } from './Scalar';
import { ExprKind } from '../Kind';
import { NamedSource } from '../sources';
import { query } from '../helpers';
import { Expr } from './Expr';


export class ExprField<F extends Name, T> extends ExprScalar<T> implements Select<F, T>
{
  
  public static readonly id = 'field';

  public constructor(
    public source: NamedSource<any, any>,
    public alias: F
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.FIELD;
  }

  public isSimple(): boolean {
    return true;
  }

  public getExpr(): ExprScalar<T> {
    return this;
  }

  public count(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>, distinct: boolean = false): ExprScalar<number> {
    return query().from(this.source).where(conditions || []).count(distinct, this);
  }

  public sum(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): T extends number ? ExprScalar<number> : never {
    return query().from(this.source).where(conditions || []).sum(this as any) as any;
  }

  public avg(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): T extends number ? ExprScalar<number> : never {
    return query().from(this.source).where(conditions || []).avg(this as any) as any;
  }

  public min(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): T extends number ? ExprScalar<number> : never {
    return query().from(this.source).where(conditions || []).min(this as any) as any;
  }

  public max(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): T extends number ? ExprScalar<number> : never {
    return query().from(this.source).where(conditions || []).max(this as any) as any;
  }

  public list(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): Expr<T[]> {
    return query().from(this.source).where(conditions || []).list(this) as any;
  }

  public first(conditions?: ExprScalar<boolean>[] | ExprScalar<boolean>): Expr<T> {
    return query().from(this.source).where(conditions || []).value(this as any) as any;
  }
 
}