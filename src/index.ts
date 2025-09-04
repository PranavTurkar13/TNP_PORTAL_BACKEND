import express from "express";
const app = express();
import { auth } from "express-openid-connect";
import "dotenv/config";

// import studentRouter from "./routes/student.routes.js";
import adminRouter from "./routes/admin.routes.js";

app.use(express.json());

if (
  !process.env.AUTH0_SECRET ||
  !process.env.AUTH0_CLIENT_ID ||
  !process.env.AUTH0_DOMAIN
) {
  throw new Error("Missing Auth0 environment variables. Please check .env");
}
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET, // store in .env
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
};
app.use(auth(config));

// app.use("/student", studentRouter);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  res.send(req.oidc?.isAuthenticated() ? "✅ Logged in" : "❌ Logged out");
});
app.get("/profile", (req, res) => {
  res.json(req.oidc?.user || {});
});

app.listen(3000, () => {
  console.log("Server running at local host 3000");
});
//
