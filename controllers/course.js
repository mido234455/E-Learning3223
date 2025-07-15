import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Payment } from "../models/Payment.js";
import { StudentCourseProgress } from "../models/StudentCourseProgress.js";

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({ courses });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  res.json({ course });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });
  const user = await User.findById(req.user._id);

  if (user.role === "admin") return res.json({ lectures });

  if (!user.subscription.includes(req.params.id))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  const user = await User.findById(req.user._id);

  if (user.role === "admin") return res.json({ lecture });

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: req.user.subscription });
  res.json({ courses });
});

// ✅ [Checkout وهمي]
export const checkout = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({
      message: "You already have this course",
    });
  }

  const dummyOrder = {
    id: "dummy_order_id_123456",
    amount: course.price * 100,
    currency: "EGP",
    status: "created",
  };

  res.status(201).json({
    order: dummyOrder,
    course,
  });
});

// ✅ [Payment Verification وهمي]
export const paymentVerification = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  await Payment.create({
    razorpay_order_id: "dummy_order_id",
    razorpay_payment_id: "dummy_payment_id",
    razorpay_signature: "dummy_signature",
  });

  user.subscription.push(course._id);
  await user.save();

  await StudentCourseProgress.create({
    student: req.user._id,
    course: course._id,
    completedLectures: [],
    exams: [],
  });

  res.status(200).json({
    message: "Course Purchased Successfully (Dummy)",
  });
});

// ✅ إضافة محاضرة للمشاهدة
export const addProgress = TryCatch(async (req, res) => {
  const progress = await StudentCourseProgress.findOne({
    student: req.user._id,
    course: req.query.course,
  });

  const { lectureId } = req.query;

  const alreadyWatched = progress.completedLectures.some(
    (lec) => lec.lectureId.toString() === lectureId
  );

  if (alreadyWatched) {
    return res.json({ message: "Progress already recorded" });
  }

  progress.completedLectures.push({ lectureId });
  await progress.save();

  res.status(201).json({ message: "New progress added" });
});

// ✅ إحضار تقدم الطالب في الكورس
export const getYourProgress = TryCatch(async (req, res) => {
  const progress = await StudentCourseProgress.findOne({
    student: req.user._id,
    course: req.query.course,
  });

  if (!progress) return res.status(404).json({ message: "No progress found" });

  const allLectures = await Lecture.countDocuments({ course: req.query.course });
  const completedLectures = progress.completedLectures.length;
  const courseProgressPercentage = allLectures > 0 
    ? Math.round((completedLectures / allLectures) * 100)
    : 0;

  res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    progress,
  });
});
