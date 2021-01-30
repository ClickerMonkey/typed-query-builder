import { Expr, ExprExists } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprExists, 
  (v, transform, compiler) => {
    const sub = compiler.eval(v.value as Expr<1 | null>);

    return (state) => !sub.get(state) === v.not;
  }
);