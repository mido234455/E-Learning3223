// models/Exam.js
import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  questions: [
    {
      question: { type: String, required: true },
      options: [String],
      correctAnswer: { type: String, required: true },
    },
  ],
});

export const Exam = mongoose.model("Exam", examSchema);
