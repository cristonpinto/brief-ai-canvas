# Deployment Guide for Vercel

## Prerequisites

- GitHub account with this repository pushed
- Vercel account (sign up at https://vercel.com)

## Step-by-Step Deployment

### 1. Push to GitHub (if not already done)

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `cristonpinto/brief-ai-canvas`
3. Configure the project:

   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:

   - `VITE_SUPABASE_URL` = `https://dgzbxlcfrbiiszobihnd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnemJ4bGNmcmJpaXN6b2JpaG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjI5ODQsImV4cCI6MjA4MTUzODk4NH0.H6_p3hNO2S4v0lq74idRZW95-4NMS5jrg4bhU6A0_Z4`

5. Click **"Deploy"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? brief-ai-canvas
# - In which directory is your code? ./
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL production
# Paste: https://dgzbxlcfrbiiszobihnd.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: your-anon-key

# Deploy to production
vercel --prod
```

### 3. Configure Supabase for Production

After deployment, you need to add your Vercel domain to Supabase allowed URLs:

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/dgzbxlcfrbiiszobihnd
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to **Site URL** and **Redirect URLs**:
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/**`

### 4. Test Your Deployment

Visit your deployed URL and test:

- ✅ User authentication (login/signup)
- ✅ Document upload
- ✅ AI chat functionality
- ✅ Brief generation
- ✅ Dashboard displays correctly

## Environment Variables Reference

| Variable                 | Description                 | Example                                    |
| ------------------------ | --------------------------- | ------------------------------------------ |
| `VITE_SUPABASE_URL`      | Your Supabase project URL   | `https://dgzbxlcfrbiiszobihnd.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGc...`                               |

## Automatic Deployments

Vercel will automatically deploy:

- **Production:** Every push to `main` branch
- **Preview:** Every pull request

## Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. Don't forget to add the custom domain to Supabase URL configuration!

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### Authentication Issues

- Verify Vercel domain is added to Supabase allowed URLs
- Check that environment variables match Supabase project

### API/Function Errors

- Ensure Edge Functions are deployed in Supabase
- Verify CORS settings in Supabase allow your Vercel domain

## Monitoring

- **Vercel Analytics:** Automatically enabled for performance monitoring
- **Logs:** Available in Vercel dashboard under "Deployments" → "Logs"
- **Supabase Logs:** Check Edge Function logs in Supabase dashboard

---

**Deployment Checklist:**

- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked
- [ ] Environment variables configured
- [ ] Supabase URLs updated
- [ ] Successful deployment
- [ ] Authentication tested
- [ ] All features working
