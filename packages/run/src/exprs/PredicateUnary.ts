import { ExprPredicateUnary } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprPredicateUnary, 
  (v, transform) => {
    const value = transform(v.value);

    return (sources, params, state) => {
      const x = value(sources, params, state);

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