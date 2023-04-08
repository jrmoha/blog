import userModel from '../models/userModel';
import { Request, Response } from 'express';
import User from '../types/user_type';

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const username: string = req.body.username;
    const updates: Partial<Omit<User, 'username'>> = req.body.updates;
    const result = await userModel.updateUser(username, updates);
    res.status(200).send(result);
  } catch (error: any) {
    res.json({ message: error.message, status: error.status });
  }
};

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    const username: string = req.body.username;
    const old_password: string = req.body.old_password;
    const new_password: string = req.body.new_password;
    const result: boolean = await userModel.changePassword(
      username,
      old_password,
      new_password
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.json({ message: error.message, status: error.status });
  }
};

