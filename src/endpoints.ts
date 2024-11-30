import express from "express";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import { IController } from "./controller";

type Request<T> = express.Request<any, any, T>;

const prefixes = {
  userPreferences: "/userPreferences",
  notifications: "/notifications",
};

type UserPreferences = {
  email: string;
  phone: string;
  preferences: { email: boolean; sms: boolean };
};

export const registerEndpoints = (
  app: express.Express,
  controller: IController
) => {
  app.post(prefixes.userPreferences, (req: Request<UserPreferences>, res) => {
    const { userId } = controller.userPreferences.add(req.body);
    res.status(StatusCodes.OK).json({ userId });
  });

  app.get(prefixes.userPreferences, (req, res) => {
    const { offset, limit } = req.query;
    const nOffset = Math.max(Math.min(_.toNumber(offset ?? 0), 99999), 0);
    const nLimit = Math.max(Math.min(_.toNumber(limit ?? 100), 100), 1);
    const { list, total } = controller.userPreferences.get(nOffset, nLimit);

    res.status(StatusCodes.OK).json({
      _metadata: { total, offset: nOffset, limit: nLimit },
      userPreferences: list,
    });
  });

  app.get(`${prefixes.userPreferences}/:id`, (req, res) => {
    const { id } = req.params;
    if (_.isEmpty(id)) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
      return;
    }

    const userPreferences = controller.userPreferences.getById(id);
    if (_.isNil(userPreferences)) {
      res.status(StatusCodes.NOT_FOUND);
      return;
    }

    res.status(StatusCodes.OK).json(userPreferences);
  });

  app.put(
    `${prefixes.userPreferences}/:id`,
    (req: Request<UserPreferences>, res) => {
      const { id } = req.params;
      const ret = controller.userPreferences.updateById(id, req.body);

      res.sendStatus(ret ? StatusCodes.OK : StatusCodes.NOT_FOUND);
    }
  );

  app.post(
    prefixes.notifications,
    (req: Request<{ userId: string; message: string }>, res) => {
      const { userId, message } = req.body;
      const ret = controller.notifications.sendToUser(userId, message);
      if ("error" in ret) {
        switch (ret.error) {
          case "no-registered-methods":
            res
              .status(StatusCodes.FORBIDDEN)
              .json({ message: "User has no registered notification methods" });
            break;
          case "user-not-found":
            res
              .status(StatusCodes.NOT_FOUND)
              .json({ message: "User not found" });
        }
        return;
      }

      res.status(StatusCodes.OK).json(ret);
    }
  );

  app.get(`${prefixes.notifications}/:id`, (req, res) => {
    const { id } = req.params;
    const status = controller.notifications.getStatus(id);
    if (_.isNil(status)) {
      res.sendStatus(StatusCodes.NOT_FOUND);
      return;
    }

    res.status(StatusCodes.OK).json(status);
  });
};
