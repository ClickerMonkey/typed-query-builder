import { QueryJson } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';



RunTransformers.setTransformer(
  QueryJson, 
  (v, transform, compiler, tuples) => transform(v.json, compiler, tuples),
);