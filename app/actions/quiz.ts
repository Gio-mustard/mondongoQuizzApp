'use server'

import { MongoRepository } from "@/app/utils/mongoRepository";
import { assertAdmin } from "./auth";
import { cookies } from "next/headers";
import type { Question, Quiz, QuizSession, SafeQuestion, Participant, PlayerAnswer } from "@/app/types";

const DB_NAME = "mondongo";

/**
 * Crea un nuevo quiz en la base de datos con un código de acceso numérico de 6 dígitos único.
 */
export async function createQuiz(password: string, name: string, questions: Question[], code: number): Promise<{ success: boolean; code: number }> {
  await assertAdmin(password);

  const repo = await MongoRepository.create(DB_NAME);





  const found = await repo.findOne("quizzes", { code: code });
  if (found) {
    throw Error(`Ya existe un quiz con el codigo ${code}`)
  }


  const quiz = {
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    code,
    questions,
    active: true,
    createdAt: new Date(),
  };

  await repo.insertOne("quizzes", quiz);
  return { success: true, code: code };
}

/**
 * Crea un quiz a partir de una cadena JSON, validando su estructura.
 */
export async function createQuizFromJson(password: string, jsonString: string): Promise<{ success: boolean; code?: number; error?: string }> {
  try {
    const { validateQuizJson } = await import('@/app/utils/quizValidator');
    const data = validateQuizJson(jsonString);
    return await createQuiz(password, data.name, data.questions, data.code);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un quiz y todas sus sesiones asociadas de la base de datos.
 */
export async function deleteQuiz(password: string, quizId: string): Promise<{ success: boolean }> {
  await assertAdmin(password);

  const repo = await MongoRepository.create(DB_NAME);
  const { ObjectId } = await import("mongodb");

  await repo.deleteOne("quizzes", { _id: new ObjectId(quizId) });
  await repo.deleteMany("quiz_sessions", { quizId });

  return { success: true };
}

/**
 * Retorna la lista completa de quizzes registrados en la base de datos.
 */
export async function getQuizzes(password: string): Promise<(Pick<Quiz, '_id' | 'name' | 'slug' | 'code' | 'active' | 'createdAt'> & { questionsCount: number; sessions: { _id: string; status: string; participantCount: number; createdAt: Date }[] })[]> {
  await assertAdmin(password);

  const repo = await MongoRepository.create(DB_NAME);
  const quizzes = await repo.find("quizzes", {});
  const allSessions = await repo.find("quiz_sessions", {});


  return quizzes.map(q => {
    const quizSessions = allSessions.filter(s => s.quizId === q._id.toString()).map(s => ({
      _id: s._id.toString(),
      status: s.status as string,
      participantCount: s.participants?.length ?? 0,
      createdAt: s.createdAt as Date,
    }));

    return {
      _id: q._id.toString(),
      name: q.name,
      slug: q.slug,
      code: q.code,
      questionsCount: q.questions?.length ?? 0,
      active: q.active,
      createdAt: q.createdAt,
      sessions: quizSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    };
  });
}

/**
 * Cambia el estado de una sesión de "lobby" a "in_progress" e inicia el quiz.
 */
export async function startSession(password: string, sessionId: string): Promise<{ success: boolean }> {
  await assertAdmin(password);

  const repo = await MongoRepository.create(DB_NAME);
  const { ObjectId } = await import("mongodb");

  await repo.updateOne(
    "quiz_sessions",
    { _id: new ObjectId(sessionId), status: "lobby" },
    {
      $set: {
        status: "in_progress",
        startedAt: new Date(),
      }
    }
  );

  return { success: true };
}

/**
 * Retorna todas las sesiones que están actualmente en estado "lobby" o "in_progress".
 */
export async function getActiveSessions(password: string): Promise<(Pick<QuizSession, 'quizId' | 'quizSlug' | 'quizName' | 'status' | 'totalQuestions' | 'createdAt'> & { _id: string; participantCount: number; participants: Pick<Participant, 'username' | 'icon'>[] })[]> {
  await assertAdmin(password);

  const repo = await MongoRepository.create(DB_NAME);
  const sessions = await repo.find("quiz_sessions", {
    status: { $in: ["lobby", "in_progress"] }
  });

  return sessions.map(s => ({
    _id: s._id.toString(),
    quizId: s.quizId,
    quizSlug: s.quizSlug,
    quizName: s.quizName,
    status: s.status,
    totalQuestions: s.totalQuestions,
    participantCount: s.participants?.length ?? 0,
    participants: (s.participants ?? []).map((p: Participant) => ({
      username: p.username,
      icon: p.icon,
    })),
    createdAt: s.createdAt,
  }));
}

/**
 * Agrega un jugador a una sesión existente o crea una nueva sesión si no hay ninguna activa.
 * Establece una cookie httpOnly con los datos del jugador y retorna el slug del quiz.
 */
export async function joinQuiz(code: number, username: string, icon: string): Promise<{ success: boolean; slug?: string; error?: string }> {
  const repo = await MongoRepository.create(DB_NAME);

  const quiz = await repo.findOne("quizzes", { code, active: true }) as (Quiz & { _id: { toString(): string } }) | null;
  if (!quiz) {
    return { success: false, error: "No se encontró un quiz con ese código" };
  }

  const quizId = quiz._id.toString();

  let session = await repo.findOne("quiz_sessions", {
    quizId,
    status: {
      $in: ["lobby", "in_progress"]
    }
  }) as (QuizSession & { _id: { toString(): string } }) | null;

  if (session) {
    const existingParticipant = session.participants?.find(
      (p: Participant) => p.username === username
    );

    if (existingParticipant) {
      const sessionId = session._id.toString();
      const cookieStore = await cookies();
      cookieStore.set("quiz_player", JSON.stringify({ sessionId, username, icon }), {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 2,
      });

      return { success: true, slug: quiz.slug };
    }

    if (session.status === "in_progress") {
      return { success: false, error: "El quiz ya está en progreso, no puedes unirte" };
    }

    const { ObjectId } = await import("mongodb");
    await repo.updateOne(
      "quiz_sessions",
      { _id: new ObjectId(session._id.toString()) },
      {
        $push: {
          participants: {
            username,
            icon,
            joinedAt: new Date(),
            answers: [],
            score: 0,
            finished: false,
          }
        }
      } as any
    );

    const sessionId = session._id.toString();
    const cookieStore = await cookies();
    cookieStore.set("quiz_player", JSON.stringify({ sessionId, username, icon }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    return { success: true, slug: quiz.slug };
  }

  const newSession = {
    quizId,
    quizSlug: quiz.slug,
    quizName: quiz.name,
    status: "lobby",
    totalQuestions: quiz.questions.length,
    participants: [
      {
        username,
        icon,
        joinedAt: new Date(),
        answers: [],
        score: 0,
        finished: false,
      }
    ],
    startedAt: null,
    finishedAt: null,
    duration: null,
    createdAt: new Date(),
  };

  const result = await repo.insertOne("quiz_sessions", newSession);
  const sessionId = result.insertedId.toString();

  const cookieStore = await cookies();
  cookieStore.set("quiz_player", JSON.stringify({ sessionId, username, icon }), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 2,
  });

  return { success: true, slug: quiz.slug };
}

/**
 * Retorna el estado actual de una sesión: su status, lista de participantes y total de preguntas.
 */
export async function getSessionStatus(sessionId: string): Promise<{ status: QuizSession['status']; participants: Pick<Participant, 'username' | 'icon' | 'finished'>[]; totalQuestions: number } | null> {
  const repo = await MongoRepository.create(DB_NAME);
  const { ObjectId } = await import("mongodb");

  const session = await repo.findOne("quiz_sessions", { _id: new ObjectId(sessionId) });
  if (!session || session.status === 'finished') {
    return null;
  }

  return {
    status: session.status as QuizSession["status"],
    participants: (session.participants ?? []).map((p: Participant) => ({
      username: p.username,
      icon: p.icon,
      finished: p.finished,
    })),
    totalQuestions: session.totalQuestions,
  };
}

/**
 * Retorna las preguntas del quiz asociado a la sesión, omitiendo la respuesta correcta de cada una.
 */
export async function getSessionQuestions(sessionId: string): Promise<SafeQuestion[] | null> {
  const repo = await MongoRepository.create(DB_NAME);
  const { ObjectId } = await import("mongodb");

  const session = await repo.findOne("quiz_sessions", { _id: new ObjectId(sessionId) });
  if (!session) return null;

  const quiz = await repo.findOne("quizzes", { _id: new ObjectId(session.quizId) });
  if (!quiz) return null;

  return (quiz.questions as Question[]).map((q: Question, i: number) => ({
    title: q.title,
    type: q.type,
    options: q.options,
    index: i,
  }));
}

/**
 * Registra la respuesta de un jugador para una pregunta, actualiza su score y, si es la última
 * pregunta y todos terminaron, cierra la sesión.
 */
export async function submitAnswer(
  sessionId: string,
  username: string,
  questionIndex: number,
  selectedOption: number,
  timeMs: number
): Promise<{ success: boolean; correct?: boolean; correctAnswer?: number; error?: string }> {
  const repo = await MongoRepository.create(DB_NAME);
  const { ObjectId } = await import("mongodb");

  const session = await repo.findOne("quiz_sessions", { _id: new ObjectId(sessionId) });
  if (!session || session.status !== "in_progress") {
    return { success: false, error: "Sesión no válida" };
  }

  const quiz = await repo.findOne("quizzes", { _id: new ObjectId(session.quizId) });
  if (!quiz) {
    return { success: false, error: "Quiz no encontrado" };
  }

  const question = quiz.questions[questionIndex] as Question;
  const isCorrect = selectedOption === question.answer;

  const answer: PlayerAnswer = {
    questionIndex,
    selectedOption,
    correct: isCorrect,
    timeMs,
  };

  const participant = (session.participants as Participant[]).find(
    (p: Participant) => p.username === username
  );

  if (!participant) {
    return { success: false, error: "Participante no encontrado" };
  }

  const newScore = participant.score + (isCorrect ? 1 : 0);
  const isLastQuestion = questionIndex === session.totalQuestions - 1;

  await repo.updateOne(
    "quiz_sessions",
    {
      _id: new ObjectId(sessionId),
      "participants.username": username,
    },
    {
      $push: { "participants.$.answers": answer },
      $set: {
        "participants.$.score": newScore,
        "participants.$.finished": isLastQuestion,
      },
    } as any
  );

  if (isLastQuestion) {
    const updatedSession = await repo.findOne("quiz_sessions", { _id: new ObjectId(sessionId) });
    if (updatedSession) {
      const allFinished = (updatedSession.participants as Participant[]).every(
        (p: Participant) => p.finished || p.username === username
      );

      if (allFinished) {
        const startedAt = new Date(updatedSession.startedAt).getTime();
        const now = Date.now();
        const durationSeconds = Math.round((now - startedAt) / 1000);

        await repo.updateOne(
          "quiz_sessions",
          { _id: new ObjectId(sessionId) },
          {
            $set: {
              status: "finished",
              finishedAt: new Date(),
              duration: durationSeconds,
            }
          }
        );
      }
    }
  }

  return { success: true, correct: isCorrect, correctAnswer: question.answer };
}

/**
 * Retorna el leaderboard de una sesión: participantes ordenados por score de mayor a menor.
 */
export async function getLeaderboard(sessionId: string): Promise<{ status: QuizSession['status']; totalQuestions: number; quizName: string; duration: number | null; participants: (Pick<Participant, 'username' | 'icon' | 'score' | 'finished'> & { totalAnswered: number })[] } | null> {
  const repo = await MongoRepository.create(DB_NAME);
  const { ObjectId } = await import("mongodb");

  const session = await repo.findOne("quiz_sessions", { _id: new ObjectId(sessionId) });
  if (!session) return null;

  const participants = (session.participants as Participant[])
    .map((p: Participant) => ({
      username: p.username,
      icon: p.icon,
      score: p.score,
      finished: p.finished,
      totalAnswered: p.answers?.length ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    status: session.status as QuizSession["status"],
    totalQuestions: session.totalQuestions,
    quizName: session.quizName,
    duration: session.duration,
    participants,
  };
}

/**
 * Lee y parsea la cookie del jugador actual. Retorna null si no existe o es inválida.
 */
export async function getPlayerCookie(): Promise<{ sessionId: string; username: string; icon: string } | null> {
  const cookieStore = await cookies();
  const playerCookie = cookieStore.get("quiz_player");

  if (!playerCookie) return null;

  try {
    return JSON.parse(playerCookie.value) as { sessionId: string; username: string; icon: string };
  } catch {
    return null;
  }
}

/**
 * Elimina la cookie de sesión del jugador actual.
 */
export async function clearPlayerCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("quiz_player");
}

type SessionLeaderboard = {
  sessionId: string;
  status: QuizSession['status'];
  totalQuestions: number;
  quizName: string;
  quizSlug: string;
  duration: number | null;
  participants: (Pick<Participant, 'username' | 'icon' | 'score' | 'finished'> & { totalAnswered: number })[];
};

/**
 * Retorna la sesión más reciente (por createdAt) asociada a un slug de quiz dado,
 * junto con su leaderboard ordenado por score descendente.
 */
export async function getLatestSessionBySlug(
  password: string,
  slug: string
): Promise<SessionLeaderboard | null> {
  await assertAdmin(password);

  const repo = await MongoRepository.create(DB_NAME);
  const sessions = await repo.find("quiz_sessions", { quizSlug: slug });

  if (!sessions.length) return null;

  sessions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const session = sessions[0];

  const participants = (session.participants as Participant[])
    .map((p: Participant) => ({
      username: p.username,
      icon: p.icon,
      score: p.score,
      finished: p.finished,
      totalAnswered: p.answers?.length ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    sessionId: session._id.toString(),
    status: session.status as QuizSession["status"],
    totalQuestions: session.totalQuestions,
    quizName: session.quizName,
    quizSlug: session.quizSlug,
    duration: session.duration,
    participants,
  };
}

/**
 * Retorna una sesión específica por su ID con el leaderboard ordenado por score descendente.
 * Requiere autenticación de administrador.
 */
export async function getSessionById(
  password: string,
  sessionId: string
): Promise<SessionLeaderboard | null> {
  await assertAdmin(password);

  const repo = await MongoRepository.create(DB_NAME);
  const { ObjectId } = await import("mongodb");

  const session = await repo.findOne("quiz_sessions", { _id: new ObjectId(sessionId) });
  if (!session) return null;

  const participants = (session.participants as Participant[])
    .map((p: Participant) => ({
      username: p.username,
      icon: p.icon,
      score: p.score,
      finished: p.finished,
      totalAnswered: p.answers?.length ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    sessionId: session._id.toString(),
    status: session.status as QuizSession["status"],
    totalQuestions: session.totalQuestions,
    quizName: session.quizName,
    quizSlug: session.quizSlug,
    duration: session.duration,
    participants,
  };
}
