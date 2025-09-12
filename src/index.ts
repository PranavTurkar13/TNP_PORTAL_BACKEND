import express from "express";
const app = express();
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;
import "dotenv/config";
import db from "./client.js";

import studentRouter from "./routes/student.routes.js";
import adminRouter from "./routes/admin.routes.js";

app.use(express.json());

// Auth0 configuration
if (
  !process.env.AUTH0_SECRET ||
  !process.env.AUTH0_CLIENT_ID ||
  !process.env.AUTH0_DOMAIN ||
  !process.env.BASE_URL
) {
  throw new Error("Missing Auth0 environment variables. Please check .env");
}
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET, // store in .env
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
};
app.use(auth(config));

// Routes
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/admin", adminRouter);

app.get("/", (req, res) => {
  if (req.oidc?.isAuthenticated()) {
    return res.redirect("/profile");
  }
  res.send("❌ Logged out");
});

app.get("/profile", requiresAuth(), async (req, res) => {
  try {
    const user = req.oidc?.user!;

    const dbUser = await db.user.findUnique({
      where: { auth0Id: user.sub },
    });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found in DB" });
    }

    res.json(dbUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running at local host 3000");
});
//
