# Stripe API Integration

Proxy-service for Stripe API integration with AI-Experts via OpenAPI Actions.

This service provides a simplified HTTP API for interacting with Stripe, using Service Account authentication and API Keys.

## Features

- Secure handling of Stripe API keys
- Simplified API for common Stripe operations:
  - Customers (create/read)
  - Invoices (create/read/send)
  - Payments (list/view)
  - Subscriptions (optional)
- OpenAPI specification for easy integration with AI-Experts platform
- Error handling and retries

## Setup

1. Clone the repository
2. Configure your Stripe API keys in `.env` file
3. Run `npm install` to install dependencies
4. Start the service with `npm start`

## Integration with AI-Experts

This service provides an OpenAPI specification that can be used to integrate with AI-Experts (LibreChat) platform. 

1. Run the service
2. Use the `/api/openapi.json` endpoint to get the OpenAPI specification
3. Import the specification into AI-Experts OpenAPI Actions
4. Configure authentication as needed

## Security Notes

The Stripe API keys are sensitive and should be kept secure. This service helps keep your Stripe API keys safe by: keeping them on the server-side and not exposing them to the client.