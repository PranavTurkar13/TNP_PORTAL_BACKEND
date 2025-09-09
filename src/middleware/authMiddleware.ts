// import express from "express";
// const app = express();
// import { auth } from "express-openid-connect";
// import { prisma } from "./prisma/client";

// app.use(
//   auth({
//     authRequired: false,
//     auth0Logout: true,
//     baseURL: process.env.BASE_URL,
//     clientID: process.env.AUTH0_CLIENT_ID,
//     issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
//     secret: process.env.AUTH0_SECRET,
//   })
// );

// app.use(async (req, res, next) => {
//   try {
//     if (req.oidc?.isAuthenticated() && req.oidc?.user) {
//       const { sub: auth0Id, email, phone_number } = req.oidc.user;

//       let user = await prisma.user.findUnique({
//         where: { auth0Id },
//       });

//       if (!user) {
//         user = await prisma.user.create({
//           data: {
//             auth0Id,
//             email: email ?? "",
//             phoneNo: phone_number ?? "",
//             role: "STUDENT",
//             student: {
//               create: { firstName: "", lastName: "" }, // placeholder, update later
//             },
//           },
//         });
//         console.log("✅ New student registered:", email);
//       }
//     }
//     next();
//   } catch (err) {
//     console.error("❌ Auth middleware error:", err);
//     next(err);
//   }
// });
