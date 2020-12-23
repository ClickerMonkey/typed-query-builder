import { Expr, ExprKind } from './internal';


export type ExprClass<T extends Expr<any>> = { new(...args: any[]): T, id: ExprKind };

export type ExprValidator<T extends Expr<T>> = (value: T) => boolean;

export type TransformFactory<O, E extends any[]> = (value: Expr<any>, ...extra: E) => O;

export type TransformFunction<T extends Expr<any>, F extends TransformFactory<any, any>, E extends any[]> = (instance: T, factory: F, ...extra: E) => (F extends TransformFactory<infer O, E> ? O : never);


export class Transformer<T extends TransformFactory<any, E>, E extends any[] = []>
{

  public transform: T;

  public constructor(
    public transformers: Map<ExprKind, TransformFunction<any, T, E>> = new Map(),
    public validators: Map<ExprKind, ExprValidator<any>> = new Map(),
  ) {
    this.transform = ((value, ...extra) => 
    {
      const transformer = this.transformers.get(value.getKind());
      if (!transformer) {
        throw new Error(`Missing transformer for ${value}`);
      }
      
      return transformer(value, this.transform, ...extra);
    }) as T;
  } 

  public setTransformer<V extends Expr<any>>(construct: ExprClass<V>, transform: TransformFunction<V, T, E>): this 
  {
    this.transformers.set(construct.id, transform);

    return this;
  }

  public setValidator<V extends Expr<any>>(construct: ExprClass<V>, validator: ExprValidator<V>): this
  {
    this.validators.set(construct.id, validator);

    return this;
  }

  public extend(): Transformer<T, E> 
  {
    return new Transformer<T, E>(new Map(this.transformers), new Map(this.validators));
  }
  
}

