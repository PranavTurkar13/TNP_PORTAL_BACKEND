import type { Request, Response } from "express";
import db from "../../client.js";

//USER REGISTERATION
export const userRegister = async (req: Request, res: Response) => {
  try {
    const { email, auth0Id } = req.body;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already exists", user: existingUser });
    }

    const newUser = await db.user.create({
      data: { email, auth0Id },
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
