import { isFunction } from './fns';


export type TraverseStep = string | number;

export type TraverseCallback<T, R> = (value: T, stack: T[], path: TraverseStep[], traverser: Traverser<T, R>) => any;

export type TraverseRemove = () => void;

export const TraverseRemoveNoop: TraverseRemove = () => {};

export type TraverseReplace<T> = (replaceWith: T) => void;

export const TraverseReplaceNoop: TraverseReplace<any> = () => {};

export interface Traversable<T>
{
  traverse<R>(traverse: Traverser<T, R>): R;
}

export interface TraverseResult<T>
{
  value: T;
  stack: T[];
  path: TraverseStep[];
}

export class Traverser<T, R = any>
{

  public static isTraversable<T>(x: any): x is Traversable<T>
  {
    return x && isFunction(x.traverse);
  }

  public callback: TraverseCallback<T, R>;
  public stack: T[];
  public path: TraverseStep[];
  public result: R;
  public stopped: boolean;
  public remove: TraverseRemove = TraverseRemoveNoop;
  public replace: TraverseReplace<T> = TraverseReplaceNoop;

  public constructor(callback: TraverseCallback<T, R>, initialResult: R)
  {
    this.callback = callback;
    this.stack = [];
    this.path = [];
    this.stopped = false;
    this.result = initialResult;
  }

  public enter(value: T, getInner?: () => any): R
  {
    if (this.stopped)
    {
      return this.result;
    }
    
    this.callback(value, this.stack, this.path, this);

    this.remove = TraverseRemoveNoop;
    this.replace = TraverseReplaceNoop;

    if (getInner && !this.stopped)
    {
      this.stack.push(value);

      getInner();

      this.stack.pop();
    }

    return this.result;
  }

  public step(step: TraverseStep, getStep: Traversable<T> | (() => any), replace: TraverseReplace<T> = TraverseReplaceNoop, remove: TraverseRemove = TraverseRemoveNoop): this
  {
    if (this.stopped)
    {
      return this;
    }

    this.path.push(step);

    this.remove = remove;
    this.replace = replace;

    if (Traverser.isTraversable<T>(getStep))
    {
      getStep.traverse(this);
    }
    else
    {
      getStep();
    }

    this.path.pop();

    return this;
  }

  public modify(getResult: (result: R) => R | undefined): this
  {
    const newResult = getResult(this.result);

    if (newResult !== undefined)
    {
      this.result = newResult;
    }

    return this;
  }

  public stop(result?: R): this
  {
    if (result !== undefined)
    {
      this.result = result;
    }

    return this;
  }

  public getResult(): R
  {
    return this.result;
  }

  public removeOrReplace(replaceWith: T | (() => T)): boolean
  {
    const remove = this.canRemove();
    const replace = this.canReplace();

    if (!remove && !replace) {
      return false;
    }

    remove
      ? this.remove()
      : this.replace(isFunction(replaceWith) ? replaceWith() : replaceWith);

    return true;
  }

  public canRemove(): boolean
  {
    return this.remove !== TraverseRemoveNoop;
  }

  public canReplace(): boolean
  {
    return this.replace !== TraverseReplaceNoop;
  }

  public filterClass(construct: { new (...args: any[]): T }, initialResult: R = this.result): Traverser<T, R>
  {
    return this.filter((value: T) => (value as any).constructor === construct, initialResult);
  }

  public filter(pass: (value: T, stack: T[], path: TraverseStep[]) => any, initialResult: R = this.result)
  {
    const callback: TraverseCallback<T, R> = (value, stack, path, traverser) => {
      if (pass(value, stack, path)) {
        this.callback(value, stack, path, traverser);
      }
    };

    return new Traverser<T, R>(callback, initialResult);
  }

  public static list<T>(): Traverser<T, TraverseResult<T>[]>
  {
    const list: TraverseResult<T>[] = [];

    return new Traverser((value, stack, path) => {
      list.push({
        value,
        stack: stack.slice(),
        path: path.slice(),
      });
    }, list);
  }

  public static count<T>(): Traverser<T, number>
  {
    return new Traverser((value, stack, path, traverser) => traverser.result++, 0);
  }

  public static some<T>(condition: (value: T) => boolean): Traverser<T, boolean>
  {
    return new Traverser<T, boolean>((value, stack, path, traverser) => {
      if (condition(value)) {
        traverser.stop(true);
      }
    }, false);
  }

  public static someInstance<T>(construct: { new(...args: any[]): T }): Traverser<T, boolean>
  {
    return new Traverser<T, boolean>((value, stack, path, traverser) => {
      if ((value as any).constructor === construct) {
        traverser.stop(true);
      }
    }, false);
  }

  public static find<T>(condition: (value: T) => boolean): Traverser<T, T | null>
  {
    return new Traverser<T, T | null>((value, stack, path, traverser) => {
      if (condition(value)) {
        traverser.stop(value);
      }
    }, null);
  }

}