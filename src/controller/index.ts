import { IDBConnection, NotificationRecord, UserPreferences } from "../mockDB";
import * as uuid from "uuid";
import { IProcessors } from "../processors";
import _ from "lodash";
import { sendToUser } from "./sendToUser";

type AddUserPreferencesParams = Omit<UserPreferences, "userId">;

type UpdateUserPreferencesParams = Partial<Omit<UserPreferences, "userId">>;

export const createController = (
  db: IDBConnection,
  processors: IProcessors
) => ({
  userPreferences: {
    add: (params: AddUserPreferencesParams): { userId: string } => {
      const userId = uuid.v4();
      db.collections.userPreferences.set(userId, { userId, ...params });
      return { userId };
    },
    getById: (userId: string): UserPreferences | undefined =>
      db.collections.userPreferences.get(userId),
    get: (
      offset: number,
      limit: number
    ): { total: number; list: UserPreferences[] } => {
      const collection = db.collections.userPreferences;
      const list = collection.getPage(offset, limit);
      const total = collection.size();
      return { total, list };
    },
    updateById: (userId: string, params: UpdateUserPreferencesParams) => {
      const collection = db.collections.userPreferences;
      const userPrefs = collection.get(userId);
      if (_.isNil(userPrefs)) {
        return false;
      }

      const newPrefs = { ...userPrefs };
      _.merge(newPrefs, params);

      collection.set(userId, newPrefs);

      return true;
    },
  },
  notifications: {
    sendToUser: sendToUser(db, processors),
    getStatus: (notificationId: string): NotificationRecord | undefined =>
      db.collections.notifications.get(notificationId),
  },
});

export type IController = ReturnType<typeof createController>;
