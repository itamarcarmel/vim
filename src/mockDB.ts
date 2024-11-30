export type ICollection<K, V> = Pick<Map<K, V>, "get" | "set"> & {
  getPage: (offset: number, limit: number) => V[];
  size: () => number;
};

export type NotificationMethods = "sms" | "email";

export type UserPreferences = {
  userId: string;
  email: string;
  phone: string;
  preferences: Partial<Record<NotificationMethods, boolean>>;
};

export type NotificationRecord = {
  notificationId: string;
  status: Partial<Record<NotificationMethods, string>>;
};

const wrap = <K, V>(map: Map<K, V>): ICollection<K, V> => ({
  get: (key) => map.get(key),
  set: (key, value) => map.set(key, value),
  size: () => map.size,
  getPage: (offset, limit) => [...map.values()].slice(offset, offset + limit),
});

export const createDBConnection = () => ({
  collections: {
    userPreferences: wrap(new Map<string, UserPreferences>()),
    notifications: wrap(new Map<string, NotificationRecord>()),
  },
});

export type IDBConnection = ReturnType<typeof createDBConnection>;
