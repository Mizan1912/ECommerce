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
      "/api/v1/auth/logout": {
        "post": {
          "tags": ["Auth"],
          "summary": "User Logout",
          "responses": {
            "200": {
              "description": "Logged out successfully"
            }
          }
        }
      },
      "/api/v1/auth/refresh": {
        "post": {
          "tags": ["Auth"],
          "summary": "Refresh Access Token",
          "responses": {
            "200": {
              "description": "Access token refreshed"
            },
            "401": {
              "description": "Invalid or expired refresh token"
            }
          }
        }
      },
      "/api/v1/auth/forgot-password": {
        "post": {
          "tags": ["Auth"],
          "summary": "Request password reset email",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["email"],
                  "properties": {
                    "email": { "type": "string", "example": "john.doe@example.com" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "If account exists, reset mail sent"
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
      "/api/v1/products/{slug}": {
        "get": {
          "tags": ["Products"],
          "summary": "Get a product by slug",
          "parameters": [
            {
              "name": "slug",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "responses": {
            "200": { "description": "Product detail" },
            "404": { "description": "Product not found" }
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
        },
        "delete": {
          "tags": ["Cart"],
          "summary": "Clear user cart",
          "security": [{ "bearerAuth": [] }],
          "responses": {
            "200": { "description": "Cart cleared successfully" }
          }
        }
      },
      "/api/v1/cart/{productId}": {
        "patch": {
          "tags": ["Cart"],
          "summary": "Update item quantity in cart",
          "security": [{ "bearerAuth": [] }],
          "parameters": [
            {
              "name": "productId",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["quantity"],
                  "properties": {
                    "quantity": { "type": "integer", "example": 2 }
                  }
                }
              }
            }
          },
          "responses": {
            "200": { "description": "Cart updated successfully" }
          }
        },
        "delete": {
          "tags": ["Cart"],
          "summary": "Remove item from cart",
          "security": [{ "bearerAuth": [] }],
          "parameters": [
            {
              "name": "productId",
              "in": "path",
              "required": true,
              "schema": { "type": "string" }
            }
          ],
          "responses": {
            "200": { "description": "Item removed successfully" }
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
      "/api/v1/orders": {
        "get": {
          "tags": ["Orders"],
          "summary": "Get customer's orders list",
          "security": [{ "bearerAuth": [] }],
          "responses": {
            "200": { "description": "Orders list" }
          }
        }
      },
      "/api/v1/orders/{orderNumber}": {
        "get": {
          "tags": ["Orders"],
          "summary": "Get order details",
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
            "200": { "description": "Order details" },
            "404": { "description": "Order not found" }
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
      },
      "/api/v1/payments/{orderNumber}": {
        "post": {
          "tags": ["Payments"],
          "summary": "Initiate Razorpay payment transaction",
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
            "200": { "description": "Payment transaction initiated successfully" }
          }
        }
      },
      "/api/v1/payments/webhook": {
        "post": {
          "tags": ["Payments"],
          "summary": "Razorpay payment webhook",
          "responses": {
            "200": { "description": "Webhook processed successfully" }
          }
        }
      },
      "/api/v1/admin/stats": {
        "get": {
          "tags": [
            "Admin"
          ],
          "summary": "Dashboard metrics (revenue, orders, inventory, users)",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "responses": {
            "200": {
              "description": "Aggregated store metrics"
            }
          }
        }
      },
      "/api/v1/admin/users": {
        "get": {
          "tags": [
            "Admin"
          ],
          "summary": "List users (paginated, searchable)",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "q",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "role",
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "customer",
                  "admin"
                ]
              }
            },
            {
              "name": "isActive",
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "true",
                  "false"
                ]
              }
            },
            {
              "name": "page",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated user list"
            }
          }
        }
      },
      "/api/v1/admin/users/{id}": {
        "get": {
          "tags": [
            "Admin"
          ],
          "summary": "Get a user with order count and lifetime spend",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "User detail"
            }
          }
        },
        "patch": {
          "tags": [
            "Admin"
          ],
          "summary": "Update a user name, role, or active state",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string"
                    },
                    "role": {
                      "type": "string",
                      "enum": [
                        "customer",
                        "admin"
                      ]
                    },
                    "isActive": {
                      "type": "boolean"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "User updated"
            }
          }
        },
        "delete": {
          "tags": [
            "Admin"
          ],
          "summary": "Delete a user who has no orders",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "User deleted"
            }
          }
        }
      },
      "/api/v1/admin/orders": {
        "get": {
          "tags": [
            "Admin"
          ],
          "summary": "List all orders (paginated, filterable)",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "q",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "paymentStatus",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "page",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated order list"
            }
          }
        }
      },
      "/api/v1/admin/orders/{id}": {
        "get": {
          "tags": [
            "Admin"
          ],
          "summary": "Order detail by id or order number, with payments and allowed transitions",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Order detail"
            }
          }
        }
      },
      "/api/v1/admin/orders/{id}/status": {
        "patch": {
          "tags": [
            "Admin"
          ],
          "summary": "Advance an order through the fulfillment state machine",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "status"
                  ],
                  "properties": {
                    "status": {
                      "type": "string",
                      "enum": [
                        "paid",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                        "refunded"
                      ]
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Order status updated"
            }
          }
        }
      },
      "/api/v1/admin/products": {
        "get": {
          "tags": [
            "Admin"
          ],
          "summary": "List products including deactivated ones",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "q",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "category",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "active",
                  "inactive",
                  "all"
                ]
              }
            },
            {
              "name": "stock",
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "low",
                  "out"
                ]
              }
            },
            {
              "name": "page",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated product list with categories"
            }
          }
        },
        "post": {
          "tags": [
            "Admin"
          ],
          "summary": "Create a product",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": [
                    "title",
                    "description",
                    "category",
                    "price",
                    "stock"
                  ],
                  "properties": {
                    "title": {
                      "type": "string"
                    },
                    "description": {
                      "type": "string"
                    },
                    "category": {
                      "type": "string"
                    },
                    "price": {
                      "type": "number"
                    },
                    "stock": {
                      "type": "integer"
                    },
                    "isActive": {
                      "type": "boolean"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Product created"
            }
          }
        }
      },
      "/api/v1/admin/products/{id}": {
        "get": {
          "tags": [
            "Admin"
          ],
          "summary": "Get a product by id",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Product detail"
            }
          }
        },
        "patch": {
          "tags": [
            "Admin"
          ],
          "summary": "Update a product",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Product updated"
            }
          }
        },
        "delete": {
          "tags": [
            "Admin"
          ],
          "summary": "Deactivate a product, or delete permanently with hard=true",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "hard",
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "true",
                  "false"
                ]
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Product deactivated or deleted"
            }
          }
        }
      },
      "/api/v1/admin/products/{id}/stock": {
        "patch": {
          "tags": [
            "Admin"
          ],
          "summary": "Adjust stock by a delta, or set an absolute count",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "delta": {
                      "type": "integer"
                    },
                    "stock": {
                      "type": "integer"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Stock updated"
            }
          }
        }
      },
      "/api/v1/admin/products/{id}/images": {
        "post": {
          "tags": [
            "Admin"
          ],
          "summary": "Upload up to 5 product images (JPEG, PNG, WEBP, 2MB each)",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "images": {
                      "type": "array",
                      "items": {
                        "type": "string",
                        "format": "binary"
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Images uploaded"
            }
          }
        }
      },
      "/api/v1/admin/products/{id}/images/{imageId}": {
        "delete": {
          "tags": [
            "Admin"
          ],
          "summary": "Delete a product image from Cloudinary and the product",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "imageId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Image deleted"
            }
          }
        }
      },
      "/api/v1/admin/products/{id}/images/{imageId}/primary": {
        "patch": {
          "tags": [
            "Admin"
          ],
          "summary": "Mark an image as the primary product image",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "id",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "imageId",
              "in": "path",
              "required": true,
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Primary image updated"
            }
          }
        }
      },
      "/api/v1/admin/payments": {
        "get": {
          "tags": [
            "Admin"
          ],
          "summary": "List payment attempts with their orders",
          "security": [
            {
              "bearerAuth": []
            }
          ],
          "parameters": [
            {
              "name": "q",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "status",
              "in": "query",
              "schema": {
                "type": "string",
                "enum": [
                  "pending",
                  "paid",
                  "failed",
                  "refunded"
                ]
              }
            },
            {
              "name": "page",
              "in": "query",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "limit",
              "in": "query",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Paginated payment list"
            }
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
