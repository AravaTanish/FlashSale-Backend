const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      throw new AppError("Forbidden", 403);
    }
    next();
  };
};

export default authorizeRole;
