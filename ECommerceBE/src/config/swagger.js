import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import env from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce Backend REST API',
      version: '1.0.0',
      description: 'Comprehensive REST API documentation for the E-Commerce platform. Built with Node, Express, MongoDB, and Razorpay.',
    },
    servers: [
      {
        url: '/',
        description: 'Current Host (Dynamic)',
      },
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local server (Explicit)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Input your JWT Bearer token here.'
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      "/api/v1/health": {
        "get": {
          "tags": ["System"],
          "summary": "Health check status",
          "responses": {
            "200": {
              "description": "System is healthy",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean", "example": true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/v1/auth/register": {
        "post": {
          "tags": ["Auth"],
          "summary": "Register a new user",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["name", "email", "password"],
                  "properties": {
                    "name": { "type": "string", "example": "John Doe" },
                    "email": { "type": "string", "example": "john.doe@example.com" },
                    "password": { "type": "string", "example": "Password123!" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User registered successfully"
            },
            "409": {
              "description": "User already exists"
            }
          }
        }
      },
      "/api/v1/auth/login": {
        "post": {
          "tags": ["Auth"],
          "summary": "User Login",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["email", "password"],
                  "properties": {
                    "email": { "type": "string", "example": "john.doe@example.com" },
                    "password": { "type": "string", "example": "Password123!" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Login successful, tokens returned"
            },
            "401": {
              "description": "Invalid credentials"
            }
          }
        }
      },
      "/api/v1/products": {
        "get": {
          "tags": ["Products"],
          "summary": "List all products",
          "responses": {
            "200": {
              "description": "Products retrieved successfully"
            }
          }
        }
      },
      "/api/v1/cart": {
        "get": {
          "tags": ["Cart"],
          "summary": "Get user cart",
          "security": [{ "bearerAuth": [] }],
          "responses": {
            "200": { "description": "Cart details" }
          }
        },
        "post": {
          "tags": ["Cart"],
          "summary": "Add item to cart",
          "security": [{ "bearerAuth": [] }],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["productId", "quantity"],
                  "properties": {
                    "productId": { "type": "string", "example": "productId123" },
                    "quantity": { "type": "integer", "example": 1 }
                  }
                }
              }
            }
          },
          "responses": {
            "200": { "description": "Item added successfully" }
          }
        }
      },
      "/api/v1/checkout": {
        "post": {
          "tags": ["Checkout"],
          "summary": "Checkout the cart items",
          "security": [{ "bearerAuth": [] }],
          "parameters": [
            {
              "name": "idempotency-key",
              "in": "header",
              "required": true,
              "schema": { "type": "string" },
              "description": "Unique idempotency UUID"
            }
          ],
          "responses": {
            "201": { "description": "Checkout succeeded and order created" }
          }
        }
      },
      "/api/v1/orders/{orderNumber}/cancel": {
        "post": {
          "tags": ["Orders"],
          "summary": "Cancel an order",
          "security": [{ "bearerAuth": [] }],
          "parameters": [
            {
              "name": "orderNumber",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "responses": {
            "200": { "description": "Order cancelled successfully" }
          }
        }
      }
    }
  },
  apis: ['./src/api/v1/**/*.js', './src/api/v1/**/*.routes.js', './app.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export const serveDocs = swaggerUi.serve;
export const setupDocs = swaggerUi.setup(swaggerSpec);
