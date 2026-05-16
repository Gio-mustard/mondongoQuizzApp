
import {
    Db,
    Filter,
    UpdateFilter,
    OptionalUnlessRequiredId,
    WithId,
    Document,
    DeleteResult,
    UpdateResult,
    InsertOneResult,
    InsertManyResult,
} from "mongodb";
import clientPromise, { Database } from "./database";

/**
 * Repositorio genérico de MongoDB.
 *
 * @typeParam T - Forma del documento almacenado en la colección.
 *               Extiende `Document` (OJO! es equivalente a `Record<string, any>` osea un objeto {})
 *
 * Uso:
 *   const repo = await MongoRepository.create<MiTipo>("mi_base_de_datos");
 *   const doc  = await repo.findOne("mi_coleccion", { campo: "valor" });
 */
export class  MongoRepository<T extends Document = Document> implements Database {
    connection: Db;

    private constructor(db: Db) {
        this.connection = db;
    }


    /**
     * Crea e inicializa el repositorio resolviendo el clientPromise.
     * @param dbName - Nombre de la base de datos. Si se omite, usa la del URI.
     */
    static async create<T extends Document = Document>(
        dbName?: string
    ): Promise<MongoRepository<T>> {
        if (!clientPromise){
            throw new Error("No se ha creado la promesa del cliente de Mongo DB");
        }
        const client = await clientPromise;
        const db = client.db(dbName);
        return new MongoRepository<T>(db);
    }


    /**
     * Inserta un único documento.
     * @returns El resultado de la inserción con el _id generado.
     */
    async insertOne(
        collection: string,
        document: OptionalUnlessRequiredId<T>
    ): Promise<InsertOneResult<T>> {
        return this.connection.collection<T>(collection).insertOne(document);
    }

    /**
     * Inserta múltiples documentos.
     * @returns El resultado de la inserción con los _id generados.
     */
    async insertMany(
        collection: string,
        documents: OptionalUnlessRequiredId<T>[]
    ): Promise<InsertManyResult<T>> {
        return this.connection.collection<T>(collection).insertMany(documents);
    }


    /**
     * Busca el primer documento que coincida con el filtro.
     * @returns El documento encontrado, o `null` si no existe.
     */
    async findOne(
        collection: string,
        query: Filter<T>
    ): Promise<WithId<T> | null> {
        return this.connection.collection<T>(collection).findOne(query);
    }

    /**
     * Busca todos los documentos que coincidan con el filtro.
     * @returns Array de documentos (puede estar vacío).
     */
    async find(
        collection: string,
        query: Filter<T>
    ): Promise<WithId<T>[]> {
        return this.connection.collection<T>(collection).find(query).toArray();
    }


    /**
     * Actualiza el primer documento que coincida con el filtro.
     */
    async updateOne(
        collection: string,
        query: Filter<T>,
        update: UpdateFilter<T>
    ): Promise<UpdateResult<T>> {
        return this.connection.collection<T>(collection).updateOne(query, update);
    }

    /**
     * Actualiza todos los documentos que coincidan con el filtro.
     */
    async updateMany(
        collection: string,
        query: Filter<T>,
        update: UpdateFilter<T>
    ): Promise<UpdateResult<T>> {
        return this.connection.collection<T>(collection).updateMany(query, update);
    }


    /**
     * Elimina el primer documento que coincida con el filtro.
     */
    async deleteOne(
        collection: string,
        query: Filter<T>
    ): Promise<DeleteResult> {
        return this.connection.collection<T>(collection).deleteOne(query);
    }

    /**
     * Elimina todos los documentos que coincidan con el filtro.
     */
    async deleteMany(
        collection: string,
        query: Filter<T>
    ): Promise<DeleteResult> {
        return this.connection.collection<T>(collection).deleteMany(query);
    }
}
