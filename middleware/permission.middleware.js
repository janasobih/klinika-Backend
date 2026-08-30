const Role = require("../model/role.model");
const AppError = require("../utilite/appError.utilite");

exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError("You are not authenticated", 401));
      }

      if (req.user.role === "admin") {
        return next();
      }

      const role = await Role.findOne({
        name: req.user.role,
      });

      if (!role) {
        return next(new AppError("Role not found", 403));
      }

      if (!role.permissions.includes(permission)) {
        return next(
          new AppError(
            "You do not have permission to perform this action",
            403,
          ),
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
