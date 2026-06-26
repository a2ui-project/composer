---
trigger: model_decision
description: Git workflow rules, including atomic commits, formatting with prettier, and commit message formatting guidelines.
---

# Git Workflow & Commit Guidelines

## Task Execution & Formatting

- Each task must be a separate commit.
- Code must be properly formatted using the `yarn prettier` script before
  committing.
- Every commit must pass all tests (including existing tests and any newly added
  tests for the task).

## Package Management & Tooling

- Before running any package manager commands (e.g., `yarn install`,
  `yarn test`, `yarn build`), check the `packageManager` field in the root
  `package.json`.
- If the project specifies a modern package manager version (e.g., Yarn v2+) and
  the system default differs, you MUST use the appropriate wrapper (e.g.,
  `corepack yarn`) to execute commands and avoid corrupting lockfiles.
- Ensure `yarn.lock` (or equivalent lockfile) is resolved and committed using
  the correct package manager version.

## Runtime Environment & Tooling Traps

- **Node.js Engine Compliance**: Angular CLI v22+ and Playwright require Node.js
  `>=24.0.0`. Before executing any build, test, or E2E commands, verify the
  shell environment (e.g., ensure `PATH` points to Node.js v24+ or execute
  `nvm use 24`) to prevent immediate Exit Code 3 runtime crashes.
- **Idempotent Prettier Formatting**: Always format code explicitly using
  `yarn prettier` (or `corepack yarn prettier`) before running verification
  suites. Never treat clean/unchanged Prettier output as a command
  failure.

## Subagent Routing & Topology Selection

- **Match Agent Tier to Task Complexity**: For localized bug fixes or targeted
  refactors, prefer using lighter single-pass agents (`DeepCoderLite`,
  `implementer`) rather than heavy multi-worker synthesis pipelines
  (`DeepCoder`). Reserve `DeepCoder` for massive architectural overhauls.

## Subagent Workspace & Worktree Synchronization

- **Never use filesystem copy tools** (`rsync`, `cp`) to transfer code between
  isolated subagent workspaces (`.system_generated/worktrees/`) and the main
  workspace.
- **Workers**: When running in a branched workspace (`Workspace="branch"`),
  workers must stage and commit their verified changes directly to their
  isolated Git branch before reporting completion.
- **Orchestrators**: To integrate a worker's completed work into the parent
  workspace, orchestrators must use Git commands (e.g.,
  `git cherry-pick <worker-commit>` or `git merge --ff-only <worker-branch>`).
  This ensures instantaneous transfers without copying redundant `node_modules`
  or build caches.
- **Automatic Post-Task Cleanup**: As soon as a subagent delegation or task is
  integrated, the orchestrator must immediately terminate background subagents
  (`manage_subagents` kill) and prune any leftover temporary Git worktrees
  (`git worktree prune`) and delete unneeded worker branches
  (`git branch -D <branch>`). Never leave orphaned `subagent-*` branches or
  worktrees in the repository.

## Commit Message Formatting

- Follow the conventions for writing good CL descriptions (go/cl-descriptions).
- The commit message must be formatted like:

  ```
  [short description]

  [additional details as necessary]
  ```

- Lines in the commit message must not exceed 72 characters. Continue on a
  newline as necessary.
- Do NOT use superfluous, flowery, sycophantic, or emotional wording in the
  commit message. Keep it strictly objective (e.g., do not celebrate the fact
  that the commit includes "comprehensive testing").
