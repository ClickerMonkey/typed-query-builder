import { ExprNull } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  ExprNull, 
  () => () => undefined,
);