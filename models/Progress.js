import mongoose from "mongoose";

const studentCourseProgressSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  completedLectures: [{
    lectureId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Lecture' 
    },
    completedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  exams: [{
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam', // لو عندك موديل امتحان، أو تجاهل الـ ref لو مش محتاجه
    required: true,
  },
  score: { 
    type: Number, 
    required: true 
  },
  totalQuestions: { 
    type: Number, 
    required: true 
  },
  correctAnswers: { 
    type: Number, 
    required: true 
  },
  attemptedAt: { 
    type: Date, 
    default: Date.now 
  },
  passed: { 
    type: Boolean, 
    required: true 
  },
  percentage: {
    type: Number,
    required: true
  }
}],

  progressPercentage: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  isCourseCompleted: { 
    type: Boolean, 
    default: false 
  },
  completedAt: Date,
  lastUpdated: Date
}, { 
  timestamps: true 
});

// لمنع تكرار السجلات لنفس الطالب والدورة
studentCourseProgressSchema.index({ student: 1, course: 1 }, { unique: true });

// Middleware لتحديث lastUpdated قبل الحفظ
studentCourseProgressSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export const StudentCourseProgress = mongoose.model('StudentCourseProgress', studentCourseProgressSchema);