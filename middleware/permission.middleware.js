const AppError = require("../utilite/appError.utilite");

exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("You are not authenticated", 401));
    }

    const permissions = {
      doctor: ["patients", "appointments", "visits", "doctor.profile"],

      receptionist: ["patients", "appointments"],

      accountant: ["patients", "invoices"],

      nurse: ["patients", "appointments", "visits"],
    };

    const userRole = req.user.role?.toLowerCase();

    // Admin has access to everything
    if (userRole === "admin") {
      return next();
    }

    // Check if the role exists
    if (!permissions[userRole]) {
      return next(new AppError("Invalid role", 403));
    }

    // Check if the role has the required permission
    if (!permissions[userRole].includes(permission)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};
