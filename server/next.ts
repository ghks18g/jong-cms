/**
 *  nextJs with Express
 * @author Shin_Jong_Hwan
 */
import * as url from "url";
import next from "next";
import createExpressApp from "./express";
import { CERT_PUBLIC, CERT_PRIVATE } from "../env.config";

const dev = process.env.NODE_ENV === "development";

/**
 *  Next.js SSR setting
 */
const app = next({ dev });
const handle = app.getRequestHandler();

const nextApp = async () => {
  await app.prepare();

  const expressApp = await createExpressApp();

  expressApp.all("*", async (req: any, res: any) => {
    const parsedUrl = url.parse(req.url, true);
    const referer = req?.headers?.referer || null;
    const hostname = req.get("host");

    // console.log("CERT_PUBLIC:", CERT_PUBLIC);
    // console.log("CERT_PRIVATE:", CERT_PRIVATE);
    // console.log("req:", req);
    // console.log("parsedUrl:", parsedUrl);
    // console.log("referer:", referer);
    // console.log("hostname:", hostname);

    return handle(req, res, parsedUrl);
  });
  // expressApp.get("*", async (req: any, res: any) => {
  //   const parsedUrl = url.parse(req.url, true);

  //   return handle(req, res, parsedUrl);
  // });

  return expressApp;
};

export default nextApp;
