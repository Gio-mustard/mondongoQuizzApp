import { Db, Document, Filter, UpdateFilter, OptionalUnlessRequiredId } from "mongodb";
import { MongoRepository } from "./mongoRepository";
import type { QuizSession } from "@/app/types";

type QuizSessionDoc = QuizSession & Document | object;

/**
 * Repositorio especializado para la colección "quiz_sessions".
 * Hereda todos los métodos CRUD de MongoRepository y expone
 * un acceso directo `db.quiz_sessions` con la colección ya fijada.
 *
 * Uso:
 *   const { db } = await QuizSessions.create("mondongo");
 *   await db.quiz_sessions.insertOne(session);
 *   await db.quiz_sessions.find({ status: "lobby" });
 */
export class QuizSessions extends MongoRepository<QuizSessionDoc> {
    static readonly COLLECTION = "quiz_sessions" as const;

    constructor(connection: Db) {
        super(connection);
    }

    static async create(dbName?: string): Promise<QuizSessions> {
        const base = await MongoRepository.create<QuizSessionDoc>(dbName);
        return new QuizSessions(base.connection);
    }

    /** Acceso directo con la colección fijada: db.quiz_sessions.findOne(…) */
    get db() {
        const col = QuizSessions.COLLECTION;
        const self = this;
        return {
            quiz_sessions: {
                insertOne: (doc: OptionalUnlessRequiredId<QuizSessionDoc>) =>
                    self.insertOne(col, doc),
                insertMany: (docs: OptionalUnlessRequiredId<QuizSessionDoc>[]) =>
                    self.insertMany(col, docs),
                findOne: (query: Filter<QuizSessionDoc>) =>
                    self.findOne(col, query),
                find: (query: Filter<QuizSessionDoc>) =>
                    self.find(col, query),
                updateOne: (query: Filter<QuizSessionDoc>, update: UpdateFilter<QuizSessionDoc>) =>
                    self.updateOne(col, query, update),
                updateMany: (query: Filter<QuizSessionDoc>, update: UpdateFilter<QuizSessionDoc>) =>
                    self.updateMany(col, query, update),
                deleteOne: (query: Filter<QuizSessionDoc>) =>
                    self.deleteOne(col, query),
                deleteMany: (query: Filter<QuizSessionDoc>) =>
                    self.deleteMany(col, query),
            },
        };
    }
}
