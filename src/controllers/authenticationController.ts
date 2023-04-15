import { Request, Response } from 'express';
import userModel from '../models/userModel';

export const loginController = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const response = await userModel.authenticateUser(username, password);
    Promise.allSettled([
      userModel.insertSession(req.session.id, username, '74.125.127.100'),
      userModel.addActivity(username, 'You Logged In.'),
    ]);
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
export const findOrCreateController = async function verify(
  _accessToken: string,
  _refreshToken: string,
  profile: any,
  cb: any
) {
  try {
    const profile_result = await userModel.findOrCreate(profile);
    return cb(null, profile_result);
  } catch (err) {
    return cb(err, null);
  }
};
export const providerLoginController = async function (
  req: Request,
  res: Response
) {
  const user = req.user as any;
  if (!user) throw new Error('User Not Found');
  Promise.all([
    userModel.insertSession(req.session.id, user.username, '74.125.127.100'),
    userModel.addActivity(
      user.username,
      `You Logged In Using ${user.provider}`
    ),
  ]);
  res.json(user);
};
