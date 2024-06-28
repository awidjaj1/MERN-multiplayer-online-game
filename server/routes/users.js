import express from "express";
import { verifyToken } from "../middleware/auth";
import { patchSettings } from "../controllers/users";
import { upload } from "../storage";

const usersRouter = express.Router();

usersRouter.patch("/:id/settings", verifyToken, upload.single("picture"), patchSettings);

export default usersRouter;
