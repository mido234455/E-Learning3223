import express from "express";
import {
  getAllCourses,
  getSingleCourse,
  fetchLectures,
  fetchLecture,
  getMyCourses,
  checkout,
  paymentVerification,
} from "../controllers/course.js";
import { isAuthenticated } from "../middlewares/isAuth.js";

const router = express.Router();

// Public Routes
router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);

// Protected Routes (requires login)
router.get("/lectures/:id", isAuthenticated, fetchLectures);
router.get("/lecture/:id", isAuthenticated, fetchLecture);
router.get("/mycourse", isAuthenticated, getMyCourses);
router.post("/course/checkout/:id", isAuthenticated, checkout);
router.post("/verification/:id", isAuthenticated, paymentVerification);

export default router;
