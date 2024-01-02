require("dotenv").config();

const NEXT_PUBLIC_ORIGIN = process.env.NEXT_PUBLIC_ORIGIN;
const OAUTH_GOOGLE_CLIENT_ID = process.env.OAUTH_GOOGLE_CLIENT_ID;
const OAUTH_GOOGLE_CLIENT_SECRET = process.env.OAUTH_GOOGLE_CLIENT_SECRET;
const OAUTH_GOOGLE_REDIRECT_URI = process.env.OAUTH_GOOGLE_REDIRECT_URI;
export default class OAuthGoogleService {
  private static instance: OAuthGoogleService;

  private constructor() {}

  public static getInstance() {
    if (!OAuthGoogleService.instance) {
      OAuthGoogleService.instance = new OAuthGoogleService();
    }

    return OAuthGoogleService.instance;
  }

  async getToken(code: string) {
    const formBody = new URLSearchParams({
      code: code,
      client_id: OAUTH_GOOGLE_CLIENT_ID,
      client_secret: OAUTH_GOOGLE_CLIENT_SECRET,
      redirect_uri: OAUTH_GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }).toString();
    const tokenRes = await fetch(`https://www.googleapis.com/oauth2/v4/token`, {
      method: "POST",
      headers: {
        origin: NEXT_PUBLIC_ORIGIN,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const tokenData = await tokenRes.json();
    console.log("OAuthGoogle.tokenData", tokenData);
    return tokenData;
  }

  async getUser(accessToken) {
    const url = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`;
    const init = {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    const res = await fetch(url, init);
    const data = await res.json();

    const id = data.id;
    const email = data.email || id + "@google";
    const picture = data.picture;
    const name = data.name;

    if (!id || !email) {
      throw new Error("Invalid google access token.");
    }

    return { id, email, picture, name };
  }
}
