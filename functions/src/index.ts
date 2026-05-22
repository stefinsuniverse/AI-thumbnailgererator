import * as functionsV1 from 'firebase-functions/v1';
import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import connectDB from './config/db';
import AuthRouter from './routes/AuthRoutes';
import ThumbnailRouter from './routes/ThumbnailRoutes';
import UserRouter from './routes/UserRoutes';

declare module 'express-session' {
  interface SessionData {
    isLoggedIn: boolean;
    userId: string;
  }
}

const app = express();

// CORS - allow Firebase Hosting domain + localhost for dev
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'https://ai-thumbnail-generator-stefin.web.app',
      'https://ai-thumbnail-generator-stefin.firebaseapp.com',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Initialise DB and session lazily so the cold-start is faster
let dbReady = false;
app.use(async (req, _res, next) => {
  if (!dbReady) {
    await connectDB();
    dbReady = true;
  }
  next();
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI as string,
    collectionName: 'sessions',
  }),
});

app.use(sessionMiddleware);

app.get('/', (_req: Request, res: Response) => {
  res.send('Thumblify API is Live!');
});

app.use('/api/auth', AuthRouter);
app.use('/api/thumbnail', ThumbnailRouter);
app.use('/api/user', UserRouter);

// Export as Firebase Cloud Function (v1)
export const api = functionsV1
  .runWith({ timeoutSeconds: 120, memory: '512MB' })
  .https.onRequest(app);
