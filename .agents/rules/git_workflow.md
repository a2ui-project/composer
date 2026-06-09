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
