const rateLimit = require("express-rate-limit");

/*
|--------------------------------------------------------------------------
| General API Rate Limiter
|--------------------------------------------------------------------------
*/

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

/*
|--------------------------------------------------------------------------
| Authentication Rate Limiter
|--------------------------------------------------------------------------
|
| Login/register/forgot-password endpoints need stricter limits.
|
*/

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 20,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

/*
|--------------------------------------------------------------------------
| AI / Agent Rate Limiter
|--------------------------------------------------------------------------
*/

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 30,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message: "AI request limit reached. Please try again later.",
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  aiLimiter,
};