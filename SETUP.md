# GitHub Repository Setup

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Set repository name: `dsooverflow`
3. Set description: "DSO Overflow Podcast Website"
4. Choose Public or Private
5. **Do NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 2: Connect Local Repository

After creating the repository, run these commands (replace `YOUR_USERNAME` with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/dsooverflow.git
git branch -M main
git push -u origin main
```

## Step 3: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `BUZZSPROUT_API_KEY`
5. Value: Your Buzzsprout API key (`ccdf40d4cdad6b911ed5fdda86f48794`)
6. Click **Add secret**

## Step 4: Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will automatically deploy on the next push

## Step 5: Verify Deployment

After pushing, check:
- **Actions** tab to see the deployment workflow
- Your site will be available at: `https://YOUR_USERNAME.github.io/dsooverflow/`

## Custom Domain Setup (for dsooverflow.com)

1. In repository **Settings** → **Pages**, add your custom domain
2. Update DNS records as instructed by GitHub
3. Enable HTTPS (GitHub will provision a certificate)

