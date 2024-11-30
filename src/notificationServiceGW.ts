import axios from "axios";
import { IEmailClient, ISMSClient } from "./clients";
import axiosRetry from "axios-retry";
import _ from "lodash";
import { config } from "./config";

export const createNSGW = (): ISMSClient & IEmailClient => {
  const client = axios.create({ baseURL: config.notificationService.baseURL });
  axiosRetry(client, {
    retryDelay: (retryCount) => {
      return retryCount * config.notificationService.delayFactor;
    },
    retries: config.notificationService.retries,
    retryCondition: (error) =>
      _.isNumber(error.status) &&
      config.notificationService.retryCodes.includes(error.status),
  });

  return {
    sendEmail: async (email, message) =>
      client.post("/send-email", { email, message }).then((res) => res?.data),
    sendSms: async (telephone, message) =>
      client.post("/send-sms", { telephone, message }).then((res) => res?.data),
  };
};
