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

const refresh_token_expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;
const access_token_expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN;
const id_token_expiresIn = process.env.ID_TOKEN_EXPIRES_IN;
const issuer = "http://localhost:8080";

module.exports = {
  PORT: process.env.PORT || 8080,
  DEV: isDev,
  CERT_PUBLIC: certs.PUBLIC,
  CERT_PRIVATE: certs.PRIVATE,
  refresh_token_expiresIn: Number(refresh_token_expiresIn),
  access_token_expiresIn: Number(access_token_expiresIn),
  id_token_expiresIn: Number(id_token_expiresIn),
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
