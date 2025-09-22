const express = require("express");
const router = express.Router();

/**
 * GET /api/images/placeholder/:width/:height
 * Generate placeholder image
 */
router.get("/placeholder/:width/:height", (req, res) => {
  const { width, height } = req.params;
  const w = parseInt(width) || 300;
  const h = parseInt(height) || 200;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Generate SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="10%" y="10%" width="80%" height="80%" fill="#e5e7eb" rx="8"/>
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="14" 
            fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
        Homestay Image
      </text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" 
            fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
        ${w} × ${h}
      </text>
    </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours
  res.send(svg);
});

/**
 * GET /api/images/room/:filename
 * Serve room images (with fallback to placeholder)
 */
router.get("/room/:filename", (req, res) => {
  const { filename } = req.params;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // For now, always return placeholder since we don't have real images
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <rect x="20" y="20" width="360" height="260" fill="none" stroke="white" stroke-width="2" rx="12"/>
      <circle cx="100" cy="80" r="30" fill="white" opacity="0.9"/>
      <rect x="150" y="50" width="200" height="60" fill="white" opacity="0.9" rx="8"/>
      <rect x="50" y="150" width="120" height="80" fill="white" opacity="0.7" rx="6"/>
      <rect x="200" y="150" width="150" height="80" fill="white" opacity="0.7" rx="6"/>
      <text x="200" y="200" font-family="Arial, sans-serif" font-size="16" 
            fill="white" text-anchor="middle" font-weight="bold">
        Homestay Room
      </text>
      <text x="200" y="220" font-family="Arial, sans-serif" font-size="12" 
            fill="white" text-anchor="middle" opacity="0.9">
        ${filename}
      </text>
    </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600"); // 1 hour
  res.send(svg);
});

module.exports = router;
