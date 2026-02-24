const normalizeRole = (role) => (role === "hr" ? "hr_admin" : role);

export const authorizeRoles = (...roles) => {
  const allowed = new Set(roles.map(normalizeRole));

  return (req, res, next) => {
    const currentRole = normalizeRole(req.user?.role);
    if (!allowed.has(currentRole)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

export const isHR = authorizeRoles("hr_admin", "super_admin");
