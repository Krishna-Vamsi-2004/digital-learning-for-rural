# Deployment Guide

## Overview
This guide covers deploying the Nabha Learning Platform to various environments.

## Quick Deploy to Vercel

1. **Connect to Vercel**
   \`\`\`bash
   npm install -g vercel
   vercel login
   vercel --prod
   \`\`\`

2. **Environment Variables**
   Set these in your Vercel dashboard:
   - `NODE_ENV=production`
   - `NEXT_TELEMETRY_DISABLED=1`

## Docker Deployment

1. **Build and run with Docker**
   \`\`\`bash
   docker build -t nabha-learning-platform .
   docker run -p 3000:3000 nabha-learning-platform
   \`\`\`

2. **Using Docker Compose**
   \`\`\`bash
   docker-compose up -d
   \`\`\`

## Manual Deployment

1. **Build the application**
   \`\`\`bash
   npm install
   npm run build
   npm start
   \`\`\`

2. **Static Export (for CDN)**
   \`\`\`bash
   npm run export
   # Deploy the 'out' folder to your CDN
   \`\`\`

## Environment Configuration

### Production Environment Variables
\`\`\`env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_URL=https://your-domain.com
\`\`\`

### Development Environment Variables
\`\`\`env
NODE_ENV=development
NEXT_PUBLIC_DEV_URL=http://localhost:3000
\`\`\`

## Performance Optimizations

- **Image Optimization**: Configured for WebP and AVIF formats
- **Compression**: Gzip enabled for all text assets
- **Caching**: Static assets cached for 1 year
- **Security Headers**: CSP, HSTS, and other security headers configured
- **Service Worker**: Offline functionality with proper cache headers

## Monitoring and Health Checks

- Health check endpoint: `/api/health`
- Uptime monitoring recommended
- Error tracking with Vercel Analytics enabled

## SSL/TLS Configuration

For custom domains:
1. Add SSL certificate to nginx configuration
2. Update domain in next.config.mjs
3. Configure DNS records

## Scaling Considerations

- Use CDN for static assets
- Enable database connection pooling
- Consider Redis for session storage
- Implement rate limiting for API endpoints

## Troubleshooting

Common issues and solutions:
- Service Worker MIME type errors: Check nginx configuration
- Build failures: Verify all dependencies are installed
- Performance issues: Enable compression and caching
