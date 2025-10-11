// Staff Profile Controller
// Enhanced implementation for Employee Module

const { StaffProfile, User } = require("../models");
const { logger } = require("../utils/logger");
const responseHelper = require("../utils/responseHelper");
const { validateStaffProfile } = require("../utils/validation");

class StaffProfileController {
  // @desc    Create new staff profile
  // @route   POST /api/staff/profiles
  // @access  Admin
  static async createProfile(req, res) {
    try {
      logger.info("Creating staff profile", {
        body: req.body,
        user: req.user?.id,
      });

      // Validate input
      const validation = validateStaffProfile(req.body);
      if (!validation.isValid) {
        return responseHelper.validationError(res, validation.errors);
      }

      // Check if user exists and is staff
      const user = await User.findById(req.body.user_id);
      if (!user) {
        return responseHelper.notFound(res, "User not found");
      }

      if (user.role !== "staff") {
        return responseHelper.badRequest(res, "User must have staff role");
      }

      // Check if staff profile already exists
      const existingProfile = await StaffProfile.findByUserId(req.body.user_id);
      if (existingProfile) {
        return responseHelper.conflict(
          res,
          "Staff profile already exists for this user"
        );
      }

      // Generate unique employee ID if not provided
      if (!req.body.employee_id) {
        const dept = req.body.department.toUpperCase().substring(0, 3);
        const timestamp = Date.now().toString().slice(-6);
        req.body.employee_id = `${dept}${timestamp}`;
      }

      const profile = await StaffProfile.create(req.body);

      logger.info("Staff profile created successfully", {
        profileId: profile.id,
        employeeId: profile.employee_id,
      });

      return responseHelper.success(
        res,
        profile,
        "Staff profile created successfully",
        201
      );
    } catch (error) {
      logger.error("Error creating staff profile", error, {
        body: req.body,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to create staff profile");
    }
  }

  // @desc    Get all staff profiles with filters
  // @route   GET /api/staff/profiles
  // @access  Admin/Manager
  static async getAllProfiles(req, res) {
    try {
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        department: req.query.department,
        status: req.query.status,
        search: req.query.search,
      };

      logger.info("Getting all staff profiles", {
        filters,
        user: req.user?.id,
      });

      const result = await StaffProfile.getAll(filters);

      return responseHelper.success(
        res,
        result,
        "Staff profiles retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting staff profiles", error, {
        query: req.query,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve staff profiles");
    }
  }

  // @desc    Get staff profile by ID
  // @route   GET /api/staff/profiles/:id
  // @access  Admin/Manager/Staff(own)
  static async getProfileById(req, res) {
    try {
      const profileId = req.params.id;

      logger.info("Getting staff profile by ID", {
        profileId,
        user: req.user?.id,
      });

      const profile = await StaffProfile.findById(profileId);
      if (!profile) {
        return responseHelper.notFound(res, "Staff profile not found");
      }

      // Check permissions - staff can only view their own profile
      if (req.user.role === "staff" && profile.user_id !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      return responseHelper.success(
        res,
        profile,
        "Staff profile retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting staff profile", error, {
        profileId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve staff profile");
    }
  }

  // @desc    Get staff profile by employee ID
  // @route   GET /api/staff/profiles/employee/:employeeId
  // @access  Admin/Manager
  static async getProfileByEmployeeId(req, res) {
    try {
      const employeeId = req.params.employeeId;

      logger.info("Getting staff profile by employee ID", {
        employeeId,
        user: req.user?.id,
      });

      const profile = await StaffProfile.findByEmployeeId(employeeId);
      if (!profile) {
        return responseHelper.notFound(res, "Staff profile not found");
      }

      return responseHelper.success(
        res,
        profile,
        "Staff profile retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting staff profile by employee ID", error, {
        employeeId: req.params.employeeId,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve staff profile");
    }
  }

  // @desc    Get current user's staff profile
  // @route   GET /api/staff/profiles/me
  // @access  Staff
  static async getMyProfile(req, res) {
    try {
      logger.info("Getting current user's staff profile", {
        user: req.user?.id,
      });

      let profile = await StaffProfile.findByUserId(req.user.id);
      if (!profile) {
        // Auto-create basic staff profile if not exists
        const newProfileData = {
          user_id: req.user.id,
          employee_id: `EMP${req.user.id.toString().padStart(4, "0")}`,
          position: "Staff",
          department: "General",
          hire_date: new Date().toISOString().split("T")[0],
          salary: 0,
          status: "active",
        };

        profile = await StaffProfile.create(newProfileData);
        logger.info("Auto-created staff profile", { userId: req.user.id });
      }

      return responseHelper.success(
        res,
        profile,
        "Your staff profile retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting current user's staff profile", error, {
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve your staff profile");
    }
  }

  // @desc    Update staff profile
  // @route   PUT /api/staff/profiles/:id
  // @access  Admin/Manager
  static async updateProfile(req, res) {
    try {
      const profileId = req.params.id;

      logger.info("Updating staff profile", {
        profileId,
        body: req.body,
        user: req.user?.id,
      });

      const profile = await StaffProfile.findById(profileId);
      if (!profile) {
        return responseHelper.notFound(res, "Staff profile not found");
      }

      // Validate update data
      const validation = validateStaffProfile(req.body, false); // false = update mode
      if (!validation.isValid) {
        return responseHelper.validationError(res, validation.errors);
      }

      const updatedProfile = await profile.update(req.body);

      logger.info("Staff profile updated successfully", {
        profileId,
        employeeId: updatedProfile.employee_id,
      });

      return responseHelper.success(
        res,
        updatedProfile,
        "Staff profile updated successfully"
      );
    } catch (error) {
      logger.error("Error updating staff profile", error, {
        profileId: req.params.id,
        body: req.body,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to update staff profile");
    }
  }

  // @desc    Update staff permissions
  // @route   PUT /api/staff/profiles/:id/permissions
  // @access  Admin
  static async updatePermissions(req, res) {
    try {
      const profileId = req.params.id;
      const { permissions } = req.body;

      logger.info("Updating staff permissions", {
        profileId,
        permissions,
        user: req.user?.id,
      });

      const profile = await StaffProfile.findById(profileId);
      if (!profile) {
        return responseHelper.notFound(res, "Staff profile not found");
      }

      if (!permissions || typeof permissions !== "object") {
        return responseHelper.badRequest(
          res,
          "Valid permissions object is required"
        );
      }

      const updatedProfile = await profile.updatePermissions(permissions);

      logger.info("Staff permissions updated successfully", {
        profileId,
        employeeId: updatedProfile.employee_id,
      });

      return responseHelper.success(
        res,
        updatedProfile,
        "Staff permissions updated successfully"
      );
    } catch (error) {
      logger.error("Error updating staff permissions", error, {
        profileId: req.params.id,
        permissions: req.body.permissions,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to update staff permissions");
    }
  }

  // @desc    Get staff profiles by department
  // @route   GET /api/staff/profiles/department/:department
  // @access  Admin/Manager
  static async getProfilesByDepartment(req, res) {
    try {
      const department = req.params.department;

      logger.info("Getting staff profiles by department", {
        department,
        user: req.user?.id,
      });

      const profiles = await StaffProfile.findByDepartment(department);

      return responseHelper.success(
        res,
        profiles,
        `Staff profiles for ${department} department retrieved successfully`
      );
    } catch (error) {
      logger.error("Error getting staff profiles by department", error, {
        department: req.params.department,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve staff profiles");
    }
  }

  // @desc    Get staff overview (dashboard data)
  // @route   GET /api/staff/profiles/overview
  // @access  Admin/Manager
  static async getStaffOverview(req, res) {
    try {
      logger.info("Getting staff overview", { user: req.user?.id });

      const overview = await StaffProfile.getStaffOverview();

      return responseHelper.success(
        res,
        overview,
        "Staff overview retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting staff overview", error, {
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve staff overview");
    }
  }

  // @desc    Get staff work schedule
  // @route   GET /api/staff/profiles/:id/schedule
  // @access  Admin/Manager/Staff(own)
  static async getWorkSchedule(req, res) {
    try {
      const profileId = req.params.id;
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year) || new Date().getFullYear();

      logger.info("Getting staff work schedule", {
        profileId,
        month,
        year,
        user: req.user?.id,
      });

      const profile = await StaffProfile.findById(profileId);
      if (!profile) {
        return responseHelper.notFound(res, "Staff profile not found");
      }

      // Check permissions
      if (req.user.role === "staff" && profile.user_id !== req.user.id) {
        return responseHelper.forbidden(res, "Access denied");
      }

      const schedule = await profile.getWorkSchedule(month, year);

      return responseHelper.success(
        res,
        schedule,
        "Work schedule retrieved successfully"
      );
    } catch (error) {
      logger.error("Error getting work schedule", error, {
        profileId: req.params.id,
        month: req.query.month,
        year: req.query.year,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to retrieve work schedule");
    }
  }

  // @desc    Delete staff profile (soft delete)
  // @route   DELETE /api/staff/profiles/:id
  // @access  Admin
  static async deleteProfile(req, res) {
    try {
      const profileId = req.params.id;

      logger.info("Deleting staff profile", {
        profileId,
        user: req.user?.id,
      });

      const profile = await StaffProfile.findById(profileId);
      if (!profile) {
        return responseHelper.notFound(res, "Staff profile not found");
      }

      await profile.delete();

      logger.info("Staff profile deleted successfully", {
        profileId,
        employeeId: profile.employee_id,
      });

      return responseHelper.success(
        res,
        null,
        "Staff profile deleted successfully"
      );
    } catch (error) {
      logger.error("Error deleting staff profile", error, {
        profileId: req.params.id,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to delete staff profile");
    }
  }

  // @desc    Activate/Deactivate staff profile
  // @route   PATCH /api/staff/profiles/:id/status
  // @access  Admin/Manager
  static async updateStatus(req, res) {
    try {
      const profileId = req.params.id;
      const { status } = req.body;

      logger.info("Updating staff profile status", {
        profileId,
        status,
        user: req.user?.id,
      });

      const profile = await StaffProfile.findById(profileId);
      if (!profile) {
        return responseHelper.notFound(res, "Staff profile not found");
      }

      const validStatuses = ["active", "inactive", "on_leave"];
      if (!validStatuses.includes(status)) {
        return responseHelper.badRequest(
          res,
          "Invalid status. Must be: active, inactive, or on_leave"
        );
      }

      const updatedProfile = await profile.update({ status });

      logger.info("Staff profile status updated successfully", {
        profileId,
        status,
        employeeId: updatedProfile.employee_id,
      });

      return responseHelper.success(
        res,
        updatedProfile,
        `Staff profile status updated to ${status}`
      );
    } catch (error) {
      logger.error("Error updating staff profile status", error, {
        profileId: req.params.id,
        status: req.body.status,
        user: req.user?.id,
      });
      return responseHelper.error(res, "Failed to update staff profile status");
    }
  }
}

module.exports = {
  createProfile: StaffProfileController.createProfile,
  getAllProfiles: StaffProfileController.getAllProfiles,
  getProfileById: StaffProfileController.getProfileById,
  getProfileByEmployeeId: StaffProfileController.getProfileByEmployeeId,
  getMyProfile: StaffProfileController.getMyProfile,
  updateProfile: StaffProfileController.updateProfile,
  updatePermissions: StaffProfileController.updatePermissions,
  getProfilesByDepartment: StaffProfileController.getProfilesByDepartment,
  getStaffOverview: StaffProfileController.getStaffOverview,
  getWorkSchedule: StaffProfileController.getWorkSchedule,
  deleteProfile: StaffProfileController.deleteProfile,
  updateStatus: StaffProfileController.updateStatus,
};
