const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// Set security headers
const securityHeaders = helmet();

// Prevent XSS attacks
const preventXSS = xss();

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Prevent http param pollution
const preventHPP = hpp();

// Sanitize data
const sanitizeData = mongoSanitize();

module.exports = {
  securityHeaders,
  preventXSS,
  limiter,
  preventHPP,
  sanitizeData
};