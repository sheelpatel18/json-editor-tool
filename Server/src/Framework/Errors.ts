import { Response } from "express";
import { API_RESPONSE } from "./API_RESPONSE";

export enum ERROR_TYPE {
    NOT_FOUND = "NOT_FOUND",
    BAD_REQUEST = "BAD_REQUEST",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"
}

const validHTTPStatusCodes = [
    200,
    201,
    202,
    204,
    400,
    401,
    403,
    404,
    405,
    406,
    409,
    410,
    411,
    412,
    413,
    414,
    415,
    416,
    417,
    418,
    422,
    423,
    424,
    426,
    429,
    431,
    500,
    501,
    502,
    503,
    504,
    505,
    506,
    507,
    508,
    510,
    511
]

export class CustomError {
    type: ERROR_TYPE;
    code : number; // although this could be wrapped in with the enum, I opted to keep it in a separate field
    status : string
    message : string

    protected constructor(type: ERROR_TYPE, message: string, HTTP_STATUS: number) {
        if (!validHTTPStatusCodes.includes(HTTP_STATUS)) throw new Error("HTTP status code is not valid")
        this.message = message
        this.type = type;
        this.code = HTTP_STATUS;
        this.status = this.type.toString()
    }

    respond(res: Response) : void {
        API_RESPONSE.sendError(this, res)
    } // used to send express api response to client
}

export class NOT_FOUND extends CustomError {
    constructor(message: string) {
        super(ERROR_TYPE.NOT_FOUND, message, 404)
    }
}

export class BAD_REQUEST extends CustomError {
    constructor(message: string) {
        super(ERROR_TYPE.BAD_REQUEST, message, 400)
    }
}

export class INTERNAL_SERVER_ERROR extends CustomError {
    constructor(message: string) {
        super(ERROR_TYPE.INTERNAL_SERVER_ERROR, message, 500)
    }
}