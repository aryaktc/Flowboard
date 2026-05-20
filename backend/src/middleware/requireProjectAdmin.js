import prisma from "../lib/prisma.js";

const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Project ID is required.",
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

    if (!membership || membership.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        data: null,
        message: "Access denied. Project admin role required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      message: "Server error while checking permissions.",
    });
  }
};

export default requireProjectAdmin;
