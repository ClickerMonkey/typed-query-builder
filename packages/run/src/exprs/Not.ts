import { ExprNot } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprNot, 
  (v, transform, compiler) => {
    const value = compiler.eval(v.predicate);

    return (state) => !value.get(state);
  }
);