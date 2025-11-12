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
  firstName?: string;
  lastName?: string;
  name?: string; // Campo alternativo para nome completo
  email: string;
  profileImage?: string;
  points?: number;
  lives?: number;
  quizzes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Tipos para criação de usuário
export interface CreateUserRequest {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface BulkCreateUserRequest {
  users: CreateUserRequest[];
}

export interface BulkCreateUserResponse {
  success: boolean;
  message: string;
  results: {
    created: Array<{
      index: number;
      user: User;
    }>;
    errors: Array<{
      index: number;
      error: string;
    }>;
  };
}

// Tipos para busca de usuário
export interface GetUserResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface GetUserProfileResponse {
  success: boolean;
  message: string;
  profile: User;
}

// Tipos para resumo do usuário
export interface UserSummaryResponse {
  success: boolean;
  data: {
    user: User;
    studyHours: {
      total: number;
      thisWeek: number;
      thisMonth: number;
    };
    courses: {
      completed: number;
      inProgress: number;
      total: number;
    };
    certificates: {
      total: number;
      recent: any[];
    };
    ranking: {
      position: number;
      totalUsers: number;
    };
    activities: {
      recentLectures: any[];
      recentExams: any[];
    };
  };
}

// Tipos para estatísticas do usuário
export interface UserStatsResponse {
  success: boolean;
  message: string;
  stats: {
    period: string;
    user: User;
    achievements: {
      certificates: {
        total: number;
        points: number;
        workload: number;
      };
      lectures: {
        completed: number;
        estimatedHours: number;
      };
      exams: {
        total: number;
        completed: number;
        passed: number;
        failed: number;
        averageScore: number;
      };
      damages: {
        total: number;
      };
    };
    ranking: {
      position: number;
      totalUsers: number;
      percentile: number;
    };
    activity: {
      totalActivities: number;
      lastActivity: number;
    };
  };
}

// Tipos para atividades do usuário
export interface UserActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  points: number;
  createdAt: string;
  metadata: any;
}

