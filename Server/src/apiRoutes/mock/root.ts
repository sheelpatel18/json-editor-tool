import express, { Router, Request, Response } from "express"
import { API_FRAMEWORK } from "../../Framework/API_FRAMEWORK"
import { API_RESPONSE } from "../../Framework/API_RESPONSE"
import { Document } from "../../ts/Database"
import { getJSONFromPath } from "../../ts/functions"

const router: Router = express.Router()

router.route("/")
    .all((req: Request, res: Response) => {
        API_FRAMEWORK(
            async () => {
                const json = await getJSONFromPath(req.originalUrl, req.method)
                API_RESPONSE.OK(json).send(res)
            },
            res
        )
    })

export default router