// routes/examRoutes.js
import express from "express";
import {
  addExam,
  getExamsByCourse,
  getSingleExam,
} from "../controllers/examController.js";
import { isAuthenticated, authorizeAdmin } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/add", isAuthenticated, authorizeAdmin, addExam);
router.get("/course/:courseId", isAuthenticated, getExamsByCourse);
router.get("/:id", isAuthenticated, getSingleExam);

export default router;
