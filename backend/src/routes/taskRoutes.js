import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import prisma from "../lib/prisma.js";
import {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
  getOverdueTasks,
} from "../controllers/taskController.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// User-specific task routes (defined before parameterized routes)
router.get("/my-tasks", getMyTasks);
router.get("/overdue", getOverdueTasks);

// Project-scoped task routes
router.get("/project/:projectId", getProjectTasks);
router.post("/project/:projectId", createTask);

// Individual task routes
router.put("/:id", updateTask);

// Delete requires project admin — look up task to find projectId first
router.delete("/:id", async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      select: { projectId: true },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Task not found.",
      });
    }

    // Attach projectId so requireProjectAdmin can find it
    req.params.projectId = task.projectId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Server error while looking up task.",
    });
  }
}, async (req, res, next) => {
  // Inline requireProjectAdmin using the resolved projectId
  const projectId = req.params.projectId;
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: req.user.id,
        projectId,
      },
    },
  });

  if (!membership || membership.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      data: null,
      message: "Access denied. Project admin role required.",
    });
  }

  next();
}, deleteTask);

export default router;
