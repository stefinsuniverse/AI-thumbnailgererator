import { Request, Response, NextFunction } from "express";

const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { isLoggedIn, userId } = req.session;
  if (!isLoggedIn || !userId) {
    res.status(401).json({ message: 'You are not logged in' });
    return;
  }
  next();
};

export default protect;
