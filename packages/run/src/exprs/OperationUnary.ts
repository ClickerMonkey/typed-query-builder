import { ExprOperationUnary } from '@typed-query-builder/builder/src/internal';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprOperationUnary, 
  (v, transform, compiler) => {
    const value = compiler.eval(v.value);

    return (state) => {
      const a = value.get(state);

      if (a === undefined) {
        return undefined;
      }

      switch (v.type) {
        case '-': return -a;
        case 'BITNOT': return ~a;
      }
    }
  }
);