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
  user: User;
  points: number;
  lives: Lives;
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