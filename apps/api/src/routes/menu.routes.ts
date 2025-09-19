import { Router } from "express";
import * as menuController from "../controllers/menu.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, menuController.getMenu);

export default router;
