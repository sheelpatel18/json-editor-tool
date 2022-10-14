import BSON_ID from "bson-objectid";
import { NOT_FOUND } from "./Framework/Errors";
import settings from "../../settings.json"
import * as firebaseAdmin from 'firebase-admin'
import { initializeApp, applicationDefault, cert }  from 'firebase-admin/app'
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = settings


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
    add(documentData: object, _id : string): Promise<Document>;
    edit(documentData: object, _id: string): Promise<Document>;
    delete(_id: string): Promise<Document>;
    replace(documentData: object, _id: string): Promise<Document>; // functionaly similar to add, but a seperate method implies the intent
    get(_id: string): Promise<Document>;
    getAll(): Promise<Document[]>;
    getHierarchyDocument() : Promise<Document>
    editHierarchyDocument(hierarchyData: object) : Promise<Document>
}

class FirestoreDatabase implements DbIntegration { // one instance for each colleciton
    static initialized : boolean = false
    collectionRef : firebaseAdmin.firestore.CollectionReference

    constructor(collectionName : string) {
        this.collectionRef = getFirestore().collection(collectionName)
    }

    async add(data: object, _id : string): Promise<any> {
       // if (await this.checkDocumentExists(_id)) throw new CustomErrorTypes.CONFLICT("Document already exists") // TEMP ERROR
        const documentRef = this.collectionRef.doc(_id)
        await documentRef.set(data)
        const document = await documentRef.get()
        return document.exists ? document.data() : null
    }
    edit(documentData: object, _id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    delete(_id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    replace(documentData: object, _id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    get(_id: string): Promise<any> {
        throw new Error("Method not implemented.");
    }
    getAll(): Promise<any[]> {
        throw new Error("Method not implemented.");
    }
    getHierarchyDocument(): Promise<any> {
        throw new Error("Method not implemented.");
    }
    editHierarchyDocument(hierarchyData: object): Promise<any> {
        throw new Error("Method not implemented.");
    }

    static init(googleCloudKey : any) {
        if (this.initialized) return;
        initializeApp({
            credential: firebaseAdmin.credential.cert(googleCloudKey)
        })
        this.initialized = true
    }
    
}

export class Document {
    route : string
    type : ROUTE_TYPES
    json: object
    status: DOCUMENT_STATUS
    metaData: any
    _id: string
    static database : DbIntegration

    constructor(data : any) { 
        this.json = data.json
        this.metaData = data.metaData
        this.status = DOCUMENT_STATUS.CLEAN
        this.route = data?.route
        this.type = data?.type ? Document.getType(data.type) : null
        this._id = data._id
    }

    private static getType(type : string) : ROUTE_TYPES {
        switch (type) {
            case "POST": 
                return ROUTE_TYPES.POST
            case "GET":
                return ROUTE_TYPES.GET
            case "PUT":
                return ROUTE_TYPES.PUT
            case "DELETE":
                return ROUTE_TYPES.DELETE
            default:
                throw new Error("Type is not valid")
        }
    }

    async update(): Promise<Document> { // returns new document instance with updated data
        return await Document.database.edit({
            _id : this._id,
            json: this.json,
            metaData: this.metaData
        }, this._id)
    }

    async delete(): Promise<Document> {
        return await Document.database.delete(this._id)
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

    static async new(json: object, route : string, type : string): Promise<Document> {
        return await Document.database.add({
            _id : Document.generateID(),
            json: json,
            metaData: Document.getDefaultMetaData(),
            route: route,
            type: type
        }, Document.generateID())
    }

    static async get(_id: string): Promise<Document> {
        return await Document.database.get(_id)
    }

    static async getAll(): Promise<Document[]> {
        return await Document.database.getAll()
    }

    private static getDefaultMetaData(): object {
        return {

        }
    }

    private static generateID() : string {
        return BSON_ID().toHexString()
    }

}

export enum ROUTE_TYPES {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH"
}

export class Hierarchy {
    doc : Document

    private constructor(doc : Document) {
        this.doc = doc
    }

    // returns hierarchy instance
    static async get(): Promise<Hierarchy> {
        return new Hierarchy(await  Document.database.getHierarchyDocument())
    }

    // adds empty route to the hierarchy
    addRoute(route : string) : Hierarchy {
        if (!route) throw new Error("Route cannot be null")
        let target = this.doc.json
        const routeArray : string[] = route.split("/").slice(1)
        routeArray.forEach(path => {
            if (!target[path]) target[path] = {}
            target = target[path]
        })
        return this
    }

    // remove route from hierarchy along with all documents in that route
    removeRoute(route : string) : Hierarchy {
        if (!route) throw new Error("Route cannot be null")
        let target = this.doc.json
        const routeArray : string[] = route.split("/").slice(1)
        routeArray.forEach((path, index) => {
            if (!target[path]) throw new Error("Route does not exist")
            if (index == routeArray.length - 1) {
                delete target[path]
            }
            target = target[path]
        })
        return this
    }

    addDocument(route : string, type : ROUTE_TYPES, documentID : string) : Hierarchy {
        if (!route) throw new Error("Route cannot be null")
        if (!type) throw new Error("Type cannot be null")
        let target = this.doc.json
        const routeArray : string[] = route.split("/").slice(1)
        routeArray.forEach((path, index) => {
            if (!target[path]) target[path] = {} // automatically create route if it does not exist
            target = target[path]
        })
        target[type.toString()] = documentID
        return this
    }

    removeDocument(route : string, type : ROUTE_TYPES) : Hierarchy {
        if (!route) throw new Error("Route cannot be null")
        if (!type) throw new Error("Type cannot be null")
        let target = this.doc.json
        const routeArray : string[] = route.split("/").slice(1)
        routeArray.forEach((path, index) => {
            if (!target[path]) throw new Error("Route does not exist")
            target = target[path]
        })
        delete target[type.toString()]
        return this
    }

    async update() : Promise<Hierarchy> {
        return new Hierarchy(await Document.database.editHierarchyDocument(this.doc.parse()))
    }
    
    static async getJSONFromPath(route : string, type : string) : Promise<object> {
        const hierarchy = await Hierarchy.get()
        if (!route) throw new Error("Route cannot be null")
        if (!type) throw new Error("Type cannot be null")
        let target = hierarchy.doc.json
        const routeArray : string[] = route.split("/").slice(1)
        routeArray.forEach((path, index) => {
            if (!target[path]) throw new Error("Route does not exist")
            target = target[path]
        })
        const _id : string = target[type]
        return (await Document.get(_id)).json
    }

}