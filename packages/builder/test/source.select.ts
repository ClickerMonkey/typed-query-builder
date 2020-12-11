import { defineSource } from '../src/builder';


// tslint:disable: no-magic-numbers

const _Task = defineSource({
  name: 'Task',
  fields: {
    id: 'INT',
    name: ['VARCHAR', 120],
    done: 'BOOLEAN'
  }
});

const _all = _Task.all();
const _only0 = _Task.only('done', 'id');
const _only1 = _Task.only(['done', 'name']);
const _except0 = _Task.except('name');
const _except1 = _Task.except(['done']);
