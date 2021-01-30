import { ExprPredicateUnary } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprPredicateUnary, 
  (v, transform, compiler) => {
    const value = compiler.eval(v.value);

    return (state) => {
      const x = value.get(state);

      switch (v.type) {
        case 'FALSE':
          return !x;
        case 'TRUE':
          return !!x;
        case 'NOT NULL':
          return x !== null && x !== undefined;
        case 'NULL':
          return x === null || x === undefined;
      }
    };
  }
);