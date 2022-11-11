export type WithPropsOf<T> = {
  [Property in keyof T]: any
}
