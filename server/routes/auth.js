import express from "express";
import { upload } from "../storage";

const router = express.Router();
router.post("/login", login);
router.post("/register", upload.single("picture"), register);