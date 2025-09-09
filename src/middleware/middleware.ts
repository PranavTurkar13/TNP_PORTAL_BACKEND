import express from "express";
import { auth } from "express-oauth2-jwt-bearer";

const app = express();

const checkJwt = auth({
  audience: "https://dev-rs2gfkdtzc6ktkip.us.auth0.com/api/v2/",   // set in Auth0 API settings
  issuerBaseURL: `https://YOUR_DOMAIN/`,
});

app.get("/profile", checkJwt, (req, res) => {
  res.json({
    message: "Welcome, authenticated student!",
  });
});

app.listen(4000, () => console.log("Server running on port 4000"));
