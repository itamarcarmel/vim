import fastq from "fastq";
import type { done } from "fastq";
import { GenericSendResponse, ISMSClient, IEmailClient } from "./clients";
import _ from "lodash";
import { config } from "./config";

export type OnProcessDone = done<
  { notificationId: string } & GenericSendResponse
>;

const createProcessor = <T extends { notificationId: string }>(
  concurrency: number,
  send: (t: T) => Promise<GenericSendResponse>
) =>
  _.pick(
    fastq((task: T, cb: OnProcessDone) => {
      new Promise((resolve) => setTimeout(resolve, config.processors.delayInMs))
        .then(() => send(task))
        .catch((error) =>
          cb(null, {
            error: error?.message ?? JSON.stringify(error, null, 2),
            notificationId: task.notificationId,
          })
        )
        .then((res) => {
          if (!_.isObject(res)) {
            return;
          }

          if ("error" in res) {
            cb(new Error(res.error));
          } else {
            cb(null, { notificationId: task.notificationId, ...res });
          }
        });
    }, concurrency),
    ["push", "length"]
  );

const createSmsProcessor = (client: ISMSClient) =>
  createProcessor<{ notificationId: string; phone: string; message: string }>(
    config.processors.concurrencySms,
    ({ phone, message }) => client.sendSms(phone, message)
  );

const createEmailProcessor = (client: IEmailClient) =>
  createProcessor<{ notificationId: string; email: string; message: string }>(
    config.processors.concurrencyEmail,
    ({ email, message }) => client.sendEmail(email, message)
  );

export const createProcessors = (
  smsClient: ISMSClient,
  emailClient: IEmailClient
) => ({
  sms: createSmsProcessor(smsClient),
  email: createEmailProcessor(emailClient),
});

export type IProcessors = ReturnType<typeof createProcessors>;
