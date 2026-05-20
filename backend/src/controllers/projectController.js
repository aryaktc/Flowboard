import prisma from "../lib/prisma.js";

export const getProjects = async (req, res) => {
  try {
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true },
    });

    const projectIds = memberships.map((m) => m.projectId);

    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: {
        _count: {
          select: {
            members: true,
            tasks: true,
          },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: projects,
      message: "Projects retrieved successfully.",
    });
  } catch (error) {
    console.error("GetProjects error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while fetching projects.",
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Project name is required.",
      });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description || null,
        color: color || "#6366F1",
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true, tasks: true },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "Created project",
        userId: req.user.id,
        projectId: project.id,
      },
    });

    return res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully.",
    });
  } catch (error) {
    console.error("CreateProject error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while creating the project.",
    });
  }
};

export const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: id,
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

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Project not found.",
      });
    }

    const taskSummary = await prisma.task.groupBy({
      by: ["status"],
      where: { projectId: id },
      _count: { status: true },
    });

    const tasksByStatus = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };

    taskSummary.forEach((group) => {
      tasksByStatus[group.status] = group._count.status;
    });

    return res.status(200).json({
      success: true,
      data: {
        ...project,
        tasksByStatus,
      },
      message: "Project retrieved successfully.",
    });
  } catch (error) {
    console.error("GetProject error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while fetching the project.",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Project not found.",
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true, tasks: true },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "Updated project details",
        userId: req.user.id,
        projectId: id,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedProject,
      message: "Project updated successfully.",
    });
  } catch (error) {
    console.error("UpdateProject error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while updating the project.",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Project not found.",
      });
    }

    await prisma.project.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      data: null,
      message: `Project "${project.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("DeleteProject error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while deleting the project.",
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Email is required.",
      });
    }

    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Project not found.",
      });
    }

    const userToAdd = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found with that email.",
      });
    }

    const existingMembership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: userToAdd.id,
          projectId: id,
        },
      },
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "User is already a member of this project.",
      });
    }

    const membership = await prisma.projectMember.create({
      data: {
        userId: userToAdd.id,
        projectId: id,
        role: role === "ADMIN" ? "ADMIN" : "MEMBER",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Added ${userToAdd.name} to project`,
        userId: req.user.id,
        projectId: id,
      },
    });

    return res.status(201).json({
      success: true,
      data: membership,
      message: `${userToAdd.name} added to project successfully.`,
    });
  } catch (error) {
    console.error("AddMember error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while adding the member.",
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: id,
        },
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Membership not found.",
      });
    }

    const project = await prisma.project.findUnique({ where: { id } });

    if (project && project.ownerId === userId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Cannot remove the project owner.",
      });
    }

    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId,
          projectId: id,
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Removed ${membership.user.name} from project`,
        userId: req.user.id,
        projectId: id,
      },
    });

    return res.status(200).json({
      success: true,
      data: null,
      message: `${membership.user.name} removed from project successfully.`,
    });
  } catch (error) {
    console.error("RemoveMember error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while removing the member.",
    });
  }
};

export const getActivity = async (req, res) => {
  try {
    const { id } = req.params;

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.id,
          projectId: id,
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

    const activities = await prisma.activityLog.findMany({
      where: { projectId: id },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      data: activities,
      message: "Activity log retrieved successfully.",
    });
  } catch (error) {
    console.error("GetActivity error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while fetching activity logs.",
    });
  }
};
