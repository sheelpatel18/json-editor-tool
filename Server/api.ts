import express from 'express';
import settings from "../settings.json"
import { Document } from './src/Database';

import hierarchyRouter from './src/apiRoutes/hierarchy/root';
import schemasRouter from './src/apiRoutes/schemas/root';
import mockRouter from './src/apiRoutes/mock/root';

const {
    DATABASE_TYPE
} = settings;


Document.databaseInit(DATABASE_TYPE)

const router = express.Router();

router.use("/hierarchy", hierarchyRouter);
router.use("/mock/*", mockRouter);
router.use("/schemas", schemasRouter);

export default router