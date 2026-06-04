---
trigger: model_decision
description: Rules for testing requirements (unit coverage, Playwright user journeys) and the multi-agent Review/QA pipeline required before commits.
---

# Testing & Multi-Agent Quality Workflow

Before committing any change, you MUST execute the following pipeline.

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

## Multi-Agent Review Workflow

1. **Spawn Review Agent**:

- Spawn a separate review subagent (which MUST be a `Gemini Pro` model) to
  perform a comprehensive review, looking for:
  - Readability and clarity.
  - Proper use of comments (JSDocs on exported types, inline comments for
    non-obvious code, no restating comments).
  - Modern Angular best practices (signals, built-in control flow, separate
    template/style files).
  - TypeScript best practices (proper typing, no `any`, simplicity).
  - Idiomatic code.
  - Sufficiency of unit tests and Playwright tests.
- If the reviewer flags anything, it MUST be addressed before moving on to the
  next step.

2. **Spawn QA Agent**:

- After addressing all review findings, spawn a separate QA subagent (which
  MUST be a `Gemini Pro` model) to perform a comprehensive quality review,
  looking for:
  - Sufficient testing of both happy and unhappy paths.
  - Sufficient code coverage (as reported by `yarn test`).
- If the QA agent flags anything, it MUST be addressed and then reviewed again
  by a separate review agent (repeating Step 1).
