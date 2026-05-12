import { serverTimestamp } from "firebase/firestore";
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  try {
    testEnv = await initializeTestEnvironment({
      projectId: "gen-lang-client-0328068710-test",
      firestore: {
        rules: readFileSync(resolve(__dirname, "DRAFT_firestore.rules"), "utf8"),
      },
    });
  } catch (err) {
    console.error("Setup failed:", err);
    throw err;
  }
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Firestore Security Rules", () => {
  // 1. Ghost Field Injection
  it("should fail user creation with a ghost field (isAdmin)", async () => {
    const db = testEnv.authenticatedContext("alice", { email_verified: true }).firestore();
    const docRef = db.collection("users").doc("alice");
    await assertFails(docRef.set({
      displayName: "Alice",
      email: "alice@example.com",
      role: "user",
      createdAt: serverTimestamp(),
      isAdmin: true // Ghost field
    }));
  });

  // 2. Role Escalation
  it("should fail user creation with 'admin' role", async () => {
    const db = testEnv.authenticatedContext("alice", { email_verified: true }).firestore();
    const docRef = db.collection("users").doc("alice");
    await assertFails(docRef.set({
      displayName: "Alice",
      email: "alice@example.com",
      role: "admin", // Invalid role for creation
      createdAt: serverTimestamp(),
    }));
  });

  // 3. Impersonation
  it("should fail creating a TestResult for another user", async () => {
    // Setup a test first
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("tests").doc("test1").set({
        nameAr: "Test", category: "Cat1", duration: 10, questions: [], isPublished: true
      });
    });

    const db = testEnv.authenticatedContext("alice", { email_verified: true }).firestore();
    const docRef = db.collection("testResults").doc("res1");
    await assertFails(docRef.set({
      userId: "bob", // Impersonation
      testId: "test1",
      answers: [1, 2],
      totalScore: 3,
      createdAt: serverTimestamp()
    }));
  });

  // 4. Time Travel
  it("should fail if createdAt is not server timestamp", async () => {
    const db = testEnv.authenticatedContext("alice", { email_verified: true }).firestore();
    const docRef = db.collection("users").doc("alice");
    await assertFails(docRef.set({
      displayName: "Alice",
      email: "alice@example.com",
      role: "user",
      createdAt: new Date("1990-01-01T00:00:00Z") // Time travel
    }));
  });

  // 5. Orphaned Write
  it("should fail if testId does not exist", async () => {
    const db = testEnv.authenticatedContext("alice", { email_verified: true }).firestore();
    const docRef = db.collection("testResults").doc("res1");
    await assertFails(docRef.set({
      userId: "alice",
      testId: "invalidTestId", // Does not exist
      answers: [],
      totalScore: 0,
      createdAt: serverTimestamp()
    }));
  });

  // 6. Denial of Wallet (ID Poisoning)
  it("should fail user creation with an excessively long ID", async () => {
    const longId = "a".repeat(200);
    const db = testEnv.authenticatedContext(longId, { email_verified: true }).firestore();
    const docRef = db.collection("users").doc(longId);
    await assertFails(docRef.set({
      displayName: "Alice",
      email: "alice@example.com",
      role: "user",
      createdAt: serverTimestamp()
    }));
  });

  // 7. Denial of Wallet (Array Overflow)
  it("should fail if test answers array is too large", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("tests").doc("test1").set({
        nameAr: "Test", category: "Cat1", duration: 10, questions: [], isPublished: true
      });
    });

    const db = testEnv.authenticatedContext("alice", { email_verified: true }).firestore();
    const docRef = db.collection("testResults").doc("res1");
    await assertFails(docRef.set({
      userId: "alice",
      testId: "test1",
      answers: Array(500).fill(1), // Overflow
      totalScore: 500,
      createdAt: serverTimestamp()
    }));
  });

  // 8. Unauthorized Read
  it("should fail reading another user's profile", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("bob").set({
        displayName: "Bob", email: "bob@example.com", role: "user", createdAt: new Date()
      });
    });

    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(db.collection("users").doc("bob").get());
  });

  // 9. Unauthorized Test Creation
  it("should fail creating a test as a normal user", async () => {
    const db = testEnv.authenticatedContext("alice", { email_verified: true }).firestore();
    const docRef = db.collection("tests").doc("test1");
    await assertFails(docRef.set({
      nameAr: "Test", category: "Cat1", duration: 10, questions: [], isPublished: true
    }));
  });

  // 10. Test Modification
  it("should fail updating a test as a normal user", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("tests").doc("test1").set({
        nameAr: "Test", category: "Cat1", duration: 10, questions: [], isPublished: true
      });
    });

    const db = testEnv.authenticatedContext("alice", { email_verified: true }).firestore();
    const docRef = db.collection("tests").doc("test1");
    await assertFails(docRef.update({ duration: 20 }));
  });

  // 11. Result Modification - Total Score
  it("should fail updating totalScore in an existing TestResult", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("tests").doc("test1").set({
        nameAr: "Test", category: "Cat1", duration: 10, questions: [], isPublished: true
      });
      await context.firestore().collection("testResults").doc("res1").set({
        userId: "alice", testId: "test1", answers: [], totalScore: 10, createdAt: new Date()
      });
    });

    const db = testEnv.authenticatedContext("alice", { email_verified: true }).firestore();
    const docRef = db.collection("testResults").doc("res1");
    await assertFails(docRef.update({ totalScore: 20 }));
  });

  // 12. Unverified Email
  it("should fail updating profile if email is unverified", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection("users").doc("alice").set({
        displayName: "Alice", email: "alice@example.com", role: "user", createdAt: new Date()
      });
    });

    const db = testEnv.authenticatedContext("alice", { email_verified: false }).firestore();
    const docRef = db.collection("users").doc("alice");
    await assertFails(docRef.update({ displayName: "Alice Updated" }));
  });
});
