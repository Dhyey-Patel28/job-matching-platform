# Branch Protection (Recommended)

Protect `main` so only reviewed, tested PRs are merged.

## GitHub UI (simple)
Settings → Branches → Add rule for `main`:
- Require a pull request before merging
  - Require approvals: **1**
  - Require review from Code Owners: **ON**
  - Dismiss stale approvals when new commits are pushed: **ON**
- Require status checks to pass before merging: **ON**
  - Required checks: `ci`
  - Require branches to be up to date before merging: **ON**
- Require signed commits: optional
- Allow squash merging only
- Restrict who can push to matching branches: **ON** (Admins only)

## GitHub CLI (advanced)
```bash
gh api   -X PUT   -H "Accept: application/vnd.github+json"   "/repos/your-org/your-repo/branches/main/protection"   -f required_status_checks.strict=true   -f required_status_checks.contexts[]="ci"   -f enforce_admins=true   -F required_pull_request_reviews='{"required_approving_review_count":1,"require_code_owner_reviews":true,"dismiss_stale_reviews":true}'   -F restrictions='null'
```
