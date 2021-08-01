import { addAggregate } from '../Aggregates';


addAggregate('cumulativeDistribution', (expr, [], compiler) => 
{
  return (state) => (state.result.partitionIndex - state.result.peerIndex + 1) / state.result.partitionSize;
});