import type { NextApiRequest, NextApiResponse } from 'next';

let cachedSpec: any = null;
let lastGenerated = 0;
const CACHE_TTL = 60000; // Cache for 1 minute in development

async function generateSpec() {
  // Check cache
  if (cachedSpec && Date.now() - lastGenerated < CACHE_TTL) {
    return cachedSpec;
  }

  try {
    // Dynamically require swagger-jsdoc
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
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string', format: 'email' },
                name: { type: 'string' },
                role: { type: 'string', enum: ['ADMIN', 'MANAGER', 'USER', 'GUEST'] },
                is_active: { type: 'boolean' },
                last_login: { type: 'string', format: 'date-time', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
              },
              required: ['id', 'email', 'name', 'role', 'is_active', 'created_at', 'updated_at'],
            },
            Product: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                code: { type: 'string' },
                name: { type: 'string' },
                slug: { type: 'string' },
                shortDescription: { type: 'string' },
                description: { type: 'string' },
                categoryId: { type: 'string', format: 'uuid', nullable: true },
                isFeatured: { type: 'boolean' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
              required: ['id', 'code', 'name', 'slug', 'isActive', 'createdAt', 'updatedAt'],
            },
            Category: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                slug: { type: 'string' },
                description: { type: 'string', nullable: true },
                displayOrder: { type: 'integer' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
              required: ['id', 'name', 'slug', 'displayOrder', 'isActive', 'createdAt', 'updatedAt'],
            },
          },
        },
      },
      apis: ['./pages/api/**/*.ts'],
    };

    cachedSpec = swaggerJsdoc(options);
    lastGenerated = Date.now();
    return cachedSpec;
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const spec = await generateSpec();
    res.status(200).json(spec);
  } catch (error) {
    console.error('Error reading OpenAPI spec:', error);
    res.status(500).json({ error: 'Failed to load OpenAPI specification' });
  }
}
