import { ExprDefault } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprDefault, 
  (v) => () => undefined,
);