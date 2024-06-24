import express from "express";
import { upload } from "../storage.js";
import { login, register } from "../controllers/auth.js";

const authRouter = express.Router();
authRouter.post("/login", login);
authRouter.post("/register", upload.single("picture"), register);

export default authRouter;