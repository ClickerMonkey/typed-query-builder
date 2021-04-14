import { Select, values, NamedSource } from '../src';
import { expectTypeMatch } from './helper';


// tslint:disable: no-magic-numbers

describe('Values', () => {

  interface TaskInterface {
    name: string;
    done: boolean;
  }

  it('check type', () => {
    
    const tasks = values([] as TaskInterface[], ['name', 'done']).as('tasks');
    
    expectTypeMatch<typeof tasks, NamedSource<"tasks", [Select<"name", string>, Select<"done", boolean>]>>(true);
  });

});