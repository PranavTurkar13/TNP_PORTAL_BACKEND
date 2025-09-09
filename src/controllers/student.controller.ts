import type { Request, Response } from "express";
import db from "../client.js"; 
export const registerStudent = async (req: Request, res: Response) => {
    try {
        const student = req.body;
        const response = await db.user.create({
            data: {
                email: student.email,
                phoneNo: student.phoneNo,
                role: student.role || 'STUDENT',
                student: {
                    create: {
                        firstName: student.firstName,
                        middleName: student.middleName,
                        lastName: student.lastName,
                        personalEmail: student.personalEmail,
                        phoneNo: student.phoneNo,
                        dob: student.dob ? new Date(student.dob) : null,
                        skills: student.skills || []
                    }
                }
            }
        });
        res.status(201).json({ message: "Student registered", student: response });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }                           
  };