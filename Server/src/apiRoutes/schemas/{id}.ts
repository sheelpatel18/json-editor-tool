import express, { Router, Request, Response } from "express"
import { BAD_REQUEST } from "../../Framework/Errors"
import { API_FRAMEWORK } from "../../Framework/API_FRAMEWORK"
import { API_RESPONSE } from "../../Framework/API_RESPONSE"
import { Document } from "../../ts/Database"

const router : Router = express.Router({mergeParams: true})

router.route("/") // id param
    .get((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const _id = req.params._id as string
                const document = await Document.get(_id)
                API_RESPONSE.OK(document.parse()).send(res)
            },
            res
        )
    })
    .put((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const _id = req.params._id as string
                const {
                    json,
                    metaData
                } : {
                    json : object,
                    metaData : any
                } = req.body
                let document = await Document.get(_id)
                document = await document.edit(json, metaData).update()
                API_RESPONSE.OK(document.parse()).send(res)
            },
            res
        )
    })
    .delete((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const _id = req.params._id as string
                let document = await Document.get(_id)
                document = await document.delete() // new document instance with deleted flag set
                API_RESPONSE.OK(document.parse()).send(res)
            },
            res
        )
    })

export default router