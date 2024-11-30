import _ from "lodash";
import {
  IDBConnection,
  NotificationMethods,
  NotificationRecord,
  UserPreferences,
} from "../mockDB";
import { IProcessors, OnProcessDone } from "../processors";
import * as uuid from "uuid";

const onProcessDone =
  (db: IDBConnection, method: NotificationMethods): OnProcessDone =>
  (_err, res) => {
    if (_.isNil(res)) {
      throw new Error("Empty response!");
    }

    const record = db.collections.notifications.get(res.notificationId);

    if (_.isNil(record)) {
      throw new Error("Notification id not found!");
    }

    const newRecord: typeof record = {
      ...record,
      status: {
        ...record.status,
        [method]: "error" in res ? res.error : res.status,
      },
    };

    db.collections.notifications.set(res.notificationId, newRecord);
  };

export const sendToUser =
  (db: IDBConnection, processors: IProcessors) =>
  (
    userId: string,
    message: string
  ):
    | {
        notificationId: string;
        pending: Partial<Record<NotificationMethods, number>>;
      }
    | { error: "user-not-found" | "no-registered-methods" } => {
    const userPrefs = db.collections.userPreferences.get(userId);
    if (_.isNil(userPrefs)) {
      return { error: "user-not-found" };
    }

    const methods = [
      ...(userPrefs.preferences.email ? ["email"] : []),
      ...(userPrefs.preferences.sms ? ["sms"] : []),
    ] as NotificationMethods[];

    if (_.isEmpty(methods)) {
      return { error: "no-registered-methods" };
    }

    const notificationId = uuid.v4();
    db.collections.notifications.set(notificationId, {
      notificationId,
      status: methods.reduce(
        (ret, method) => ((ret[method] = "queued"), ret),
        {} as NotificationRecord["status"]
      ),
    });

    const pending = methods.reduce((ret, method) => {
      switch (method) {
        case "email":
          processors.email.push(
            {
              email: userPrefs.email,
              message,
              notificationId,
            },
            onProcessDone(db, "email")
          );
          ret["email"] = processors.email.length();
          break;
        case "sms":
          processors.sms.push(
            {
              phone: userPrefs.phone,
              message,
              notificationId,
            },
            onProcessDone(db, "sms")
          );
          ret["sms"] = processors.sms.length();
          break;
      }

      return ret;
    }, {} as Partial<Record<NotificationMethods, number>>);

    return { notificationId, pending };
  };
