require("dotenv").config();

let certs = null;
try {
  certs = require("./config/certs.config");
} catch (e) {
  throw new Error(
    "Please generate config/certs.config.js file using `npm run certs`"
  );
}

let dbconfig = {};
try {
  dbconfig = require("./config/db.config");
} catch (e) {}

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

if (isTest) {
  dbconfig = {
    // dropSchema: true,
    logging: false,
  };
}

const expiresIn = 7200;
const issuer = "jonghwan";

module.exports = {
  PORT: process.env.PORT || 8080,
  DEV: isDev,
  CERT_PUBLIC: certs.PUBLIC,
  CERT_PRIVATE: certs.PRIVATE,
  expiresIn: expiresIn,
  issuer: issuer,
  DATABASE: {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ...dbconfig,
  },
};
