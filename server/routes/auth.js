import express from "express";
import { upload } from "../storage";

const router = express.Router();
router.post("/login", login);
router.post("/register", register, upload.single("picture"));