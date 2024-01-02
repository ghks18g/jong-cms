/**
 *  server entry point.
 * @author Shin_Jong_Hwan
 */

import dotenv from "dotenv";
dotenv.config();
import nextApp from "./next";
import { Express } from "express";

const PORT = process.env.PORT;
const PORTS = process.env.PORTS;

nextApp()
  .then((server: Express) => {
    server.listen(PORT, () => {
      console.log(`Server ready : http://localhost:${PORT}`);
    });
  })
  .catch((e: Error) => {
    console.error("server App Error : " + e);
  });
