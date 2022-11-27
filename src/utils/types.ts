export type Nullable<T> = T | null;

export type NullableValue<T> = { [P in keyof T]: Nullable<T[P]> };

export type NullableBy<T, K extends keyof T> = Omit<T, K> & NullableValue<Pick<T, K>>;
