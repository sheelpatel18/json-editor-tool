import { Response } from "express";
import { API_RESPONSE } from "./API_RESPONSE";

export enum ERROR_TYPE {

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

export class CustomError extends Error {
    type: ERROR_TYPE;
    status : string
    code : number; // although this could be wrapped in with the enum, I opted to keep it in a separate field

    protected constructor(type: ERROR_TYPE, message: string, status : string, HTTP_STATUS: number) {
        if (!validHTTPStatusCodes.includes(HTTP_STATUS)) throw new Error("HTTP status code is not valid")
        super(message);
        this.type = type;
        this.status = status;
        this.code = HTTP_STATUS;
    }

    respond(res: Response) : void {
        API_RESPONSE.sendError(this, res)
    } // used to send express api response to client
}

