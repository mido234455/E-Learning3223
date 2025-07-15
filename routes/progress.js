import express from "express";
import {
  markLectureWatched,
  submitExam,
  getStudentCourseData,
} from "../controllers/studentProgress.controller.js";
import { isAuthenticated } from "../middlewares/isAuth.js";

const router = express.Router();

router.route("/lecture").post(isAuthenticated, markLectureWatched); // POST /api/progress/lecture
router.route("/exam").post(isAuthenticated, submitExam);            // POST /api/progress/exam
router.route("/:courseId").get(isAuthenticated, getStudentCourseData); // GET /api/progress/:courseId

export default router;
