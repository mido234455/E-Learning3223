import { StudentCourseProgress } from "../models/StudentCourseProgress.js";
import { Lecture } from "../models/Lecture.js";
import TryCatch from "../middlewares/TryCatch.js";

/**
 * تسجيل محاضرة كمشاهدة
 */
export const markLectureWatched = TryCatch(async (req, res) => {
  const { courseId, lectureId } = req.body;
  const studentId = req.user._id;

  const lectureExists = await Lecture.findById(lectureId);
  if (!lectureExists) {
    return res.status(404).json({ success: false, message: "المحاضرة غير موجودة" });
  }

  let progress = await StudentCourseProgress.findOne({ student: studentId, course: courseId });

  if (!progress) {
    progress = await StudentCourseProgress.create({
      student: studentId,
      course: courseId,
      completedLectures: [{ lectureId }],
    });
  } else {
    const alreadyWatched = progress.completedLectures.some(
      (lec) => lec.lectureId.toString() === lectureId
    );

    if (!alreadyWatched) {
      progress.completedLectures.push({ lectureId });
    }
  }

  await calculateProgress(progress, courseId);

  res.status(200).json({
    success: true,
    message: "تم تسجيل مشاهدة المحاضرة",
    data: {
      progressPercentage: progress.progressPercentage,
      isCourseCompleted: progress.isCourseCompleted,
      watchedLectures: progress.completedLectures,
    },
  });
});

/**
 * تسجيل نتيجة الامتحان
 */
export const submitExam = TryCatch(async (req, res) => {
  const { courseId, examId, score, totalQuestions, correctAnswers } = req.body;
  const studentId = req.user._id;

  if (
    !examId ||
    isNaN(score) ||
    isNaN(totalQuestions) ||
    isNaN(correctAnswers) ||
    totalQuestions === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "بيانات غير مكتملة أو غير صالحة",
    });
  }

  const progress = await StudentCourseProgress.findOne({ student: studentId, course: courseId });

  if (!progress) {
    return res.status(404).json({ success: false, message: "لا يوجد تقدم مسجل" });
  }

const alreadySubmitted = progress.exams.find(
  (exam) => exam.examId && exam.examId.equals(examId)
);


if (alreadySubmitted) {
  return res.status(400).json({
    success: false,
    message: "تم حل هذا الامتحان مسبقاً",
  });
}


  if (alreadySubmitted) {
    return res.status(400).json({
      success: false,
      message: "تم حل هذا الامتحان مسبقاً",
    });
  }

  const passingPercentage = 70;
  const examPercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const passed = examPercentage >= passingPercentage;

  progress.exams.push({
    examId,
    score: Number(score),
    totalQuestions: Number(totalQuestions),
    correctAnswers: Number(correctAnswers),
    percentage: examPercentage,
    passed,
  });

  await calculateProgress(progress, courseId);

  res.status(200).json({
    success: true,
    message: "تم تسجيل نتيجة الامتحان",
  });
});

/**
 * الحصول على بيانات تقدم الطالب
 */
export const getStudentCourseData = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user._id;

  const progress = await StudentCourseProgress.findOne({
    student: studentId,
    course: courseId,
  })
    .populate({
      path: "completedLectures.lectureId",
      select: "title description duration",
    })
    .populate({
      path: "course",
      select: "title description totalLectures",
    });

  const totalLectures = await Lecture.countDocuments({ course: courseId });
  const watchedPercentage = progress
    ? Math.round((progress.completedLectures.length / totalLectures) * 100)
    : 0;

  if (!progress) {
    return res.status(200).json({
      success: true,
      data: {
        progressPercentage: 0,
        watchedLectures: [],
        exams: [],
        isCourseCompleted: false,
        watchedCount: 0,
        totalLectures,
        watchedPercentage: 0,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      progressPercentage: progress.progressPercentage,
      watchedLectures: progress.completedLectures,
      watchedCount: progress.completedLectures.length,
      totalLectures,
      watchedPercentage,
      exams: progress.exams,
      isCourseCompleted: progress.isCourseCompleted,
      lastUpdated: progress.lastUpdated,
    },
  });
});

/**
 * دالة لحساب التقدم
 */
async function calculateProgress(progress, courseId) {
  const totalLectures = await Lecture.countDocuments({ course: courseId });

  const LECTURES_WEIGHT = 70;
  const EXAM_WEIGHT = 30;

  const lectureProgress =
    totalLectures > 0
      ? (progress.completedLectures.length / totalLectures) * LECTURES_WEIGHT
      : 0;

  const bestExam = progress.exams.reduce((best, curr) =>
    curr.percentage > (best?.percentage || 0) ? curr : best
  , null);

  const examProgress = bestExam ? (bestExam.percentage / 100) * EXAM_WEIGHT : 0;

  progress.progressPercentage = Math.min(lectureProgress + examProgress, 100);

  progress.isCourseCompleted =
    progress.completedLectures.length === totalLectures &&
    bestExam &&
    bestExam.passed;

  if (progress.isCourseCompleted && !progress.completedAt) {
    progress.completedAt = new Date();
  }

  await progress.save();
}
