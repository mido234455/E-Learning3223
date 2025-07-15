import { Exam } from "../models/Exam.js";// أو حسب مكان الدالة الفعلي
const TryCatch = (func) => async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// إضافة امتحان لكورس
export const addExam = TryCatch(async (req, res) => {
  const { courseId, title, questions } = req.body;

  const exam = await Exam.create({
    course: courseId,
    title,
    questions,
  });

  res.status(201).json({ message: "Exam Created", exam });
});

// جلب جميع امتحانات كورس
export const getExamsByCourse = TryCatch(async (req, res) => {
  const exams = await Exam.find({ course: req.params.courseId });
  res.json({ exams });
});

// الحصول على امتحان معين
export const getSingleExam = TryCatch(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return res.status(404).json({ message: "Exam not found" });

  res.json({ exam });
});
