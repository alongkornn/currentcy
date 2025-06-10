import { Request, Response } from "express";
import { createUser, getAllUser, User } from "../models/user.model";
import bcrypt from "bcrypt";

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body
    
        // validate input
        if (!name || !email || !password) {
            res.status(400).json({ "error": "Name, email and password are required" });
            return
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        const userData = {
            name,
            email,
            password: hashedPassword
        };

        // Create user
        const result = await createUser(userData);
        const { password: _, ...userResponse } = result;
        res.status(201).json({
            message: "User created successfully",
            user: userResponse
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
    
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const users: User[] = await getAllUser();
        res.status(200).json({"message": "Fetch users Successfully", "data": users})
    } catch (error) {
       console.error("Error creating user:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
}