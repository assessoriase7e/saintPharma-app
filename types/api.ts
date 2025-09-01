// Tipos para configuração da API
export interface ApiConfig {
  baseUrl: string;
  apiToken: string;
  userId?: string;
}

// Tipos de erro da API
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

// Tipos de usuário
export interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  profileImage?: string;
}

// Tipos de curso baseados na resposta real da API
export interface Course {
  _id: string;
  name: string; // Campo real da API
  description: string;
  workload: number;
  points: number;
  premiumPoints?: number | null;
  slug?: string | null;
  banner?: {
    asset: {
      url: string;
    };
  };
}

// Tipos de aula
export interface Lecture {
  _id: string;
  title: string;
  description: string;
  videoUrl?: string;
  completed: boolean;
}

// Tipos de certificado
export interface Certificate {
  id: string;
  courseTitle: string;
  workload: number;
  points: number;
  description: string;
  createdAt: string;
}

// Tipos de exame
export interface Exam {
  id: string;
  lectureCMSid: string;
  complete: boolean;
  reproved: boolean;
  userId: string;
  createdAt: string;
}

// Tipos de vidas
export interface Lives {
  totalLives: number;
  remainingLives: number;
  damageCount: number;
  lastDamageAt?: string;
}

// Tipos de ranking
export interface RankingUser {
  user: {
    name: string;
    profileImage?: string;
  };
  points: number;
  certificatesCount: number;
}

// Tipos de resposta da API
export interface CoursesResponse {
  courses: Course[];
}

export interface CourseDetailResponse {
  course: Course;
  lectures: Lecture[];
  userProgress?: any[];
}

export interface CourseCompleteResponse {
  message: string;
  certificate: Certificate;
}

export interface LecturesResponse {
  lectures: Lecture[];
  totalLectures: number;
  completedLectures: number;
}

export interface UserLectureResponse {
  message: string;
  userLecture: {
    id: string;
    lectureCmsId: string;
    courseId: string;
    userId: string;
  };
}

export interface ExamResponse {
  message?: string;
  exam: Exam;
  lectureCompleted?: boolean;
  lifeLost?: boolean;
}

export interface CertificatesResponse {
  certificates: Certificate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface RankingResponse {
  ranking: RankingUser[];
}

export interface UserPointsResponse {
  totalPoints: number;
  weeklyPoints: number;
  position: number;
}

export interface UserInfoResponse {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  profileImage?: string;
  points: number;
  lives: number;
  createdAt: string;
  updatedAt: string;
}

// Tipos para resumo do usuário
export interface UserSummaryResponse {
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  completedCourses: number;
  completedLectures: number;
  certificates: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  totalTimeSpent: number; // em minutos
  lastActivity: string;
}

// Tipos para progresso do usuário
export interface UserProgress {
  id: string;
  courseId: string;
  courseName: string;
  lectureId: string;
  lectureTitle: string;
  status: "completed" | "in_progress" | "not_started";
  completedAt?: string;
  score?: number;
  timeSpent?: number; // em minutos
}

export interface UserProgressResponse {
  progress: UserProgress[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  summary: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLectures: number;
    completedLectures: number;
  };
}

// Tipos para cursos do usuário
export interface UserCourse {
  id: string;
  courseId: string;
  course: Course;
  enrolledAt: string;
  completedAt?: string;
  progress: {
    completedLectures: number;
    totalLectures: number;
    percentage: number;
  };
  lastAccessedAt?: string;
}

export interface UserCoursesResponse {
  courses: UserCourse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Tipos de requisição
export interface CompleteLectureRequest {
  courseId: string;
}

export interface CreateExamRequest {
  lectureCMSid: string;
}

export interface UpdateExamRequest {
  complete?: boolean;
  reproved?: boolean;
  courseId?: string;
}

// Tipos para questões do quiz
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  explanation?: string;
  points: number;
}

export interface QuestionResponse {
  questions: Question[];
  totalQuestions: number;
  timeLimit?: number; // em minutos
  passingScore: number; // porcentagem mínima para aprovação
}
