import { Db, Document, Filter, UpdateFilter, OptionalUnlessRequiredId } from "mongodb";
import { MongoRepository } from "./mongoRepository";
import type { Quiz } from "@/app/types";

type QuizDoc = Quiz & Document | Object;

/**
 * Repositorio especializado para la colección "quizzes".
 * Hereda todos los métodos CRUD de MongoRepository y expone
 * un acceso directo `db.quizzes` con la colección ya fijada.
 *
 * Uso:
 *   const { db } = await Quizzes.create("mondongo");
 *   await db.quizzes.insertOne(quiz);
 *   await db.quizzes.findOne({ code: 123456 });
 */
export class Quizzes extends MongoRepository<QuizDoc> {
    static readonly COLLECTION = "quizzes" as const;

    constructor(connection: Db) {
        super(connection);
    }

    static async create(dbName?: string): Promise<Quizzes> {
        const base = await MongoRepository.create<QuizDoc>(dbName);
        return new Quizzes(base.connection);
    }

    /** Acceso directo con la colección fijada: db.quizzes.insertOne(…) */
    get db() {
        const col = Quizzes.COLLECTION;
        const self = this;
        return {
            quizzes: {
                insertOne: (doc: OptionalUnlessRequiredId<QuizDoc>) =>
                    self.insertOne(col, doc),
                insertMany: (docs: OptionalUnlessRequiredId<QuizDoc>[]) =>
                    self.insertMany(col, docs),
                findOne: (query: Filter<QuizDoc>) =>
                    self.findOne(col, query),
                find: (query: Filter<QuizDoc>) =>
                    self.find(col, query),
                updateOne: (query: Filter<QuizDoc>, update: UpdateFilter<QuizDoc>) =>
                    self.updateOne(col, query, update),
                updateMany: (query: Filter<QuizDoc>, update: UpdateFilter<QuizDoc>) =>
                    self.updateMany(col, query, update),
                deleteOne: (query: Filter<QuizDoc>) =>
                    self.deleteOne(col, query),
                deleteMany: (query: Filter<QuizDoc>) =>
                    self.deleteMany(col, query),
            },
        };
    }
}
