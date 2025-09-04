import type { Request, Response } from "express";

exports.registerStudent = async (req: Request, res: Response) => {
  try {
    const student = await req.body;
    res.status(201).json({ message: "Student registered", student });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
