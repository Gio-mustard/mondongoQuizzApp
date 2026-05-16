export interface Database {
    connection: any;
    insertOne(collection: string, document: any): Promise<any>;
    insertMany(collection: string, documents: any[]): Promise<any>;
    findOne(collection: string, query: any): Promise<any>;
    find(collection: string, query: any): Promise<any[]>;
    updateOne(collection: string, query: any, update: any): Promise<any>;
    updateMany(collection: string, query: any, update: any): Promise<any>;
    deleteOne(collection: string, query: any): Promise<any>;
    deleteMany(collection: string, query: any): Promise<any>;
}

import { MongoClient } from "mongodb";
const uri = process.env.MONGO_URI

const options = {};
let client:MongoClient;
let clientPromise:Promise<MongoClient>;
if (!uri) {
    throw new Error("No se agrego MONGO_URI a las variables de entorno");
}


if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
}
else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;