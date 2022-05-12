import express, { Router, Request, Response } from "express"
import { API_FRAMEWORK } from "../../Framework/API_FRAMEWORK"
import { API_RESPONSE } from "../../Framework/API_RESPONSE"
import { Document } from "../../ts/Database"

const router : Router = express.Router()

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
                    data
                } : {
                    data : object
                } = req.body
                const newDoc : Document = await Document.new(data)
                API_RESPONSE.CREATED(newDoc.json).send(res)
            },
            res
        )
    })