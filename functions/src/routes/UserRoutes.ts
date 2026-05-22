import express from "express";
import { getThumbnailById, getUserThumbnails } from "../controllers/UserControllers";

const UserRouter = express.Router();

UserRouter.get('/thumbnails', getUserThumbnails);
UserRouter.get('/thumbnails/:id', getThumbnailById);

export default UserRouter;
