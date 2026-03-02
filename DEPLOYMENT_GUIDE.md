# Deployment Guide
## LA Union Skymall Property Management System

This guide covers deployment options for both the React frontend and Django backend.

---

## Table of Contents

1. [Frontend Deployment](#frontend-deployment)
   - [Vercel](#vercel-deployment)
   - [Netlify](#netlify-deployment)
   - [AWS S3 + CloudFront](#aws-s3--cloudfront)
   - [Docker](#docker-deployment)
2. [Backend Deployment](#backend-deployment)
   - [DigitalOcean](#digitalocean)
   - [AWS EC2](#aws-ec2)
   - [Heroku](#heroku)
   - [Railway](#railway)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [SSL/HTTPS Configuration](#sslhttps-configuration)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Frontend Deployment

### Prerequisites

1. Build the production bundle:
```bash
npm run build
```

This creates a `/dist` folder with optimized static files.

---

### Vercel Deployment

**Step 1:** Install Vercel CLI
```bash
npm install -g vercel
```

**Step 2:** Login to Vercel
```bash
vercel login
```

**Step 3:** Deploy
```bash
vercel --prod
```

**Step 4:** Configure environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add: `VITE_API_BASE_URL=https://api.yourdomain.com/api`

**vercel.json** configuration (optional):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

### Netlify Deployment

**Step 1:** Install Netlify CLI
```bash
npm install -g netlify-cli
```

**Step 2:** Login to Netlify
```bash
netlify login
```

**Step 3:** Deploy
```bash
netlify deploy --prod --dir=dist
```

**netlify.toml** configuration:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Environment Variables:**
- Go to Site Settings → Build & Deploy → Environment
- Add: `VITE_API_BASE_URL=https://api.yourdomain.com/api`

---

### AWS S3 + CloudFront

**Step 1:** Create S3 Bucket
```bash
aws s3 mb s3://skymall-frontend --region us-east-1
```

**Step 2:** Configure bucket for static website hosting
```bash
aws s3 website s3://skymall-frontend --index-document index.html --error-document index.html
```

**Step 3:** Upload build files
```bash
aws s3 sync dist/ s3://skymall-frontend --acl public-read
```

**Step 4:** Create CloudFront distribution
- Origin: Your S3 bucket
- Default Root Object: `index.html`
- Error Pages: Custom Error Response for 404 → /index.html (200)

**Step 5:** Configure HTTPS with ACM (AWS Certificate Manager)

---

### Docker Deployment

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Build and run:**
```bash
docker build -t skymall-frontend .
docker run -p 80:80 skymall-frontend
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=https://api.yourdomain.com/api
    restart: unless-stopped
```

---

## Backend Deployment

### Prerequisites

1. Set up PostgreSQL database
2. Configure environment variables
3. Collect static files
4. Run migrations

---

### DigitalOcean App Platform

**Step 1:** Create `app.yaml`
```yaml
name: skymall-backend

services:
  - name: web
    github:
      repo: your-username/skymall-backend
      branch: main
    build_command: |
      pip install -r requirements.txt
      python manage.py collectstatic --noinput
      python manage.py migrate
    run_command: gunicorn skymall.wsgi:application
    
    envs:
      - key: DEBUG
        value: "False"
      - key: SECRET_KEY
        scope: RUN_TIME
        type: SECRET
      - key: DATABASE_URL
        scope: RUN_TIME
        type: SECRET
      - key: ALLOWED_HOSTS
        value: ".ondigitalocean.app"
    
    http_port: 8000
    instance_count: 1
    instance_size_slug: basic-xxs

databases:
  - name: db
    engine: PG
    version: "15"
```

**Step 2:** Deploy
```bash
doctl apps create --spec app.yaml
```

---

### AWS EC2

**Step 1:** Launch EC2 instance (Ubuntu 22.04)

**Step 2:** SSH into instance
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

**Step 3:** Install dependencies
```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx postgresql postgresql-contrib
```

**Step 4:** Clone repository
```bash
git clone https://github.com/your-repo/skymall-backend.git
cd skymall-backend
```

**Step 5:** Set up virtual environment
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```

**Step 6:** Configure PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE skymall_db;
CREATE USER skymall_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE skymall_db TO skymall_user;
\q
```

**Step 7:** Run migrations
```bash
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
```

**Step 8:** Configure Gunicorn

Create `/etc/systemd/system/gunicorn.service`:
```ini
[Unit]
Description=Gunicorn daemon for Skymall
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/skymall-backend
ExecStart=/home/ubuntu/skymall-backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/home/ubuntu/skymall-backend/skymall.sock \
          skymall.wsgi:application

[Install]
WantedBy=multi-user.target
```

**Step 9:** Start Gunicorn
```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

**Step 10:** Configure Nginx

Create `/etc/nginx/sites-available/skymall`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        alias /home/ubuntu/skymall-backend/staticfiles/;
    }
    
    location /media/ {
        alias /home/ubuntu/skymall-backend/media/;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/ubuntu/skymall-backend/skymall.sock;
    }
}
```

**Step 11:** Enable site
```bash
sudo ln -s /etc/nginx/sites-available/skymall /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

---

### Heroku

**Step 1:** Install Heroku CLI
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

**Step 2:** Login
```bash
heroku login
```

**Step 3:** Create app
```bash
heroku create skymall-api
```

**Step 4:** Add PostgreSQL
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

**Step 5:** Create `Procfile`
```
web: gunicorn skymall.wsgi
release: python manage.py migrate
```

**Step 6:** Create `runtime.txt`
```
python-3.11.0
```

**Step 7:** Set environment variables
```bash
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=skymall-api.herokuapp.com
```

**Step 8:** Deploy
```bash
git push heroku main
```

---

### Railway

**Step 1:** Install Railway CLI
```bash
npm install -g @railway/cli
```

**Step 2:** Login
```bash
railway login
```

**Step 3:** Initialize project
```bash
railway init
```

**Step 4:** Add PostgreSQL
```bash
railway add
# Select PostgreSQL
```

**Step 5:** Deploy
```bash
railway up
```

**Step 6:** Set environment variables via Railway dashboard

---

## Database Setup

### Production PostgreSQL Configuration

**For AWS RDS:**
```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}
```

**Backup Strategy:**
```bash
# Daily backup cron job
0 2 * * * pg_dump -U skymall_user skymall_db > /backups/backup_$(date +\%Y\%m\%d).sql
```

---

## Environment Variables

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Backend (.env)
```env
# Django
DEBUG=False
SECRET_KEY=your-production-secret-key-here
ALLOWED_HOSTS=api.yourdomain.com,yourdomain.com

# Database
DB_NAME=skymall_db
DB_USER=skymall_user
DB_PASSWORD=your-secure-password
DB_HOST=your-db-host.com
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=your-email-password

# AWS S3 (for media files)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=skymall-media
AWS_S3_REGION_NAME=us-east-1
```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Free SSL)

**Step 1:** Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx
```

**Step 2:** Obtain certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Step 3:** Auto-renewal
```bash
sudo certbot renew --dry-run
```

### Using CloudFlare (Recommended)

1. Add your domain to CloudFlare
2. Update nameservers
3. Enable SSL/TLS (Full)
4. Enable "Always Use HTTPS"
5. Enable "Automatic HTTPS Rewrites"

---

## Post-Deployment Checklist

### Frontend
- [ ] Environment variables configured
- [ ] API URL points to production backend
- [ ] HTTPS enabled
- [ ] CDN configured (optional)
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Custom domain configured
- [ ] Build optimization verified
- [ ] Browser testing completed

### Backend
- [ ] Database migrations applied
- [ ] Static files collected
- [ ] Media files storage configured
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Debug mode disabled
- [ ] Secret key secured
- [ ] Database backups configured
- [ ] Logging configured
- [ ] Monitoring configured
- [ ] Rate limiting enabled
- [ ] Admin panel secured
- [ ] Superuser created

### Security
- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] CSRF protection enabled
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] Security headers configured
- [ ] File upload restrictions enforced
- [ ] Password policies enforced
- [ ] Session security configured

### Performance
- [ ] Caching configured (Redis)
- [ ] Database indexing optimized
- [ ] Static files compressed
- [ ] CDN configured
- [ ] Database connection pooling
- [ ] Query optimization completed
- [ ] Load testing performed

---

## Monitoring & Logging

### Frontend Monitoring (Sentry)

**Install Sentry:**
```bash
npm install @sentry/react
```

**Configure:**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### Backend Monitoring

**Install:**
```bash
pip install sentry-sdk
```

**Configure in settings.py:**
```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    environment="production",
    traces_sample_rate=1.0,
)
```

---

## Troubleshooting

### Common Issues

**Issue:** Static files not loading
```bash
# Solution
python manage.py collectstatic --clear
```

**Issue:** CORS errors
```python
# Solution: Check CORS_ALLOWED_ORIGINS in settings.py
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
]
```

**Issue:** Database connection failed
```bash
# Solution: Check DATABASE_URL and credentials
python manage.py check --database default
```

**Issue:** 502 Bad Gateway
```bash
# Solution: Check Gunicorn and Nginx status
sudo systemctl status gunicorn
sudo systemctl status nginx
```

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ALB, Nginx)
- Multiple Django instances with Gunicorn
- Redis for session storage
- Celery for background tasks

### Database Scaling
- Read replicas for queries
- Connection pooling (PgBouncer)
- Database indexing
- Query optimization

### Media Storage
- Use AWS S3 or CloudFront
- Separate media server
- CDN for static assets

---

For additional support, contact: devops@launionskymall.com
