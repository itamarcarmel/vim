import express from "express";
import bodyParser from "body-parser";
import _ from "lodash";
import { registerEndpoints } from "./endpoints";
import { config } from "./config";
import { setupController } from "./utils";

const PORT = config.port;

const main = async () => {
  const app = express();
  app.use(bodyParser.json());

  const controller = setupController();
  registerEndpoints(app, controller);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

main();
