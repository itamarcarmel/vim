import { controllerDefaultParams, setupController } from "../src/utils";

let emailCounter = 0;
let smsCounter = 0;

const setupTestController = () => {
  const params: typeof controllerDefaultParams = {
    ...controllerDefaultParams,
    createNSGWFunc: () => ({
      sendEmail: async () => {
        ++emailCounter;
        return { status: "sent" };
      },
      sendSms: async () => {
        ++smsCounter;
        return { status: "sent" };
      },
    }),
  };

  return setupController(params);
};

const controller = setupTestController();

test("test controller", async () => {
  const addParams = {
    phone: "+1111111111",
    email: "1@gmail.com",
    preferences: {
      sms: true,
      email: false,
    },
  };
  const { userId } = controller.userPreferences.add(addParams);

  const userPrefs = controller.userPreferences.getById(userId);
  expect(userPrefs).toBeDefined();
  expect(userPrefs).toMatchObject(addParams);

  const { total, list } = controller.userPreferences.get(0, 10);
  expect(total).toEqual(1);
  expect(list).toHaveLength(1);
  expect(list[0]).toMatchObject(addParams);

  const updateRes = controller.userPreferences.updateById(userId, {
    email: "2@gmail.com",
    preferences: { email: true },
  });

  expect(updateRes).toBeTruthy();
  const userPrefsPostUpdate = controller.userPreferences.getById(userId);
  expect(userPrefsPostUpdate?.email).toEqual("2@gmail.com");
  expect(userPrefsPostUpdate?.preferences.email).toEqual(true);

  expect(smsCounter).toEqual(0);
  expect(emailCounter).toEqual(0);

  const { notificationId } = controller.notifications.sendToUser(
    userId,
    "hi there!"
  ) as { notificationId: string };

  const status = controller.notifications.getStatus(notificationId);
  expect(status).toMatchObject({
    notificationId,
    status: {
      email: "queued",
      sms: "queued",
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const statusAfterSecond = controller.notifications.getStatus(notificationId);
  expect(statusAfterSecond).toMatchObject({
    notificationId,
    status: {
      email: "sent",
      sms: "sent",
    },
  });

  expect(smsCounter).toEqual(1);
  expect(emailCounter).toEqual(1);
});
