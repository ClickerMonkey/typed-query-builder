import { AggregateType } from '../../_Types';
import { Expr } from './Expr';


export class ExprAggregate extends Expr<number> 
{

  public static readonly id = 'agg';

  public constructor(
    public type: AggregateType,
    public distinct: boolean,
    public value?: Expr<any>
  ) {
    super();
  }
  
  public isSimple(): boolean {
    return true;
  }

}