import { ExprField } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';



RunTransformers.setTransformer(
  ExprField, 
  (v) => (state) => {
    const result = state.row[v.source.getName()]?.[v.alias as string];

    return result === null ? undefined : result;
  }
);