import "express";

declare module "express-serve-static-core" {
  interface Request {
    oidc?: import("express-openid-connect").RequestContext;
  }
}
