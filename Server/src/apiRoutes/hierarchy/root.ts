import express, { Router, Request, Response } from "express"
import { API_FRAMEWORK } from "../../Framework/API_FRAMEWORK"
import { API_RESPONSE } from "../../Framework/API_RESPONSE"
import { Document } from "../../ts/Database"
import { updateHierarchy } from "../../ts/functions"

const router: Router = express.Router()

router.route("/")
    .get((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const json = (await Document.getHierarchyDocument()).json
                API_RESPONSE.OK(json).send(res)
            },
            res
        )
    })
    .post((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const route : string = req.body.route as string
                if (!route) {} // throw something
                const hierarchy : Document = await updateHierarchy(route)
                API_RESPONSE.CREATED(hierarchy.json).send(res)
            },
            res
        )
    })
    .delete((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const route = req.query.route as string
                if (!route) {} // throw something
                const hierarchy : Document = await updateHierarchy(route, "ROUTE", null, true)
                API_RESPONSE.CREATED(hierarchy.json).send(res)
            },
            res
        )
    })

export default router