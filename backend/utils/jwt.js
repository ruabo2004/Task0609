// JWT Utility Functions
// Enhanced implementation with comprehensive error handling

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Token blacklist for logout functionality (in production, use Redis)
const tokenBlacklist = new Set();

const jwtUtils = {
  // @desc    Generate access token with enhanced payload
  generateAccessToken: (payload) => {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }

      const tokenPayload = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        type: "access",
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomUUID(), // Unique token ID
      };

      return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "15m",
        issuer: process.env.JWT_ISSUER || "homestay-api",
        audience: process.env.JWT_AUDIENCE || "homestay-client",
      });
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  },

  // @desc    Generate refresh token
  generateRefreshToken: (payload) => {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }

      const tokenPayload = {
        id: payload.id,
        email: payload.email,
        type: "refresh",
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomUUID(),
      };

      return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
        issuer: process.env.JWT_ISSUER || "homestay-api",
        audience: process.env.JWT_AUDIENCE || "homestay-client",
      });
    } catch (error) {
      throw new Error(`Refresh token generation failed: ${error.message}`);
    }
  },

  // @desc    Verify token with enhanced validation
  verifyToken: (token) => {
    try {
      if (!token) {
        throw new Error("Token is required");
      }

      if (tokenBlacklist.has(token)) {
        throw new Error("Token has been revoked");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: process.env.JWT_ISSUER || "homestay-api",
        audience: process.env.JWT_AUDIENCE || "homestay-client",
      });

      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      } else if (error.name === "NotBeforeError") {
        throw new Error("Token not active");
      }
      throw error;
    }
  },

  // @desc    Verify refresh token specifically
  verifyRefreshToken: (token) => {
    try {
      const decoded = jwtUtils.verifyToken(token);

      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      throw new Error(`Refresh token verification failed: ${error.message}`);
    }
  },

  // @desc    Decode token without verification
  decodeToken: (token) => {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      throw new Error(`Token decode failed: ${error.message}`);
    }
  },

  // @desc    Generate token pair (access + refresh)
  generateTokenPair: (payload) => {
    try {
      const accessToken = jwtUtils.generateAccessToken(payload);
      const refreshToken = jwtUtils.generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: process.env.JWT_EXPIRE || "15m",
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
      };
    } catch (error) {
      throw new Error(`Token pair generation failed: ${error.message}`);
    }
  },

  // @desc    Blacklist token for logout
  blacklistToken: (token) => {
    try {
      tokenBlacklist.add(token);
      return true;
    } catch (error) {
      throw new Error(`Token blacklisting failed: ${error.message}`);
    }
  },

  // @desc    Check if token is blacklisted
  isTokenBlacklisted: (token) => {
    return tokenBlacklist.has(token);
  },

  // @desc    Extract token from Authorization header
  extractTokenFromHeader: (authHeader) => {
    try {
      if (!authHeader) {
        throw new Error("Authorization header is missing");
      }

      if (!authHeader.startsWith("Bearer ")) {
        throw new Error("Authorization header must start with 'Bearer '");
      }

      const token = authHeader.substring(7);
      if (!token) {
        throw new Error("Token is missing from Authorization header");
      }

      return token;
    } catch (error) {
      throw new Error(`Token extraction failed: ${error.message}`);
    }
  },

  // @desc    Get token expiration time
  getTokenExpiration: (token) => {
    try {
      const decoded = jwtUtils.decodeToken(token);
      return new Date(decoded.payload.exp * 1000);
    } catch (error) {
      throw new Error(`Token expiration check failed: ${error.message}`);
    }
  },

  // @desc    Check if token is about to expire (within 5 minutes)
  isTokenExpiringSoon: (token, thresholdMinutes = 5) => {
    try {
      const expiration = jwtUtils.getTokenExpiration(token);
      const now = new Date();
      const threshold = new Date(now.getTime() + thresholdMinutes * 60 * 1000);

      return expiration <= threshold;
    } catch (error) {
      return true; // Consider expired if we can't determine
    }
  },
};

module.exports = jwtUtils;
