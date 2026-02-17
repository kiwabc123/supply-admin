const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Company API',
      version: '1.0.0',
      description: 'API documentation for Company API & Portal with authentication and product management',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'http://localhost:3001',
        description: 'Alternative development server',
      },
      {
        url: 'http://localhost:3002',
        description: 'Alternative development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'MANAGER', 'USER', 'GUEST'],
            },
            is_active: {
              type: 'boolean',
            },
            last_login: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['id', 'email', 'name', 'role', 'is_active', 'created_at', 'updated_at'],
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            code: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            shortDescription: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            isFeatured: {
              type: 'boolean',
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['id', 'code', 'name', 'slug', 'isActive', 'createdAt', 'updatedAt'],
        },
      },
    },
  },
  apis: ['./pages/api/**/*.ts'],
};

module.exports = swaggerJsdoc(options);
