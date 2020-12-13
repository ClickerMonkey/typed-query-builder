import { Selects } from "..";
import { Expr } from "../exprs";



export abstract class Source<S extends Selects> extends Expr<S[]>
{

  public abstract getSelects(): S;

}