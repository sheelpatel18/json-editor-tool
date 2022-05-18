import express, { Router, Request, Response } from "express"
import { API_FRAMEWORK } from "../../Framework/API_FRAMEWORK"
import { API_RESPONSE } from "../../Framework/API_RESPONSE"
import { Document, Hierarchy } from "../../Database"

const router: Router = express.Router()

router.route("/")
    .get((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const json = (await Hierarchy.get()).doc.json
                API_RESPONSE.OK(json).send(res)
            },
            res
        )
    })
    .post((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const route = req.query.route as string
                if (!route) {} // throw something
                const hierarchy : Hierarchy = await Hierarchy.get()
                await hierarchy.addRoute(route).update()
                API_RESPONSE.CREATED(hierarchy.doc.json).send(res)
            },
            res
        )
    })
    .delete((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const route = req.query.route as string
                if (!route) {} // throw something
                const hierarchy : Hierarchy = await Hierarchy.get()
                await hierarchy.removeRoute(route).update()
                API_RESPONSE.CREATED(hierarchy.doc.json).send(res)
            },
            res
        )
    })

export default router