import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';

// Controllers For User Registration
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    req.session.isLoggedIn = true;
    req.session.userId = newUser._id as string;
    res.json({
      message: 'Account created successfully',
      user: { _id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Controllers For User Login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password as string);
    if (!isPasswordCorrect) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }
    req.session.isLoggedIn = true;
    req.session.userId = user._id as string;
    res.json({
      message: 'Logged in successfully',
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Controllers For User Logout
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  req.session.destroy((err: any) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
      return;
    }
    res.json({ message: 'Logged out successfully' });
  });
};

// Controllers For User Verify
export const verifyUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.session;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'Invalid user' });
      return;
    }
    res.json({ user });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
