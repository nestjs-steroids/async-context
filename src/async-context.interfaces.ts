export type AsyncStorageMap = Map<number, unknown>;

export type AsyncContextStorageData = Record<string, unknown>;

export type KeyOfMap<M extends AsyncStorageMap> = M extends Map<
  infer K,
  unknown
>
  ? K
  : never;
