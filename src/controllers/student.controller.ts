import type { Request, Response } from "express";
import db from "../client.js"; 
export const registerStudent = async (req: Request, res: Response) => {
    try {
        const student = req.body;
        
        res.status(201).json({ message: "Student registered", student });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }                           
  };