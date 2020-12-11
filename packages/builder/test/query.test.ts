/*
import { QuerySelect } from './query';
import { QueryTransformerRuntime } from './query.runtime';


interface Task {
  id: number;
  name: string;
  done: boolean;
  doneAt?: Date;
}
interface TaskAssignment {
  id: number;
  taskId: number;
  assignee: string;
}

const q0 = QuerySelect.create()
  .from<Task, 'task'>('task')
  .join<TaskAssignment, 'assignment'>('INNER', 'assignment')
  .on(({ field }) => field('task', 'id').is('=', field('assignment', 'taskId')))
  .where(({ field }) => field('task', 'done').is('=', true))
  .count();

const q1 = QuerySelect.create<{ task: Task, assign: TaskAssignment }>();

const q2 = q1
  .from('task')
  .join('INNER', 'assign')
    .on(({ field }) => 
      field('task', 'id').is('=', field('assign', 'taskId'))
    )
  .select('taskName', ({ field }) => field('task', 'name'))
  .select(({ field, or }) => ({
    done: field('task', 'done'),
    status: field('task', 'done').when(true, 'DONE').else('NOT DONE'),
    isActive: or(
      field('task', 'doneAt').is('NULL'),
      field('task', 'doneAt').between(new Date(), new Date()),
    ),
  }))
  .where(({ field }) =>
    field('task', 'done')
  )
;

const q3 = q1.list(({ field }) => field('task', 'name'));
const q4 = q1.select('task', ['done', 'doneAt']);
const q5 = q2.list('taskName');


const DB: {
  task: Task[],
  assignment: TaskAssignment[],
} = {
  task: [
    { id: 0, name: 't0', done: false },
    { id: 1, name: 't2', done: true },
    { id: 2, name: 't3', done: false },
    { id: 3, name: 't4', done: true },
    { id: 5, name: 't5', done: true },
  ],
  assignment: [
    { id: 0, taskId: 0, assignee: 'a0' },
    { id: 1, taskId: 1, assignee: 'a1' },
    { id: 2, taskId: 1, assignee: 'a2' },
    { id: 3, taskId: 2, assignee: 'a3' },
  ],
};

window.console.log(QueryTransformerRuntime.transform(q1)(DB));
window.console.log(QueryTransformerRuntime.transform(q2)(DB));
window.console.log(QueryTransformerRuntime.transform(q3)(DB));
window.console.log(QueryTransformerRuntime.transform(q4)(DB));
window.console.log(QueryTransformerRuntime.transform(q5)(DB));

*/