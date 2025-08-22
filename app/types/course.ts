export interface Course {
  id: number;
  titulo: string;
  descricao: string;
  duracao: string;
  nivel: 'Iniciante' | 'Intermediário' | 'Avançado';
  categoria: string;
  progresso: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  courseId: number;
  titulo: string;
  descricao: string;
  duracao: string;
  ordem: number;
  content: LessonContent;
  quiz?: Quiz;
  completed: boolean;
}

export interface LessonContent {
  type: 'rich-text';
  blocks: ContentBlock[];
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'heading';
  content: string;
  style?: {
    fontSize?: 'small' | 'medium' | 'large';
    fontWeight?: 'normal' | 'bold';
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
  };
  metadata?: {
    alt?: string; // Para imagens
    width?: number;
    height?: number;
    duration?: string; // Para vídeos
    thumbnail?: string; // Para vídeos
  };
}

export interface Quiz {
  id: number;
  lessonId: number;
  titulo: string;
  descricao: string;
  questions: Question[];
  passingScore: number; // Pontuação mínima para aprovação (0-100)
  timeLimit?: number; // Tempo limite em minutos (opcional)
}

export interface Question {
  id: number;
  quizId: number;
  pergunta: string;
  tipo: 'multiple-choice';
  opcoes: QuestionOption[];
  respostaCorreta: string; // ID da opção correta
  explicacao?: string; // Explicação da resposta (opcional)
  pontos: number;
}

export interface QuestionOption {
  id: string;
  texto: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  userId: number;
  respostas: UserAnswer[];
  pontuacao: number;
  aprovado: boolean;
  dataInicio: Date;
  dataFim: Date;
  tempoGasto: number; // em segundos
}

export interface UserAnswer {
  questionId: number;
  selectedOptionId: string;
  isCorrect: boolean;
  pontos: number;
}

export interface QuizResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
  timeSpent: string;
}