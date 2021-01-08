import { Expr, ExprExists } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprExists, 
  (v, transform) => {
    const sub = transform(v.value as Expr<1 | null>);

    return (sources, params, state) => !sub(sources, params, state) === v.not;
  }
);