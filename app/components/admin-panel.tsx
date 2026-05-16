'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/app/context/adminAuth';
import { createQuiz, deleteQuiz, getQuizzes, getActiveSessions, startSession } from '@/app/actions/quiz';
import type { Question } from '@/app/types';
import { Button } from './buttons';

interface QuizItem {
  _id: string;
  name: string;
  slug: string;
  code: number;
  questionsCount: number;
  active: boolean;
}

interface SessionItem {
  _id: string;
  quizId: string;
  quizSlug: string;
  quizName: string;
  status: string;
  totalQuestions: number;
  participantCount: number;
  participants: { username: string; icon: string }[];
}
function CopyIcon() {
  return (
    <svg id="copy-icon" className='h-5 w-5 fill-[#4CAF50]' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="copy-icon">
      <path d="m13 20a5.006 5.006 0 0 0 5-5v-8.757a3.972 3.972 0 0 0 -1.172-2.829l-2.242-2.242a3.972 3.972 0 0 0 -2.829-1.172h-4.757a5.006 5.006 0 0 0 -5 5v10a5.006 5.006 0 0 0 5 5zm-9-5v-10a3 3 0 0 1 3-3s4.919.014 5 .024v1.976a2 2 0 0 0 2 2h1.976c.01.081.024 9 .024 9a3 3 0 0 1 -3 3h-6a3 3 0 0 1 -3-3zm18-7v11a5.006 5.006 0 0 1 -5 5h-9a1 1 0 0 1 0-2h9a3 3 0 0 0 3-3v-11a1 1 0 0 1 2 0z" />
    </svg>
  )
}
function Quiz({ quiz, handleDeleteQuiz }: { quiz: QuizItem, handleDeleteQuiz: (quiz_id: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(quiz.code.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      key={quiz._id}
      className="border-2 border-gray-200 rounded-lg p-4 md:p-6 hover:border-[#4CAF50] transition-colors duration-200"
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
            {quiz.name}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Código de Ingreso:</span>{' '}
              <span className="relative inline-block">
                <span
                  onClick={handleCopy}
                  className="bg-gray-100 flex w-fit gap-2 items-center justify-center px-3 py-1 rounded font-mono text-[#4CAF50] font-bold text-lg hover:bg-accent hover:cursor-pointer transition-colors"
                >
                  <CopyIcon />
                  {quiz.code}
                </span>
                <span className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap pointer-events-none transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`}>
                  ✓ Código copiado
                </span>
              </span>
            </p>
            <p>
              <span className="font-semibold">Preguntas:</span> {quiz.questionsCount}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleDeleteQuiz(quiz._id)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}


/**
 * Panel de administración principal. Permite crear y eliminar quizzes,
 * ver la lista de quizzes existentes y gestionar sesiones activas.
 */
export default function AdminPanel() {
  const { logout, password } = useAdminAuth();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  const [quizName, setQuizName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    title: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    answer: 0,
  });


  const loadQuizzes = useCallback(async () => {
    try {
      setIsLoadingQuizzes(true);
      const data = await getQuizzes(password);
      setQuizzes(data as QuizItem[]);
    } catch {
      console.error('Error loading quizzes');
    } finally {
      setIsLoadingQuizzes(false);
    }
  }, [password]);


  const loadSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const data = await getActiveSessions(password);
      setSessions(data as SessionItem[]);
    } catch {
      console.error('Error loading sessions');
    } finally {
      setIsLoadingSessions(false);
    }
  }, [password]);

  useEffect(() => {
    loadQuizzes();
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, [loadQuizzes, loadSessions]);


  const handleAddQuestion = () => {
    if (!currentQuestion.title.trim()) {
      setErrorMessage('La pregunta necesita un título');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const hasEmptyOptions = currentQuestion.options.some(o => !o.trim());
    if (hasEmptyOptions) {
      setErrorMessage('Todas las opciones deben tener texto');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setQuestions(prev => [...prev, { ...currentQuestion }]);
    setCurrentQuestion({
      title: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      answer: 0,
    });
    setErrorMessage('');
  };


  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };


  const handleOptionChange = (index: number, value: string) => {
    setCurrentQuestion(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };


  const handleTypeChange = (type: Question['type']) => {
    setCurrentQuestion(prev => ({
      ...prev,
      type,
      options: type === 'true-false' ? ['Verdadero', 'Falso'] : ['', '', '', ''],
      answer: 0,
    }));
  };


  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quizName.trim()) {
      setErrorMessage('Ingresa un nombre para el quiz');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (questions.length === 0) {
      setErrorMessage('Agrega al menos una pregunta');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createQuiz(password, quizName, questions);
      setSuccessMessage(`✓ Quiz "${quizName}" creado con código: ${result.code}`);
      setQuizName('');
      setQuestions([]);
      loadQuizzes();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch {
      setErrorMessage('Error al crear el quiz');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('¿Estás seguro de eliminar este quiz?')) return;

    try {
      await deleteQuiz(password, quizId);
      loadQuizzes();
      loadSessions();
    } catch {
      setErrorMessage('Error al eliminar el quiz');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };


  const handleStartSession = async (sessionId: string) => {
    try {
      await startSession(password, sessionId);
      loadSessions();
    } catch {
      setErrorMessage('Error al iniciar la sesión');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const optionColors = ['bg-red-100 border-red-300', 'bg-blue-100 border-blue-300', 'bg-yellow-100 border-yellow-300', 'bg-green-100 border-green-300'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">Panel de Administración</h1>
            <p className="text-gray-600 mt-1">Gestiona tus quizzes y sesiones</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-200"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm font-medium">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Active Sessions */}
        {sessions.length > 0 && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2 border-amber-200">
            <h2 className="text-2xl font-bold mb-4 text-[#1a1a1a] flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-amber-400 rounded-full animate-pulse"></span>
              Sesiones Activas
            </h2>
            <div className="space-y-4">
              {sessions.map(session => (
                <div
                  key={session._id}
                  className="border-2 border-gray-200 rounded-lg p-4 md:p-6 hover:border-amber-400 transition-colors duration-200"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#1a1a1a]">{session.quizName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-semibold">Estado:</span>{' '}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${session.status === 'lobby'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                          }`}>
                          {session.status === 'lobby' ? 'En Lobby' : 'En Progreso'}
                        </span>
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {session.participants.map(p => (
                          <span key={p.username} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {p.icon} {p.username}
                          </span>
                        ))}
                      </div>
                    </div>
                    {session.status === 'lobby' && (
                      <button
                        onClick={() => handleStartSession(session._id)}
                        className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 whitespace-nowrap"
                      >
                        🚀 Iniciar Quiz
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Quiz Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 sticky top-8">
              <h2 className="text-2xl font-bold mb-6 text-[#1a1a1a]">Crear Nuevo Quiz</h2>

              <form onSubmit={handleCreateQuiz} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Quiz
                  </label>
                  <input
                    type="text"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Ej: Quiz de Biología"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#4CAF50] focus:outline-none transition-colors duration-200 disabled:opacity-50"
                  />
                </div>

                {/* Questions Added */}
                {questions.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preguntas ({questions.length})
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {questions.map((q, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                          <span className="truncate flex-1 mr-2">
                            {i + 1}. {q.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(i)}
                            className="text-red-500 hover:text-red-700 font-bold text-xs shrink-0"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Builder */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Nueva Pregunta
                  </p>

                  <input
                    type="text"
                    value={currentQuestion.title}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="¿Cuál es la pregunta?"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-[#4CAF50] focus:outline-none text-sm"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('multiple-choice')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${currentQuestion.type === 'multiple-choice'
                        ? 'bg-[#4CAF50] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      Opción Múltiple
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('true-false')}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${currentQuestion.type === 'true-false'
                        ? 'bg-[#4CAF50] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      V / F
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.answer === i}
                          onChange={() => setCurrentQuestion(prev => ({ ...prev, answer: i }))}
                          className="accent-[#4CAF50]"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          placeholder={`Opción ${i + 1}`}
                          disabled={currentQuestion.type === 'true-false'}
                          className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#4CAF50] ${optionColors[i] || 'border-gray-200'}`}
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    + Agregar Pregunta
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || questions.length === 0}
                  className="w-full bg-[#4CAF50] hover:bg-[#45a049] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200"
                >
                  {isSubmitting ? 'Creando...' : `Crear Quiz (${questions.length} preguntas)`}
                </button>
              </form>
            </div>
          </div>

          {/* Quiz List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-[#1a1a1a]">Quizzes</h2>

              {isLoadingQuizzes ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
                </div>
              ) : quizzes.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
                  No hay quizzes creados. ¡Crea el primero!
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz,index) => (
                    <Quiz
                      key={quiz._id+index}
                      quiz={quiz}
                      handleDeleteQuiz={handleDeleteQuiz}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
