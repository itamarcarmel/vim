import express from "express";
import bodyParser from "body-parser";
import { createController } from "./controller";
import _ from "lodash";
import { createDBConnection } from "./mockDB";
import { registerEndpoints } from "./endpoints";
import { createNSGW } from "./notificationServiceGW";
import { createProcessors } from "./processors";
import { config } from "./config";

const PORT = config.port;

export const controllerDefaultParams = {
  createDBConnectionFunc: createDBConnection,
  createNSGWFunc: createNSGW,
  createProcessorsFunc: createProcessors,
  createControllerFunc: createController,
};

export const setupController = (
  params: typeof controllerDefaultParams = controllerDefaultParams
) => {
  const db = params.createDBConnectionFunc();
  const nsgw = params.createNSGWFunc();
  const processors = params.createProcessorsFunc(nsgw, nsgw);
  const controller = params.createControllerFunc(db, processors);
  return controller;
};
