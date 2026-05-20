import prisma from "../lib/prisma.js";

export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigneeId } = req.query;

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Access denied. You are not a member of this project.",
      });
    }

    const where = { projectId };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: tasks,
      message: "Tasks retrieved successfully.",
    });
  } catch (error) {
    console.error("GetProjectTasks error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while fetching tasks.",
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } =
      req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Task title is required.",
      });
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Access denied. You are not a member of this project.",
      });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: req.user.id,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Created task: ${task.title}`,
        userId: req.user.id,
        projectId,
      },
    });

    return res.status(201).json({
      success: true,
      data: task,
      message: "Task created successfully.",
    });
  } catch (error) {
    console.error("CreateTask error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while creating the task.",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assigneeId } =
      req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Task not found.",
      });
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: existingTask.projectId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Access denied. You are not a member of this project.",
      });
    }

    const changes = [];
    if (title !== undefined && title !== existingTask.title)
      changes.push(`title to "${title}"`);
    if (status !== undefined && status !== existingTask.status)
      changes.push(`status to ${status}`);
    if (priority !== undefined && priority !== existingTask.priority)
      changes.push(`priority to ${priority}`);
    if (assigneeId !== undefined && assigneeId !== existingTask.assigneeId)
      changes.push("assignee");
    if (description !== undefined && description !== existingTask.description)
      changes.push("description");
    if (dueDate !== undefined) changes.push("due date");

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (changes.length > 0) {
      await prisma.activityLog.create({
        data: {
          action: `Updated task "${existingTask.title}": changed ${changes.join(", ")}`,
          userId: req.user.id,
          projectId: existingTask.projectId,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedTask,
      message: "Task updated successfully.",
    });
  } catch (error) {
    console.error("UpdateTask error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while updating the task.",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Task not found.",
      });
    }

    await prisma.task.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: `Deleted task: ${task.title}`,
        userId: req.user.id,
        projectId: task.projectId,
      },
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: `Task "${task.title}" deleted successfully.`,
    });
  } catch (error) {
    console.error("DeleteTask error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while deleting the task.",
    });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: req.user.id },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
        creator: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: tasks,
      message: "Your tasks retrieved successfully.",
    });
  } catch (error) {
    console.error("GetMyTasks error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while fetching your tasks.",
    });
  }
};

export const getOverdueTasks = async (req, res) => {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true },
    });

    const projectIds = memberships.map((m) => m.projectId);

    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        dueDate: { lt: new Date() },
        status: { not: "DONE" },
      },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: tasks,
      message: "Overdue tasks retrieved successfully.",
    });
  } catch (error) {
    console.error("GetOverdueTasks error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while fetching overdue tasks.",
    });
  }
};
