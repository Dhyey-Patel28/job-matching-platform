# Contributing Guide

## Branching
- Base branch: `main` (protected)
- Short-lived feature branches:
  - `feat/<issue#>-<kebab-title>`
  - `fix/<issue#>-<kebab-title>`
  - `docs/<issue#>-<kebab-title>`

Examples:
```
feat/42-candidate-preferences
fix/108-null-company-name
```

## Commit Style (Conventional Commits)
- `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`, `chore: ...`
- Scope optional: `feat(ui): card component`

## Issues → Tasks
- Use templates (`Bug report`, `Feature request`, `Task`).
- Add labels:
  - `type:bug`, `type:feature`, `type:docs`, `type:chore`
  - `priority:high|med|low`
  - `good first issue`, `help wanted`
- Anyone can **claim** by self-assigning.

## Project Board
Columns: **Backlog → Up Next → In Progress → In Review → Done**  
Cards move automatically when PRs are opened/merged if linked.

## Pull Requests
- Link related issue(s): `Closes #<id>`
- Title: concise; description includes *What/Why/How* + screenshots/logs
- Checks required:
  1) **CI status green**
  2) **1+ approving review**
  3) **Reviewer confirms they pulled & tested locally**

### Local Test Checklist (for reviewer)
- Fetch and checkout the branch:
  ```bash
  gh pr checkout <PR_NUMBER>   # or
  git fetch origin pull/<PR_NUMBER>/head:pr-<PR_NUMBER>
  git checkout pr-<PR_NUMBER>
  ```
- Run tests/build (replace with your stack):
  ```bash
  ./scripts/ci.sh
  ```
- Validate acceptance criteria from the issue.
- Add results in PR review comments.

## Merging
- **Squash and merge** (require linear history)
- Require branch up-to-date with `main`
- Delete branch after merge

## Code Style
- Respect `.editorconfig`
- Add/Update docs under `/docs` for user-facing flows
