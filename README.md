# Class Project – Job Matching Platform

A clean starter repo configured for a 6-person class team. It includes:
- Protected `main` branch, PR reviews, and CI placeholder
- Issue & PR templates
- Suggested labels and a Kanban project workflow
- Clear branching/commit rules

> Replace placeholders like `@user1` … `@user6`, `your-org/your-repo`, etc.

## Tech-agnostic
Use any stack. The CI workflow currently just runs a placeholder script so status checks pass until you add real tests.

## Quick Start
1. **Create repo**
   ```bash
   gh repo create your-org/your-repo --public --source=. --remote=origin --push
   ```
2. **Add your classmates as collaborators (or use an org team).**
3. **Create labels & project board** using the commands in `docs/project-setup.md`.
4. **Protect `main`** (see `docs/branch-protection.md`).

## Workflow (TL;DR)
- Create an **Issue** for every task.
- Branch from `main`: `git checkout -b feat/123-candidate-swipes` (use the Issue number).
- **Conventional commits** (e.g., `feat: add swipe deck`).
- Open a **Draft PR** early; link the issue (e.g., `Closes #123`).
- Another developer **must pull and test locally**, then approve.
- CI must pass. Squash-merge with a clean title.

See **CONTRIBUTING.md** for the full policy.

