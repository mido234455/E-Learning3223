import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/isAuth.js";
import {
  addLectures,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllStats,
  getAllUser,
  updateRole,
} from "../controllers/admin.js";
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

router.post("/course/new", isAuthenticated, isAdmin, uploadFiles, createCourse);
router.post("/course/:id", isAuthenticated, isAdmin, uploadFiles, addLectures);
router.delete("/course/:id", isAuthenticated, isAdmin, deleteCourse);
router.delete("/lecture/:id", isAuthenticated, isAdmin, deleteLecture);
router.get("/stats", isAuthenticated, isAdmin, getAllStats);
router.put("/user/:id", isAuthenticated, updateRole);
router.get("/users", isAuthenticated, isAdmin, getAllUser);

export default router;
