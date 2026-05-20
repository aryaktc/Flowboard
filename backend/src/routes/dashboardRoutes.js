import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = Router();

router.get("/", authenticate, getDashboard);

export default router;
