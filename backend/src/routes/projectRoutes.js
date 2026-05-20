import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import requireProjectAdmin from "../middleware/requireProjectAdmin.js";
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getActivity,
} from "../controllers/projectController.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.put("/:id", requireProjectAdmin, updateProject);
router.delete("/:id", requireProjectAdmin, deleteProject);
router.post("/:id/members", requireProjectAdmin, addMember);
router.delete("/:id/members/:userId", requireProjectAdmin, removeMember);
router.get("/:id/activity", getActivity);

export default router;
