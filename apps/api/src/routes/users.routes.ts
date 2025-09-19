import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requirePermission } from "../middlewares/requirePermission.js";

const router = Router();

router.get("/", 
  requireAuth, 
  requirePermission("usuarios", "ver"),
  usersController.getAllUsers
);
router.get("/check-username", usersController.checkUsername);
router.post("/", 
  requireAuth, 
  requirePermission("usuarios", "crear"),
  usersController.createUser
);

export default router;
