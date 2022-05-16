import { CreateTableCommand, CreateTableCommandInput, DynamoDBClient, ListTablesCommand, ListTablesCommandOutput, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, GetCommandInput, GetCommandOutput, PutCommand, PutCommandInput, PutCommandOutput, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import BSON_ID from "bson-objectid";
import { NOT_FOUND } from "../Framework/Errors";

export enum DatabaseType {
    Mongo,
    Firestore,
    DynamoDB
}

export enum DOCUMENT_STATUS {
    DELETED = "DELETED",
    CLEAN = "CLEAN",
    DIRTY = "DIRTY" // not used, but kept for future use if caching is implemented
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
    db : DynamoDBDocumentClient

    constructor() {
        const clientAPI : DynamoDBClient = new DynamoDBClient(
            { 
                region : "us-east-1",
                credentials: {
                }
            }
            ) // lazy init
        const marshallOptions = {
            convertEmptyValues: true,
            removeUndefinedValues: true,
            convertClassInstanceToMap: false,
          }
          const unmarshallOptions = {
            wrapNumbers: false, 
            removeUndefinedValues: true,
          }
          const translateConfig = { marshallOptions, unmarshallOptions };
          // auth stuff here
          this.db = DynamoDBDocumentClient.from(clientAPI, translateConfig);
    }

    async init() : Promise<DynamoIntegration> { // returns same instance for method chaining
        // create system and document table

        const allTables = (await this.db.send(new ListTablesCommand({}))).TableNames

        const systemParams : CreateTableCommandInput = {
            TableName: "JSON_EDITOR_System",
            KeySchema: [
                { AttributeName: "_id", KeyType: "HASH" }
            ],
            AttributeDefinitions: [
                { AttributeName: "_id", AttributeType: "S" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            }
        }
        const documentParams : CreateTableCommandInput = {
            TableName: "JSON_EDITOR_Documents",
            KeySchema: [
                { AttributeName: "_id", KeyType: "HASH" }
            ],
            AttributeDefinitions: [
                { AttributeName: "_id", AttributeType: "S" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            }
        }
        if (!allTables.includes("JSON_EDITOR_System")) await this.db.send(new CreateTableCommand(systemParams))
        if (!allTables.includes("JSON_EDITOR_Documents")) await this.db.send(new CreateTableCommand(documentParams))

        // create hierarchy document
        const hierarchyParams : PutCommandInput = {
            TableName: "JSON_EDITOR_System",
            Item: {
                _id: "HIERARCHY",
                hierarchy : {}
            }
        }
        await this.db.send(new PutCommand(hierarchyParams))
        return this
    }

    getAll(): Promise<Document[]> {
        throw new Error("Method not implemented.");
    }
    async add(data: any): Promise<Document> { // forced insert, no checks. Use wisely
        const _id : string = data?._id
        if (!_id) throw new Error("_id cannot be null")
        const params : PutCommandInput = {
            TableName: "JSON_EDITOR_Documents",
            Item: data
        }
        const result = await this.db.send(new PutCommand(params))
        return await this.get(_id)
    }
    async edit(data: any, _id: string): Promise<Document> { //really just replacing. No checks. Use wisely
        if (!_id) throw new Error("_id cannot be null")
        const params : PutCommandInput = {
            TableName: "JSON_EDITOR_Documents",
            Item: data
        }
        const result = await this.db.send(new PutCommand(params))
        return await this.get(_id)
    }
    async delete(_id: string): Promise<Document> {
        if (!_id) throw new Error("_id cannot be null")
        const document : Document = await this.get(_id)
        const params : UpdateCommandInput = {
            TableName: "JSON_EDITOR_Documents",
            Key: {
                _id : _id
            }
        }
        const result = await this.db.send(new DeleteCommand(params))
        document.status = DOCUMENT_STATUS.DELETED
        return document

    }
    async replace(json: object, _id: string): Promise<Document> {
        throw new Error("Method not implemented.");
    }
    async get(_id: string): Promise<Document> {
        if (!_id) throw new Error("_id cannot be null")
        const params : GetCommandInput = {
            TableName: "JSON_EDITOR_Documents",
            Key: {
                _id : _id
            }
        }
        const result : object = (await this.db.send(new GetCommand(params))).Item
        if (!result) throw new NOT_FOUND("Document with that ID does not exist")
        return new Document(result)
    }

}

class MongoIntegration implements DbIntegration {
    init(clientAPI: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
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

    static async init(dbType: DatabaseType | string = null): Promise<DbIntegration> {
        if (!this.db) {
            switch (dbType) {
                case DatabaseType.Firestore:
                    this.type = dbType
                    this.db = new FirestoreIntegration();
                    break;
                case DatabaseType.DynamoDB:
                    this.type = dbType
                    this.db = await new DynamoIntegration().init()
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
                    this.db = await new DynamoIntegration().init()
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

    constructor(data : any) { 
        this.json = data.data
        this.metaData = data.metaData
        this.status = DOCUMENT_STATUS.CLEAN
        this._id = data._id
    }

    async update(): Promise<Document> { // returns new document instance with updated data
        return await Database.db.edit({
            _id : this._id,
            data: this.json,
            metaData: this.metaData
        }, this._id)
    }

    async delete(): Promise<Document> {
        return await Database.db.delete(this._id)
    }

    edit(json: object, metaData: any = null): Document { 
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
            status: this.status.toLocaleString()
        }
    }

    static async new(json: object): Promise<Document> {
        return await Database.db.add({
            _id : Document.generateID(),
            json: json,
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

    private static getDefaultMetaData(): object {
        return {

        }
    }

    private static generateID() : string {
        return BSON_ID().toHexString()
    }

    static async databaseInit(type: DatabaseType | string): Promise<void> {
        await Database.init(type)
    }

    /* these are protected because they are really only intended to be used by a database integration object. The standard I decided to use is to 
    create an implicity defined subclass to access this command within the database object. Although it does add some more code, it separates functionality
    a bit better. There's already a lot going on in this class.
    */

}