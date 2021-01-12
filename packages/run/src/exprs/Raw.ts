import { ExprRaw } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprRaw, 
  (v, transform) => () => v.expr,
);