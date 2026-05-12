# Security Specification

## 1. Data Invariants
1. A user can only read and write their own profile document.
2. A user cannot elevate their own role to 'admin' or 'specialist'.
3. A test can only be created or updated by an 'admin'.
4. Any authenticated user can read published tests.
5. A user can only create a TestResult where `userId` matches their authenticated UID.
6. A TestResult cannot be modified or deleted once created.
7. `createdAt` must match the server timestamp.
8. Only users with `email_verified == true` can write any data.
9. Arrays (e.g., test answers) must be bounded (size <= 200).
10. TestResult must point to a valid `testId` that exists in the database.

## 2. The "Dirty Dozen" Payloads
1. **Ghost Field Injection**: User trying to write to their profile with an unapproved field (`isAdmin: true`).
2. **Role Escalation**: User trying to set their role to 'admin' during account creation.
3. **Impersonation**: User trying to create a `TestResult` where `userId` is another user's UID.
4. **Time Travel**: User trying to set `createdAt` in the past instead of using `request.time`.
5. **Orphaned Write**: User trying to submit a `TestResult` pointing to a `testId` that does not exist.
6. **Denial of Wallet (ID Poisoning)**: User trying to create a document with an ID that is 2000 characters long.
7. **Denial of Wallet (Array Overflow)**: User submitting 5000 test answers instead of the expected amount.
8. **Unauthorized Read**: User trying to read another user's profile.
9. **Unauthorized Test Creation**: User trying to create a new `Test`.
10. **Test Modification**: User trying to alter a `Test` document without being an admin.
11. **Result Modification**: User trying to update an existing `TestResult`.
12. **Unverified Email**: User trying to write to their profile when their email is not verified.

## 3. Test Runner
We will test these payloads in `firestore.rules.test.ts`.
