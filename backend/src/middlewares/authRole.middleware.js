import ApiError from "../utils/apiError.js";
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      throw new ApiError(403, "Forbidden");
    }
    next();
  };
};

export default authorizeRole;
