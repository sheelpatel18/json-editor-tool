import express, { Router, Request, Response } from "express"
import { API_FRAMEWORK } from "../../Framework/API_FRAMEWORK"
import { API_RESPONSE } from "../../Framework/API_RESPONSE"
import { Document } from "../../ts/Database"

import schemaIDParamRouter from "./{id}"

const router : Router = express.Router({mergeParams: true})

router.use("/:_id", schemaIDParamRouter)

router.route("/")
    .get((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const allDocuments : Document[] = await Document.getAll()
                API_RESPONSE.OK(allDocuments.map(doc => doc.json)).send(res)
            },
            res
        )
    })
    .post((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const {
                    json
                } : {
                    json : object
                } = req.body
                const newDoc : Document = await Document.new(json)
                API_RESPONSE.CREATED(newDoc.json).send(res)
            },
            res
        )
    })

export default router