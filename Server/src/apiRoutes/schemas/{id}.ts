import express, { Router, Request, Response } from "express"
import { API_FRAMEWORK } from "../../Framework/API_FRAMEWORK"
import { API_RESPONSE } from "../../Framework/API_RESPONSE"
import { Document, Hierarchy } from "../../Database"

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
                    json : any,
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
                const hierarchy : Hierarchy = await Hierarchy.get()
                hierarchy.removeDocument(document.route, document.type).update()
                API_RESPONSE.OK(document.parse()).send(res)
            },
            res
        )
    })

export default router