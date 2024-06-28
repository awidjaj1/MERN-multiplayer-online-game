import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { patchSettings } from "../controllers/users.js";
import { upload } from "../storage.js";

const usersRouter = express.Router();

usersRouter.patch("/:userId/settings", verifyToken, upload.single("picture"), patchSettings);

export default usersRouter;
