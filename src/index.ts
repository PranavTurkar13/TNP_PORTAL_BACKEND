import express from "express";
import pkg from "express-openid-connect";
import "dotenv/config";
import db from "./client.js";
import cors from "cors";
import studentRouter from "./routes/student.routes.js";
import adminRouter from "./routes/admin.routes.js";

const { auth, requiresAuth } = pkg;

const app = express();

// ---------------- CORS ----------------
app.use((req, res, next) => {
  // Skip CORS for Auth0 callback
  if (req.path === "/callback") return next();

  const allowedOrigins = [
    "https://tnp-frontend-gold.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ];

  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    if (req.method === "OPTIONS") return res.sendStatus(204);
    return next();
  }

  console.warn("Blocked by CORS:", origin);
  return res.status(403).send("Not allowed by CORS");
});

// ---------------- Middleware ----------------
app.use(express.json());

// ---------------- Auth0 Config ----------------
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
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  routes: {
    callback: "/callback",
    postLogoutRedirect: "https://tnp-frontend-gold.vercel.app",
  },
  session: {
    cookie: {
      sameSite: "None",
      secure: true, // Must be true in production
    },
  },
};

app.use(auth(config));

// ---------------- Routes ----------------
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/admin", adminRouter);

// Root
app.get("/", (req, res) => {
  if (req.oidc?.isAuthenticated()) {
    return res.redirect("https://tnp-frontend-gold.vercel.app/success");
  }
  res.send("❌ Logged out");
});

// Profile route
app.get("/profile", requiresAuth(), async (req, res) => {
  try {
    const auth0Id = req.oidc?.user!.sub;

    const dbUser = await db.user.findUnique({
      where: { auth0Id },
    });

    if (!dbUser)
      return res.status(404).json({ message: "User not found in DB" });

    res.json(dbUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Access Denied
app.get("/access-denied", (req, res) => {
  res.send("Access Denied");
});

// ---------------- Server ----------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
