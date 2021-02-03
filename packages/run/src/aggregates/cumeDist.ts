import { addAggregate } from '../Aggregates';


addAggregate('culmulativeDistribution', (expr, [], compiler) => 
{
  return (state) => (state.result.partitionIndex - state.result.peerIndex + 1) / state.result.partitionSize;
});