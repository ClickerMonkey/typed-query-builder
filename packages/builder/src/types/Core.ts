
/**
 * Returns the result of { ...A, ...B }
 */
export type MergeObjects<A, B> = {
  [K in keyof B]: undefined extends B[K]
    ? K extends keyof A
      ? Exclude<B[K], undefined> | A[K]
      : B[K]
    : B[K]
} & {
  [K in keyof A]: K extends keyof B
    ? undefined extends B[K]
      ? Exclude<B[K], undefined> | A[K]
      : B[K]
    : A[K]
};

/**
 * Returns which keys of T can be undefined.
 */
export type UndefinedKeys<T> = { 
  [P in keyof T]-?: undefined extends T[P] ? P : never 
}[keyof T];

/**
 * Converts { x: number | undefined } to { x?: number | undefined }
 * 
 * This works for simple input, but complex types even when sent to Simplify<> does not produce the correct output.
 */
export type UndefinedToOptional<T> = 
  Simplify<
    Pick<T, Exclude<keyof T, UndefinedKeys<T>>> &
    Partial<Pick<T, UndefinedKeys<T>>>
  >
;

export type IsNever<T, Y = true, N = false> = [T] extends [never] ? Y : N;

export type StripNever<T> = Pick<T, { [K in keyof T]: IsNever<T[K], never, K> }[keyof T]>;

export type Extends<A, B, Y = true, N = false> = 
  [A] extends [B]
    ? [B] extends [A]
      ? Y
      : N
    : N
;

export type Simplify<T> = 
  T extends object
    ? { [K in keyof T]: T[K] }
    : T
;

export type UnionToIntersection<T> = 
  (T extends any ? (x: T) => any : never) extends 
  (x: infer R) => any ? R : never
;

export type UnionToTuple<T> = (
(
  (
    T extends any
      ? (t: T) => T
      : never
  ) extends infer U
    ? (U extends any
      ? (u: U) => any
      : never
    ) extends (v: infer V) => any
      ? V
      : never
    : never
) extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : []
);

export type ObjectKeys<T> = 
  UnionToTuple<keyof T> extends Array<keyof T>
    ? UnionToTuple<keyof T> 
    : never
;

export type Cast<T, AS> = 
  T extends AS ? T : never
;

export type PartialChildren<T> = {
  [K in keyof T]: Partial<T[K]>
};

export type NoDistribute<T> = 
  [T] extends [T] ? T : never
;

export type TextModify<N extends string, T extends TextModifyType> =
  T extends 'CAPITAL'
    ? Capitalize<N>
    : T extends 'UNCAPITAL'
      ? Uncapitalize<N>
      : T extends 'LOWER'
        ? Lowercase<N>
        : T extends 'UPPER'
          ? Uppercase<N>
          : N
;

export type TextModifyType = 'CAPITAL' | 'UNCAPITAL' | 'LOWER' | 'UPPER' | 'NONE';