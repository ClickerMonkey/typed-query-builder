import { ExprOperationUnary } from '@typed-query-builder/builder/src/internal';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprOperationUnary, 
  (v, transform) => {
    const value = transform(v.value);

    return (sources, params, state) => {
      const a = value(sources, params, state);

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