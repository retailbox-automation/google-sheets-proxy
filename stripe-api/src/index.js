require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import routes
const customerRoutes = require('./routes/customers');
const invoiceRoutes = require('./routes/invoices');
const paymentRoutes = require('./routes/payments');

const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Swagger documentation
const swaggerDocs = swaggerJsdoc.swaggerSetup({
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Stripe API Proxy',
      version: '1.0.0',
      description: 'Proxy service for Stripe API integration with AI-Experts'
    },
    servers: [
      {
        url: process.env.HOST_URL || `http://localhost:${PORT}`
      }
    ],
    components: {},
    tags: [
      {
        name: 'Customers',
        description: 'Customer management operations'
      },
      {
        name: 'Invoices',
        description: 'Invoice management operations'
      },
      {
        name: 'Payments',
        description: 'Payments management operations'
      }
    ],
    paths: {}
  },
  apis: [customerRoutes, invoiceRoutes, paymentRoutes]
});

// Set middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  Va: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Authentication middleware
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Routes
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// OpenAPI specification
app.get('/api/openapi.json', (req, res) => {
  res.send(swaggerDocs);
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found'
  });
});

app.use((err, req, res, next) => {
  logger.error(`[${req.method} ${req.url}] ${err.message}`);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