export interface UserActivitiesResponse {
  success: boolean;
  message: string;
  activities: UserActivity[];
  stats: {
    total: number;
    byType: {
      certificate: number;
      lecture: number;
      exam: number;
      damage: number;
    };
    period: string;
    type: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para atualização de usuário
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  points?: number;
  quizzes?: string[];
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  user: User;
}

// Tipos para completar dados do usuário
export interface CompleteUserRequest {
  lastName?: string;
  firstName?: string;
}

export interface CompleteUserResponse {
  success: boolean;
  message: string;
  user: User;
}

// Tipos de curso baseados na resposta real da API
export interface Course {
  _id: string;
  name: string; // Campo real da API
  description: string;
  workload: number;
  points: number;
  premiumPoints?: number | null;
  canAccess?: boolean; // Indica se o usuário pode acessar o curso premium
  weekPointsRequired?: number | null; // Pontos semanais necessários (null se não for premium)
  userWeekPoints?: number | null; // Pontos semanais do usuário (null se X-User-Id não foi fornecido)
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
  completedAt?: string;
  content?: Array<{
    _key?: string;
    _type: string;
    children?: Array<{
      _key?: string;
      _type: string;
      marks?: string[];
      text: string;
    }>;
    markDefs?: any[];
    style?: string;
    url?: string;
    imageUrl?: string;
    caption?: string | null;
  }>;
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
  timeLimit?: number;
  passingScore?: number;
  createdAt: string;
  updatedAt?: string;
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
  id: string;
  clerkId: string;
  name: string;
  email: string;
  profileImage?: string;
  points: number;
  position: number;
}

export interface RankingPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface RankingWeek {
  start: string;
  end: string;
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
  course: {
    _id: string;
    name: string;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
}

export interface LectureDetailResponse {
  lecture: Lecture;
  isCompleted: boolean;
  completedAt: string | null;
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
  success: boolean;
  data: {
    exam: {
      id: string;
      lectureCMSid: string;
      userId: string;
      complete: boolean;
      reproved: boolean;
      timeLimit?: number;
      passingScore?: number;
      createdAt: string;
      updatedAt?: string;
    };
    quiz?: {
      _id: string;
      questions: any[];
    };
    lecture?: {
      id: string;
      title: string;
    };
  };
  timestamp: string;
}

export interface CertificatesResponse {
  success?: boolean;
  certificates: Certificate[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Resposta da API GET /api/ranking (estrutura completa)
export interface RankingApiResponse {
  success: boolean;
  data: {
    ranking: RankingUser[];
    pagination: RankingPagination;
    week: RankingWeek;
  };
  timestamp: string;
}

// Resposta simplificada para uso interno (após extrair de data)
export interface RankingResponse {
  success: boolean;
  ranking: RankingUser[];
  pagination: RankingPagination;
  week: RankingWeek;
}

// Resposta da API GET /api/ranking/user (estrutura completa)
export interface UserPointsApiResponse {
  success: boolean;
  data: {
    userId: string;
    userName: string;
    totalPoints: number;
    weekPoints: number;
    profileImage?: string;
  };
  timestamp: string;
}

// Resposta simplificada para uso interno (após extrair de data)
export interface UserPointsResponse {
  userId: string;
  userName: string;
  totalPoints: number;
  weekPoints: number;
  profileImage?: string;
  position?: number; // Posição no ranking (calculada separadamente se necessário)
}

export interface UserInfoResponse {
  id: string;
  clerkId: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Campo alternativo para nome completo
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
export interface CourseProgress {
  status: "not_started" | "in_progress" | "completed";
  percentage: number;
  completedLectures: number;
  totalLectures: number;
  remainingLectures: number;
  isCompleted: boolean;
  isReadyForCertificate: boolean;
}

export interface CourseProgressResponse {
  success: true;
  course: {
    id: string;
    name: string;
    slug: string;
    description: string;
    points: number;
    workload: number;
    premiumPoints?: number | null;
    canAccess?: boolean;
    weekPointsRequired?: number | null;
    userWeekPoints?: number | null;
    imageUrl?: string;
  };
  progress: CourseProgress;
  certificate?: {
    id: string;
    courseTitle: string;
    points: number;
    workload: number;
    createdAt: string;
  } | null;
  lectures?: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string | null;
  }>;
  exams?: Array<{
    id: string;
    lectureId: string;
    complete: boolean;
    reproved: boolean;
    timeLimit?: number;
    passingScore?: number;
    createdAt: string;
    updatedAt: string;
  }>;
  examStats?: {
    total: number;
    completed: number;
    reproved: number;
    pending: number;
  };
  lastActivity: string;
}

export interface MultipleCourseProgressResponse {
  success: true;
  courses: Array<{
    course: {
      id: string;
      name: string;
      slug: string;
      description: string;
      points: number;
      workload: number;
      premiumPoints?: number | null;
      canAccess?: boolean;
      weekPointsRequired?: number | null;
      userWeekPoints?: number | null;
      imageUrl?: string;
    };
    progress: CourseProgress;
    certificate?: {
      id: string;
      courseTitle: string;
      points: number;
      workload: number;
      createdAt: string;
    } | null;
    lastActivity: string;
  }>;
  total: number;
}

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
  // Campos de acesso premium (vindos da API)
  canAccess?: boolean;
  weekPointsRequired?: number | null;
  userWeekPoints?: number | null;
}

export interface UserCoursesResponse {
  courses: UserCourse[];
  summary: {
    completed: number;
    inProgress: number;
    total: number;
  };
}

// Tipos de requisição
export interface CompleteLectureRequest {
  courseId: string;
}

export interface CreateExamRequest {
  lectureCMSid: string;
  timeLimit?: number; // opcional, em minutos
  passingScore?: number; // opcional, porcentagem mínima para aprovação
}

export interface UpdateExamRequest {
  complete?: boolean;
  reproved?: boolean;
  courseId?: string;
}

export interface ExamEligibilityResponse {
  success: boolean;
  data: {
    canTakeExam: boolean;
    remainingLives: number;
    totalLives: number;
    nextResetTime: string | null;
    message?: string;
  };
  timestamp: string;
}

export interface ExamQuestionsResponse {
  success: boolean;
  data: {
    exam: {
      id: string;
      lectureCMSid: string;
      userId: string;
      complete: boolean;
      reproved: boolean;
      questions: Array<{
        id: string;
        title: string;
        question: string;
        cover?: {
          asset: {
            url: string;
          };
        };
        answers: Array<{
          answer: string;
          isCorrect: boolean;
        }>;
        order: number;
      }>;
      totalQuestions: number;
      timeLimit?: number;
      passingScore?: number;
      createdAt: string;
      updatedAt: string;
    };
  };
  timestamp: string;
}

export interface ExamSubmitRequest {
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
  }>;
  timeSpent: number; // em segundos
}

export interface ExamSubmitResponse {
  success: boolean;
  data: {
    message: string;
    result: {
      examId: string;
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      passed: boolean;
      timeSpent: number;
      answers: Array<{
        questionId: string;
        selectedAnswer: string;
        isCorrect: boolean;
        timeSpent: number;
      }>;
      completedAt: string;
    };
  };
  timestamp: string;
}

export interface ExamAttemptsResponse {
  success: boolean;
  data: {
    attempts: Array<{
      id: string;
      examId: string;
      userId: string;
      answers: any[];
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      timeSpent: number;
      completedAt: string;
      createdAt: string;
      updatedAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  timestamp: string;
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

// Tipos para rotas faltantes
export interface CertificateCreateRequest {
  userId: string;
  course: {
    _id: string;
    name: string;
    description?: string;
    points?: number;
    workload?: number;
    premiumPoints?: number;
    banner?: {
      asset: {
        url: string;
      };
    };
    slug?: string;
  };
}

export interface CertificateCreateResponse {
  success: boolean;
  data: {
    certificate: {
      id: string;
      userId: string;
      courseCmsId: string;
      courseTitle: string;
      description: string;
      points: number;
      workload: number;
      createdAt: string;
      updatedAt: string;
    };
  };
  timestamp: string;
}

export interface SanityRevalidateRequest {
  secret: string;
  type?: string;
  slug?: string;
}

export interface SanityRevalidateResponse {
  message: string;
  revalidated: boolean;
}
