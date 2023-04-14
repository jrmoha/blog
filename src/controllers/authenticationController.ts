import { Request, Response } from 'express';
import userModel from '../models/userModel';
export const loginController = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const response = await userModel.authenticateUser(username, password);
    userModel.addActivity(username, 'You Logged In');
    res.json(response);
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};

export const registerController = async (req: Request, res: Response) => {
  try {
    const { username, password, email, first_name, last_name, birth_date } =
      req.body;
    const response = await userModel.registerUser(
      username,
      password,
      email,
      first_name,
      last_name,
      birth_date
    );
    Promise.allSettled([
      userModel.addActivity(username, 'You Created This Account.'),
      userModel.initOptions(username),
    ]);
    res.json(response);
  } catch (err: any) {
    res.json({ message: err.message, status: err.status });
  }
};
