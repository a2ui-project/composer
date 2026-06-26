---
trigger: model_decision
description: Rules for testing requirements (unit coverage, Playwright user journeys) and the consolidated Review/QA verification pipeline required before commits.
---

# Testing & Consolidated Quality Workflow

Before committing any change, you MUST execute the following verification
pipeline.

## Testing Requirements

- Ensure all code has comprehensive test coverage, including both happy and
  unhappy paths.
- Verify code coverage using the output of the `yarn test` script.
- User journeys must be captured and verified with Playwright tests using the
  `yarn e2e-headless` script in the `shell` directory.

## Component Harnesses for Unit Testing

- Never query the component DOM directly using `fixture.nativeElement` or
  `fixture.debugElement.query`.
- Use CDK Component Harnesses (`@angular/cdk/testing/ComponentHarness`) to
  interact with the DOM in tests.
- Always configure testing modules with `provideNoopAnimations()` to prevent
  animation-related failures.

## Targeted Intermediate Verification

- **Scope Intermediate Scans**: During intermediate implementation steps, run
  only the unit test files directly affected by the changes (e.g.,
  `yarn workspace a2ui-composer-shell vitest run <spec_file>`), reserving full
  monorepo test suites (`yarn test`) and Playwright E2E verifications
  (`yarn e2e-headless`) for the final pre-commit checkpoint.

## Consolidated Multi-Agent Review & QA Workflow

Instead of running sequential, recursive review chains, execute a single
consolidated verification pass:

1. **Self-Verification First**:

- The coding worker must ensure `yarn test` and linter checks pass locally
  before requesting review.

2. **Spawn Quality Partner Agent**:

- Spawn a single **Code Quality & Review Partner** subagent (`Gemini Pro`
  model) to audit the implementation in one pass for:
  - **Code Health**:
    - Readability and clarity.
    - Proper use of comments (JSDocs on exported types, inline comments for
      non-obvious code, no restating comments).
    - Modern Angular best practices (signals, built-in control flow, separate
      template/style files).
    - TypeScript best practices (proper typing, no `any`, simplicity).
    - Idiomatic TypeScript and Angular code.

  - **Test Sufficiency**:
    - Happy/unhappy path unit test coverage and Playwright E2E user journey
      verification.
    - Sufficient code coverage (as reported by `yarn test --coverage`).

  - **Severity Tiers**: The review partner must classify feedback into:
    - **Blockers** (failing tests, logic bugs, type violations, missing CUJ
      coverage): _Must be fixed immediately._
    - **Nits** (stylistic preferences, optional refactors): _May be batched or
      deferred without triggering a full re-review loop._

3. **Single Re-Review Guarantee**:

- Once the coding worker resolves all **Blockers**, the change is considered
  verified and ready for commit. Do not trigger recursive re-review loops for
  non-blocking nits.
- Report back to the user non-blocking issues, giving them the option of
  working on those later.
