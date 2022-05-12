export enum DatabaseType {
    Mongo,
    Firestore,
    DynamoDB
}

export enum DOCUMENT_STATUS {
    DELETED,
    CLEAN,
    DIRTY // not used, but kept for future use if caching is implemented
}

interface DbIntegration {
    add(documentData: object): Promise<Document>;
    edit(documentData: object, _id: string): Promise<Document>;
    delete(_id: string): Promise<Document>;
    replace(documentData: object, _id: string): Promise<Document>; // functionaly similar to add, but a seperate method implies the intent
    get(_id: string): Promise<Document>;
    getAll(): Promise<Document[]>;
}

class FirestoreIntegration implements DbIntegration {
    getAll(): Promise<Document[]> {
        throw new Error("Method not implemented.");
    }
    async add(json: object): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async edit(json: object, _id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async delete(_id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async replace(json: object, _id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async get(_id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }

}

class DynamoIntegration implements DbIntegration {
    getAll(): Promise<Document[]> {
        throw new Error("Method not implemented.");
    }
    async add(json: object): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async edit(json: object, _id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async delete(_id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async replace(json: object, _id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async get(_id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }

}

class MongoIntegration implements DbIntegration {
    getAll(): Promise<Document[]> {
        throw new Error("Method not implemented.");
    }
    async add(json: object): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async edit(json: object, _id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async delete(_id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async replace(json: object, _id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async get(_id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }

}

class Database {
    static db: DbIntegration;
    static type: DatabaseType;

    static init(dbType: DatabaseType | string = null): DbIntegration {
        if (!this.db) {
            switch (dbType) {
                case DatabaseType.Firestore:
                    this.type = dbType
                    this.db = new FirestoreIntegration();
                    break;
                case DatabaseType.DynamoDB:
                    this.type = dbType
                    this.db = new DynamoIntegration();
                    break;
                case DatabaseType.Mongo:
                    this.type = dbType
                    this.db = new MongoIntegration();
                    break;
                case "Firestore":
                    this.type = DatabaseType.Firestore
                    this.db = new FirestoreIntegration()
                    break;
                case "DynamoDB":
                    this.type = DatabaseType.DynamoDB
                    this.db = new DynamoIntegration()
                    break;
                case "Mongo":
                    this.type = DatabaseType.Mongo
                    this.db = new MongoIntegration()
                    break;
                default:
                    this.type = null
                    throw new Error("Database type is not valid");
            }
            return this.db
        }
    }
}

export class Document {
    json: object
    status: DOCUMENT_STATUS
    metaData: any
    _id: string

    private constructor() {

    }

    async update(): Promise<Document> { // returns new document instance with updated data
        return await Database.db.edit({
            data: this.json,
            metaData: this.metaData
        }, this._id)
    }

    async delete(): Promise<Document> {
        return await Database.db.delete(this._id)
    }

    edit(json: object, metaData: any = null): Document { // returns same instance to support method chaining
        this.json = json
        if (metaData) this.metaData = metaData
        this.status = DOCUMENT_STATUS.DIRTY
        return this
    }

    parse(): object {
        return {
            _id: this._id,
            json: this.json,
            metaData: this.metaData,
            status: this.status.toString()
        }
    }

    static async new(json: object): Promise<Document> {
        return await Database.db.add({
            data: json,
            metaData: Document.getDefaultMetaData()
        })
    }

    static async get(_id: string): Promise<Document> {
        return await Database.db.get(_id)
    }

    static async getHierarchyDocument(): Promise<Document> {
        return await Database.db.get("HIERARCHY")
    }

    static async getAll(): Promise<Document[]> {
        return await Database.db.getAll()
    }

    static generate(): Document {
        switch (Database.type) {
            case DatabaseType.Firestore:
                return Document.firebase()
                break;
            case DatabaseType.DynamoDB:
                return Document.dynamo()
                break;
            case DatabaseType.Mongo:
                return Document.mongo()
                break;
            default:
                throw new Error("Database type is not valid");
        }
    }

    private static firebase(): Document {
        return new Document()
    }

    private static dynamo(): Document {
        return new Document()
    }

    private static mongo(): Document {
        return new Document()
    }

    private static getDefaultMetaData(): object {
        return {

        }
    }

    static databaseInit(type: DatabaseType | string): void {
        Database.init(type)
    }

}