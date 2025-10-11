// Swagger API Documentation Configuration
// Auto-generated API documentation

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Homestay Management API",
      version: "1.0.0",
      description: "Comprehensive API for Homestay Management System",
      contact: {
        name: "Homestay Development Team",
        email: "dev@homestay.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
        description: "Development server",
      },
      {
        url: "https://api.homestay.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            full_name: { type: "string", example: "John Doe" },
            phone: { type: "string", example: "0123456789" },
            role: {
              type: "string",
              enum: ["customer", "staff", "admin"],
              example: "customer",
            },
            avatar: {
              type: "string",
              example: "https://example.com/avatar.jpg",
            },
            is_active: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Room: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            room_number: { type: "string", example: "101" },
            room_type: {
              type: "string",
              enum: ["single", "double", "suite", "family"],
              example: "single",
            },
            capacity: { type: "integer", minimum: 1, maximum: 10, example: 2 },
            price_per_night: { type: "number", minimum: 0, example: 500000 },
            description: {
              type: "string",
              example: "Comfortable single room with city view",
            },
            amenities: {
              type: "array",
              items: { type: "string" },
              example: ["wifi", "air_conditioning"],
            },
            images: {
              type: "array",
              items: { type: "string" },
              example: ["room1.jpg", "room2.jpg"],
            },
            status: {
              type: "string",
              enum: ["available", "occupied", "maintenance"],
              example: "available",
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            room_id: { type: "integer", example: 1 },
            check_in_date: {
              type: "string",
              format: "date",
              example: "2024-01-15",
            },
            check_out_date: {
              type: "string",
              format: "date",
              example: "2024-01-17",
            },
            guests_count: { type: "integer", minimum: 1, example: 2 },
            status: {
              type: "string",
              enum: [
                "pending",
                "confirmed",
                "checked_in",
                "completed",
                "cancelled",
              ],
              example: "confirmed",
            },
            total_amount: { type: "number", minimum: 0, example: 1000000 },
            special_requests: {
              type: "string",
              example: "Late check-in requested",
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Service: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Airport Transfer" },
            description: {
              type: "string",
              example: "Comfortable airport transfer service",
            },
            price: { type: "number", minimum: 0, example: 200000 },
            category: {
              type: "string",
              enum: ["food", "tour", "transport", "other"],
              example: "transport",
            },
            is_active: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            booking_id: { type: "integer", example: 1 },
            amount: { type: "number", minimum: 0, example: 1000000 },
            payment_method: {
              type: "string",
              enum: ["cash", "card", "vnpay", "momo"],
              example: "vnpay",
            },
            status: {
              type: "string",
              enum: ["pending", "completed", "failed", "refunded"],
              example: "completed",
            },
            transaction_id: { type: "string", example: "TXN123456789" },
            notes: { type: "string", example: "Payment for booking #1" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            user_id: { type: "integer", example: 1 },
            booking_id: { type: "integer", example: 1 },
            room_id: { type: "integer", example: 1 },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comment: {
              type: "string",
              example: "Excellent service and comfortable stay!",
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                name: { type: "string", example: "ValidationError" },
                message: { type: "string", example: "Validation failed" },
                statusCode: { type: "integer", example: 400 },
                timestamp: { type: "string", format: "date-time" },
              },
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            data: { type: "object" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Data retrieved successfully" },
            data: {
              type: "object",
              properties: {
                pagination: {
                  type: "object",
                  properties: {
                    page: { type: "integer", example: 1 },
                    limit: { type: "integer", example: 10 },
                    total: { type: "integer", example: 100 },
                    pages: { type: "integer", example: 10 },
                  },
                },
              },
            },
            timestamp: { type: "string", format: "date-time" },
          },
        },
      },
      parameters: {
        PageParam: {
          name: "page",
          in: "query",
          description: "Page number for pagination",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
          },
        },
        LimitParam: {
          name: "limit",
          in: "query",
          description: "Number of items per page",
          required: false,
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 10,
          },
        },
        IdParam: {
          name: "id",
          in: "path",
          description: "Resource ID",
          required: true,
          schema: {
            type: "integer",
            minimum: 1,
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Bad Request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        Unauthorized: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        Forbidden: {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        NotFound: {
          description: "Not Found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        InternalError: {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "Users",
        description: "User management operations",
      },
      {
        name: "Rooms",
        description: "Room management operations",
      },
      {
        name: "Bookings",
        description: "Booking management operations",
      },
      {
        name: "Payments",
        description: "Payment processing operations",
      },
      {
        name: "Services",
        description: "Service management operations",
      },
      {
        name: "Reviews",
        description: "Review and rating operations",
      },
      {
        name: "Reports",
        description: "Analytics and reporting operations",
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js", "./models/*.js"],
};

const specs = swaggerJsdoc(options);

const swaggerConfig = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0; }
    .swagger-ui .info .title { color: #3b82f6; }
  `,
  customSiteTitle: "Homestay API Documentation",
  customfavIcon: "/assets/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "none",
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
  },
};

module.exports = {
  specs,
  swaggerUi,
  swaggerConfig,
};
