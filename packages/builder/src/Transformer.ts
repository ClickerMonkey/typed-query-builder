import { Expr } from './exprs/Expr';


export type ExprClass<T extends Expr<any>> = { new(...args: any[]): T, id: string };

export type ExprValidator<T extends Expr<T>> = (value: T) => boolean;

export type TransformFactory<O> = (value: Expr<any>) => O;

export type TransformFunction<T extends Expr<any>, F extends TransformFactory<any>> = (instance: T, factory: F) => (F extends TransformFactory<infer O> ? O : never);


export class Transformer<T extends TransformFactory<any>> 
{

  public transform: T;

  public constructor(
    public transformers: Map<ExprClass<any>, TransformFunction<any, T>> = new Map(),
    public validators: Map<ExprClass<any>, ExprValidator<any>> = new Map(),
  ) {
    this.transform = ((value) => 
    {
      const transformer = this.transformers.get((value as any).constructor);
      if (!transformer) {
        throw new Error(`Missing transformer for ${value}`);
      }
      
      return transformer(value, this.transform);
    }) as T;
  } 

  public setTransformer<V extends Expr<any>>(construct: ExprClass<V>, transform: TransformFunction<V, T>): this 
  {
    this.transformers.set(construct, transform);

    return this;
  }

  public setValidator<V extends Expr<any>>(construct: ExprClass<V>, validator: ExprValidator<V>): this
  {
    this.validators.set(construct, validator);

    return this;
  }

  public extend(): Transformer<T> 
  {
    return new Transformer<T>(new Map(this.transformers), new Map(this.validators));
  }
  
}

