# TrackJS Script Deployment Setup

This document explains how to set up the GitHub workflow for automatically deploying the TrackJS script to Cloudflare R2 buckets.

## Overview

The workflow `.github/workflows/deploy_trackjs.yml` automatically:

1. Downloads the latest TrackJS script from `https://cdn.trackjs.com/agent/v3/latest/t.js`
2. Uploads it to Cloudflare R2 buckets for multiple domains
3. Makes it accessible at:
   - `https://assets.deriv.com/tracking/trackjs.js`
   - `https://assets.deriv.ae/tracking/trackjs.js`

## Prerequisites

### Cloudflare R2 Custom Domain Configuration

Before the workflow can make files accessible via `https://assets.deriv.com/tracking/trackjs.js`, you need to configure custom domains for your R2 buckets:

#### For deriv.com:

1. In Cloudflare Dashboard, go to **R2 Object Storage**
2. Select your bucket for deriv.com assets
3. Go to **Settings** → **Custom Domains**
4. Click **Connect Domain**
5. Enter `assets.deriv.com` as the custom domain
6. Follow the DNS configuration steps to point `assets.deriv.com` to your R2 bucket

#### For deriv.ae:

1. Repeat the same process for your deriv.ae R2 bucket
2. Connect `assets.deriv.ae` as the custom domain
3. Configure DNS for `assets.deriv.ae`

**Important**: Without custom domain configuration, files will only be accessible via the default R2 URLs (e.g., `https://pub-xxxxx.r2.dev/tracking/trackjs.js`), not the branded URLs like `https://assets.deriv.com/tracking/trackjs.js`.

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository settings (these are the same secrets used by the existing sitemap workflow):

### Cloudflare R2 Authentication

- `R2_ACCOUNT_ID` - Your Cloudflare R2 account ID
- `R2_ACCESS_KEY_ID` - Your Cloudflare R2 access key ID
- `R2_SECRET_ACCESS_KEY` - Your Cloudflare R2 secret access key

### Domain-specific Configuration

#### For deriv.com

- `R2_BUCKET_NAME` - R2 bucket name for deriv.com assets (must have `assets.deriv.com` custom domain configured)

#### For deriv.ae

- `R2_BUCKET_NAME_AE` - R2 bucket name for deriv.ae assets (must have `assets.deriv.ae` custom domain configured)

## How to Set Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and corresponding value

## Workflow Triggers

The workflow runs:

- **Weekly on Mondays at 2 AM UTC** - Automatically checks for updates to the TrackJS script
- **Manual trigger** - You can manually run the workflow from the Actions tab

## Cost Optimization

To minimize GitHub Actions usage and associated costs, the workflow includes several optimizations:

- **Weekly Schedule**: Runs weekly instead of daily to reduce frequency
- **Change Detection**: Compares the downloaded script with the currently deployed version
- **Conditional Deployment**: Only uploads and deploys if the script has actually changed
- **Early Exit**: Skips deployment jobs entirely if no changes are detected

This means the workflow will only consume significant resources when TrackJS actually releases updates, rather than running full deployments every time.

## Workflow Features

### Multi-Job Architecture

The workflow uses a multi-job architecture:

1. **Download Job**: Downloads the TrackJS script once and prepares it for both domains
2. **Deploy Jobs**: Separate parallel jobs for each domain (deriv.com and deriv.ae)
3. **Notification Job**: Reports the final status of all deployments

### Verification

After upload, the workflow verifies that the script is accessible at the expected URLs and reports the status.

### Error Handling

- Validates successful download of the TrackJS script
- Checks for proper upload to R2 buckets
- Provides clear error messages for troubleshooting
- Reports individual job status in the final notification

### Reuses Existing Infrastructure

The workflow leverages the existing `.github/actions/upload_to_r2` action used by the sitemap workflow, ensuring consistency with existing deployment processes.

## Adding New Domains

To add support for additional domains:

1. Create a new deploy job in `.github/workflows/deploy_trackjs.yml`:

   ```yaml
   deploy-your-new-domain:
     needs: download-trackjs
     runs-on: ubuntu-latest
     steps:
       - name: Checkout repository
         uses: actions/checkout@v4

       - name: Download artifacts
         uses: actions/download-artifact@v4
         with:
           name: trackjs-files
           path: content/

       - name: Prepare your-new-domain content
         run: |
           rm -rf content/deriv.com
           mv content/your-new-domain content/deriv.com
           echo "Prepared your-new-domain content for upload"

       - name: Upload to R2 - your-new-domain
         uses: ./.github/actions/upload_to_r2
         with:
           r2_account_id: ${{ secrets.R2_ACCOUNT_ID }}
           r2_access_key_id: ${{ secrets.R2_ACCESS_KEY_ID }}
           r2_secret_access_key: ${{ secrets.R2_SECRET_ACCESS_KEY }}
           r2_bucket_name: ${{ secrets.R2_BUCKET_NAME_YOUR_NEW_DOMAIN }}
   ```

2. Update the download job to prepare content for the new domain:

   ```bash
   mkdir -p content/your-new-domain/tracking
   cp trackjs.js content/your-new-domain/tracking/trackjs.js
   ```

3. Update the notify-completion job to include the new deploy job:

   ```yaml
   needs: [deploy-deriv-com, deploy-deriv-ae, deploy-your-new-domain]
   ```

4. Add the corresponding R2 bucket secret to GitHub repository settings

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**: Check that your R2 access keys have the correct permissions
2. **404 Not Found**: Verify that the bucket names are correct
3. **Script Not Accessible via Custom Domain**:
   - Ensure custom domains (`assets.deriv.com`, `assets.deriv.ae`) are properly configured in Cloudflare R2
   - Check DNS records are pointing to the correct R2 bucket endpoints
   - Verify SSL certificates are active for the custom domains
4. **Files Accessible via R2 URL but not Custom Domain**:
   - Check if custom domain DNS propagation is complete (can take up to 24 hours)
   - Verify the custom domain is connected to the correct R2 bucket
5. **Upload Action Fails**: Ensure the existing `.github/actions/upload_to_r2` action is properly configured
6. **CDN Propagation Delay**: Custom domain changes may take a few minutes to propagate

### Manual Verification

You can manually verify the deployment by checking:

- `https://assets.deriv.com/tracking/trackjs.js`
- `https://assets.deriv.ae/tracking/trackjs.js`

Both should return the TrackJS script content with appropriate headers.

## Security Considerations

- All sensitive information is stored as GitHub secrets
- The workflow uses the principle of least privilege
- R2 access keys should only have permissions for the specific buckets used
- Consider rotating access keys periodically

## Monitoring

The workflow provides detailed logging and status updates. Check the Actions tab in your GitHub repository to monitor deployment status and troubleshoot any issues.

## Workflow Architecture

The workflow consists of three main phases:

1. **Download Phase**: Downloads the TrackJS script from the CDN and prepares it for deployment
2. **Deploy Phase**: Parallel deployment to both deriv.com and deriv.ae R2 buckets
3. **Notification Phase**: Reports the overall success or failure of the deployment

This architecture ensures efficient resource usage while maintaining reliability and clear error reporting.
