import express, { Router, Request, Response } from "express"
import { API_FRAMEWORK } from "../../Framework/API_FRAMEWORK"
import { API_RESPONSE } from "../../Framework/API_RESPONSE"
import { Document, Hierarchy, ROUTE_TYPES } from "../../Database"

import schemaIDParamRouter from "./{id}"

const router : Router = express.Router({mergeParams: true})

router.use("/:_id", schemaIDParamRouter)

router.route("/")
    .get((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const allDocuments : Document[] = await Document.getAll()
                API_RESPONSE.OK(allDocuments.map(doc => doc.parse())).send(res)
            },
            res
        )
    })
    .post((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                let {
                    json,
                    route,
                    type
                } : {
                    json : object,
                    route : string,
                    type : string
                } = req.body
                let typeEnum : ROUTE_TYPES
                switch (type) {
                    case "GET":
                        typeEnum = ROUTE_TYPES.GET
                        break;
                    case "POST":
                        typeEnum = ROUTE_TYPES.POST
                        break;
                    case "PUT":
                        typeEnum = ROUTE_TYPES.PUT
                        break;
                    case "DELETE":
                        typeEnum = ROUTE_TYPES.DELETE
                        break;
                    default:
                        throw new Error("TYPE NOT SUPPORTED")
                }
                const newDoc : Document = await Document.new(json)
                const hierarchy : Hierarchy = await Hierarchy.get()
                await hierarchy.addDocument(route, typeEnum, newDoc._id).update()
                API_RESPONSE.CREATED(newDoc.json).send(res)
            },
            res
        )
    })

export default router