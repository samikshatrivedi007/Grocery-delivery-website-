import {Request,Response} from "express";
import User from "../models/user";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const JWT_SECRET =process.env.JWT_SECRET as string;

export const register =async(req:Request, res:Response)=> {
    try {
        const {name, email, password, phone, role} = req.body;
        //check user exist
        const exitngUser = await User.findOne({email: email});
        if (exitngUser)
            return res.status(401).json({message: "User already exists"});
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({name, email, password: hashedPassword});
        const token = jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: '7d'});
        res.status(201).json({message: "User registered", token, user});

    } catch (err:any) {
        res.status(500).json({message: "registeration failed", error: err.message});
    }
};
export const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if (!user) return res.status(401).json({messsage: 'Invalid credentials'});
        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) return res.status(401).json({messsage: 'Invalid credentials'})

        const token = jwt.sign({id: user._id}, JWT_SECRET, {expiresIn: '7d'});
        res.status(201).json({message: "User login successful", token, user});
    } catch (err: any) {
        res.status(500).json({message: 'Login failed', error: err.message});
    }

};
