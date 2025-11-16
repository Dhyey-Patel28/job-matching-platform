# One-time Setup (CLI recipes)

> Requires [GitHub CLI](https://cli.github.com/) and admin rights on the repo.

## 1) Create Labels
```bash
gh label create "type:bug" --color FF0000 --description "Bug"
gh label create "type:feature" --color 0E8A16 --description "Feature"
gh label create "type:docs" --color 1D76DB --description "Docs"
gh label create "type:chore" --color BFD4F2 --description "Chore"
gh label create "priority:high" --color B60205
gh label create "priority:med" --color D93F0B
gh label create "priority:low" --color 0E8A16
gh label create "help wanted" --color 128A0C
gh label create "good first issue" --color 7057ff
```

## 2) Create Project Board (Kanban)
```bash
# Create a classic project (user or org level). For beta projects, use 'gh project'.
gh project create --name "Class Kanban" --body "Backlog → Up Next → In Progress → In Review → Done"
# Note: For org projects (recommended), run this in the org context.
```

## 3) Add Collaborators (if repo under a personal account)
```bash
gh repo add-collaborator your-org/your-repo --permission push user1
gh repo add-collaborator your-org/your-repo --permission push user2
# ...repeat for all six teammates
```

## 4) Link Issues ↔ PRs
- In PR description include: `Closes #<issue-number>` to auto-close on merge.
- Use the project board to track status.
