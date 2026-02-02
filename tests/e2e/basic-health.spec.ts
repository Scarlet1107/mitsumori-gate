import { test, expect } from "@playwright/test";

const authUser = process.env.BASIC_AUTH_USER;
const authPass = process.env.BASIC_AUTH_PASS;

test("private route returns 401 without auth", async ({ page }) => {
  const response = await page.goto("/");
  expect(response, "response should be available").not.toBeNull();
  expect(response?.status()).toBe(401);
});

test("public web form is accessible without auth", async ({ page }) => {
  const response = await page.goto("/web-form");
  expect(response, "response should be available").not.toBeNull();
  const status = response?.status() ?? 0;
  expect(status).toBeGreaterThanOrEqual(200);
  expect(status).toBeLessThan(400);
});

test("private route is accessible with auth", async ({ browser }) => {
  test.skip(!authUser || !authPass, "BASIC_AUTH_USER/PASS are required for this test");

  const context = await browser.newContext({
    httpCredentials: {
      username: authUser ?? "",
      password: authPass ?? "",
    },
  });
  const page = await context.newPage();
  const response = await page.goto("/");
  expect(response, "response should be available").not.toBeNull();
  const status = response?.status() ?? 0;
  expect(status).toBeGreaterThanOrEqual(200);
  expect(status).toBeLessThan(500);
  expect(status).not.toBe(401);
  expect(status).not.toBe(403);
});

test("admin page is accessible with auth", async ({ browser }) => {
  test.skip(!authUser || !authPass, "BASIC_AUTH_USER/PASS are required for this test");
  test.skip(!process.env.DATABASE_URL, "DATABASE_URL is required for admin page data");

  const context = await browser.newContext({
    httpCredentials: {
      username: authUser ?? "",
      password: authPass ?? "",
    },
  });
  const page = await context.newPage();
  const response = await page.goto("/admin");
  expect(response, "response should be available").not.toBeNull();
  const status = response?.status() ?? 0;
  expect(status).toBeGreaterThanOrEqual(200);
  expect(status).toBeLessThan(500);
  expect(status).not.toBe(401);
  expect(status).not.toBe(403);
});
