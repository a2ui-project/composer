---
trigger: glob
globs:
  - '**/*.ts'
description: TypeScript standards, type safety, comments, and clean code guidelines (DRY, file cohesion, no generic utilities).
---

# TypeScript and Clean Code Guidelines

## Type Safety

- All types must be properly typed. The use of `any` is strictly forbidden. If
  necessary, use `unknown`.
- Keep code as simple as possible. For example, if there is a `null` or
  `undefined` check, it must be because it can be clearly demonstrated that the
  type can _actually_ be null or undefined.

## Code Reuse & File Cohesion

- Adhere to the DRY (Don't Repeat Yourself) principle. Do not have blocks of
  "copy/paste" code. Share code via a class or public function.
- Do NOT use "manager" or "util" classes or files. Name classes and files
  precisely to reflect what they contain, and ensure they only contain highly
  cohesive classes or functions.
- If a class uses an interface as input, it is acceptable to define it in the
  same file as the class. Otherwise, the interface should be in another file.

## Comments & JSDoc

- Every exported type must have a JSDoc explaining it.
  - The comment must focus on **why** the type exists and/or **what** it does,
    completely avoiding implementation details.
- Use inline comments to explain non-obvious code.
- Do NOT write comments that simply restate what the code is doing.
