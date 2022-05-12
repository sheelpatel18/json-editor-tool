import { Response } from "express";
import { CustomError } from "./Errors";

export class API_RESPONSE {
    data : object
    code : number
    status : string

    private constructor(data : object, code : number, status : string) {
        this.data = data
        this.code = code
        this.status = status
    }

    static OK(data : object) {
        return new API_RESPONSE(data, 200, "OK")
    }

    static CREATED(data : object) {
        return new API_RESPONSE(data, 201, "CREATED")
    }

    static NO_CONTENT() { // not used right now
        return new API_RESPONSE({}, 204, "NO CONTENT")
    }

    send(res : Response) {
        res.status(this.code).json(API_RESPONSE.generateResponse(this.data, this))
    }

    static sendError(error : CustomError, res : Response) {
        res.status(error.code).json(API_RESPONSE.generateResponse(error.message, error))
    }

    private static generateResponse(data : object | string, responseObject : API_RESPONSE | CustomError) : object {
        return {
            data : data,
            status : responseObject.status,
            code : responseObject.code,
            timestamp : new Date().toISOString(),

        }
    }
}