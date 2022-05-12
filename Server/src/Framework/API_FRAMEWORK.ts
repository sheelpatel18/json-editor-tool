import { Response } from "express";
import { CustomError } from "./Errors";


export const API_FRAMEWORK = (func : Function, res : Response) : void => {
    try {
        func()
    } catch (err : any) {
        if (err instanceof CustomError) {
            err.respond(res)
        } else {
            // internal server error
            // ideally some additional logging here
        }
    }
}
/*

This framework serves to serve as a single source of truth for how responses are constructued and for
how errors are handled.

The function passed in the first argument will be run, if any errors occur, the framework will catch them and trigger
response that will send the appropiate http code and message back to the client. 

This structure is supposed to reduce redundancy - rather than having this try/catch block at each api endpoint, I can define 
it once right here and then use it in each endpoint.

*/