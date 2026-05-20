import prisma from "../lib/prisma.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's project IDs
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const projectIds = memberships.map((m) => m.projectId);

    // Total projects
    const totalProjects = projectIds.length;

    // Total tasks assigned to user
    const totalTasks = await prisma.task.count({
      where: { assigneeId: userId },
    });

    // Tasks by status (across user's assigned tasks)
    const tasksByStatusRaw = await prisma.task.groupBy({
      by: ["status"],
      where: { assigneeId: userId },
      _count: { status: true },
    });

    const tasksByStatus = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };

    tasksByStatusRaw.forEach((group) => {
      tasksByStatus[group.status] = group._count.status;
    });

    // Tasks by priority (across user's assigned tasks)
    const tasksByPriorityRaw = await prisma.task.groupBy({
      by: ["priority"],
      where: { assigneeId: userId },
      _count: { priority: true },
    });

    const tasksByPriority = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    tasksByPriorityRaw.forEach((group) => {
      tasksByPriority[group.priority] = group._count.priority;
    });

    // Overdue count
    const overdueCount = await prisma.task.count({
      where: {
        assigneeId: userId,
        dueDate: { lt: new Date() },
        status: { not: "DONE" },
      },
    });

    // Recent activity from user's projects
    const recentActivity = await prisma.activityLog.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        user: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Upcoming tasks (due in next 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
        status: { not: "DONE" },
      },
      include: {
        project: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    // Completed today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const completedToday = await prisma.task.count({
      where: {
        assigneeId: userId,
        status: "DONE",
        updatedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        tasksByStatus,
        tasksByPriority,
        overdueCount,
        recentActivity,
        upcomingTasks,
        completedToday,
      },
      message: "Dashboard data retrieved successfully.",
    });
  } catch (error) {
    console.error("GetDashboard error:", error);
    return res.status(500).json({
      success: false,
      data: null,
      message: "An unexpected error occurred while fetching dashboard data.",
    });
  }
};
