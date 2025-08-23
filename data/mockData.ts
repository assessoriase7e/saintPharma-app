import { Course, Lesson, Quiz, Question } from '../types/course';

export const mockCourses: Course[] = [
  {
    id: 1,
    titulo: "Farmacologia Básica",
    descricao: "Fundamentos da farmacologia moderna",
    duracao: "8 horas",
    nivel: "Iniciante",
    categoria: "Farmácia",
    progresso: 0,
    lessons: [
      {
        id: 1,
        courseId: 1,
        titulo: "Introdução à Farmacologia",
        descricao: "Conceitos básicos e princípios fundamentais",
        duracao: "45 min",
        ordem: 1,
        completed: false,
        content: {
          type: 'rich-text',
          blocks: [
            {
              id: '1',
              type: 'heading',
              content: 'Introdução à Farmacologia',
              style: { fontSize: 'large', fontWeight: 'bold' }
            },
            {
              id: '2',
              type: 'text',
              content: 'A farmacologia é a ciência que estuda os medicamentos e suas interações com os organismos vivos. Esta disciplina abrange desde a descoberta de novos fármacos até sua aplicação clínica.'
            },
            {
              id: '3',
              type: 'image',
              content: 'https://via.placeholder.com/400x200/3b82f6/ffffff?text=Farmacologia',
              metadata: { alt: 'Conceitos de Farmacologia', width: 400, height: 200 }
            },
            {
              id: '4',
              type: 'text',
              content: 'Os principais objetivos da farmacologia incluem:\n\n• Compreender os mecanismos de ação dos medicamentos\n• Estudar a farmacocinética e farmacodinâmica\n• Avaliar a eficácia e segurança dos fármacos\n• Desenvolver novos tratamentos terapêuticos'
            }
          ]
        },
        quiz: {
          id: 1,
          lessonId: 1,
          titulo: "Quiz: Introdução à Farmacologia",
          descricao: "Teste seus conhecimentos sobre os conceitos básicos",
          passingScore: 70,
          timeLimit: 10,
          questions: [
            {
              id: 1,
              quizId: 1,
              pergunta: "O que é farmacologia?",
              tipo: 'multiple-choice',
              pontos: 25,
              opcoes: [
                { id: 'a', texto: 'Ciência que estuda medicamentos e suas interações', isCorrect: true },
                { id: 'b', texto: 'Estudo apenas de plantas medicinais', isCorrect: false },
                { id: 'c', texto: 'Análise de laboratório clínico', isCorrect: false },
                { id: 'd', texto: 'Preparação de cosméticos', isCorrect: false }
              ],
              respostaCorreta: 'a',
              explicacao: 'A farmacologia é a ciência que estuda os medicamentos e suas interações com organismos vivos.'
            },
            {
              id: 2,
              quizId: 1,
              pergunta: "Qual NÃO é um objetivo principal da farmacologia?",
              tipo: 'multiple-choice',
              pontos: 25,
              opcoes: [
                { id: 'a', texto: 'Compreender mecanismos de ação', isCorrect: false },
                { id: 'b', texto: 'Estudar farmacocinética', isCorrect: false },
                { id: 'c', texto: 'Produzir equipamentos médicos', isCorrect: true },
                { id: 'd', texto: 'Avaliar eficácia dos fármacos', isCorrect: false }
              ],
              respostaCorreta: 'c',
              explicacao: 'A produção de equipamentos médicos não é um objetivo da farmacologia.'
            },
            {
              id: 3,
              quizId: 1,
              pergunta: "O que abrange a farmacologia?",
              tipo: 'multiple-choice',
              pontos: 25,
              opcoes: [
                { id: 'a', texto: 'Apenas descoberta de fármacos', isCorrect: false },
                { id: 'b', texto: 'Apenas aplicação clínica', isCorrect: false },
                { id: 'c', texto: 'Da descoberta à aplicação clínica', isCorrect: true },
                { id: 'd', texto: 'Apenas estudos laboratoriais', isCorrect: false }
              ],
              respostaCorreta: 'c',
              explicacao: 'A farmacologia abrange desde a descoberta de novos fármacos até sua aplicação clínica.'
            },
            {
              id: 4,
              quizId: 1,
              pergunta: "Farmacocinética e farmacodinâmica são:",
              tipo: 'multiple-choice',
              pontos: 25,
              opcoes: [
                { id: 'a', texto: 'Áreas de estudo da farmacologia', isCorrect: true },
                { id: 'b', texto: 'Tipos de medicamentos', isCorrect: false },
                { id: 'c', texto: 'Métodos de administração', isCorrect: false },
                { id: 'd', texto: 'Efeitos colaterais', isCorrect: false }
              ],
              respostaCorreta: 'a',
              explicacao: 'Farmacocinética e farmacodinâmica são importantes áreas de estudo dentro da farmacologia.'
            }
          ]
        }
      },
      {
        id: 2,
        courseId: 1,
        titulo: "Farmacocinética",
        descricao: "Como o organismo processa os medicamentos",
        duracao: "60 min",
        ordem: 2,
        completed: false,
        content: {
          type: 'rich-text',
          blocks: [
            {
              id: '1',
              type: 'heading',
              content: 'Farmacocinética',
              style: { fontSize: 'large', fontWeight: 'bold' }
            },
            {
              id: '2',
              type: 'text',
              content: 'A farmacocinética estuda o que o organismo faz com o medicamento, incluindo os processos de absorção, distribuição, metabolismo e excreção (ADME).'
            },
            {
              id: '3',
              type: 'video',
              content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              metadata: {
                duration: '5:30',
                thumbnail: 'https://via.placeholder.com/400x225/10b981/ffffff?text=Video+Farmacocinetica'
              }
            },
            {
              id: '4',
              type: 'text',
              content: 'Os quatro processos principais são:\n\n**Absorção**: Entrada do fármaco no organismo\n**Distribuição**: Transporte pelo corpo\n**Metabolismo**: Transformação química\n**Excreção**: Eliminação do organismo'
            }
          ]
        }
      }
    ]
  },
  {
    id: 2,
    titulo: "Análises Clínicas",
    descricao: "Interpretação de exames laboratoriais",
    duracao: "12 horas",
    nivel: "Intermediário",
    categoria: "Laboratório",
    progresso: 0,
    lessons: [
      {
        id: 3,
        courseId: 2,
        titulo: "Fundamentos das Análises Clínicas",
        descricao: "Princípios básicos dos exames laboratoriais",
        duracao: "50 min",
        ordem: 1,
        completed: false,
        content: {
          type: 'rich-text',
          blocks: [
            {
              id: '1',
              type: 'heading',
              content: 'Fundamentos das Análises Clínicas',
              style: { fontSize: 'large', fontWeight: 'bold' }
            },
            {
              id: '2',
              type: 'text',
              content: 'As análises clínicas são fundamentais para o diagnóstico, monitoramento e tratamento de doenças. Elas fornecem informações objetivas sobre o estado de saúde do paciente.'
            },
            {
              id: '3',
              type: 'image',
              content: 'https://via.placeholder.com/400x200/10b981/ffffff?text=Laboratorio+Clinico',
              metadata: { alt: 'Laboratório Clínico', width: 400, height: 200 }
            }
          ]
        },
        quiz: {
          id: 2,
          lessonId: 3,
          titulo: "Quiz: Fundamentos das Análises Clínicas",
          descricao: "Avalie seu conhecimento sobre análises clínicas",
          passingScore: 75,
          questions: [
            {
              id: 5,
              quizId: 2,
              pergunta: "Qual é o principal objetivo das análises clínicas?",
              tipo: 'multiple-choice',
              pontos: 50,
              opcoes: [
                { id: 'a', texto: 'Apenas diagnóstico de doenças', isCorrect: false },
                { id: 'b', texto: 'Diagnóstico, monitoramento e tratamento', isCorrect: true },
                { id: 'c', texto: 'Apenas monitoramento', isCorrect: false },
                { id: 'd', texto: 'Pesquisa científica', isCorrect: false }
              ],
              respostaCorreta: 'b'
            },
            {
              id: 6,
              quizId: 2,
              pergunta: "As análises clínicas fornecem informações:",
              tipo: 'multiple-choice',
              pontos: 50,
              opcoes: [
                { id: 'a', texto: 'Subjetivas sobre o paciente', isCorrect: false },
                { id: 'b', texto: 'Objetivas sobre o estado de saúde', isCorrect: true },
                { id: 'c', texto: 'Apenas sobre sintomas', isCorrect: false },
                { id: 'd', texto: 'Sobre preferências do paciente', isCorrect: false }
              ],
              respostaCorreta: 'b'
            }
          ]
        }
      }
    ]
  }
];

export const getCourseById = (id: number): Course | undefined => {
  return mockCourses.find(course => course.id === id);
};

export const getLessonById = (lessonId: number): Lesson | undefined => {
  for (const course of mockCourses) {
    const lesson = course.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
};

export const getQuizById = (quizId: number): Quiz | undefined => {
  for (const course of mockCourses) {
    for (const lesson of course.lessons) {
      if (lesson.quiz && lesson.quiz.id === quizId) {
        return lesson.quiz;
      }
    }
  }
  return undefined;
};