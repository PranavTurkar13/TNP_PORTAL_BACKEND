import express from "express";
const app = express();
import pkg from "express-openid-connect";
const { auth, requiresAuth } = pkg;
import "dotenv/config";
import db from "./client.js";
import cors from "cors";

const allowedOrigins = [
  "https://tnp-frontend-gold.vercel.app",
  "https://dev-1psrprtos7q8dhp6.us.auth0.com/*",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use((req, res, next) => {
  // Skip CORS for Auth0 callback
  if (req.path.startsWith("/callback")) return next();

  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (server-to-server requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
    exposedHeaders: ["Set-Cookie"],
  })(req, res, next);
});

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
    return res.redirect("https://tnp-frontend-gold.vercel.app/success");
  }
  res.send("❌ Logged out");
});

app.get("/profile", requiresAuth(), async (req, res) => {
  try {
    const user = req.oidc?.user!.sub;

    const dbUser = await db.user.findUnique({
      where: { auth0Id: user },
    });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found in DB" });
    }

    res.json(dbUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/access-denied", (req, res) => {
  res.send("Access Denied");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
