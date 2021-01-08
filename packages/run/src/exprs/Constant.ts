import { ExprConstant } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprConstant, 
  (v) => () => v.value === null ? undefined : v.value
);