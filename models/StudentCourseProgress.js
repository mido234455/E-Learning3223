import mongoose from "mongoose";

const completedLectureSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
  },
});

const examAttemptSchema = new mongoose.Schema({
  attempted: { type: Boolean, default: true },
  score: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  attemptedAt: { type: Date, default: Date.now },
});

const studentCourseProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  completedLectures: [completedLectureSchema],
  exams: [examAttemptSchema],
  progressPercentage: {
    type: Number,
    default: 0,
  },
});

export const StudentCourseProgress = mongoose.model(
  "StudentCourseProgress",
  studentCourseProgressSchema
);
