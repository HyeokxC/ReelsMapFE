import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "/Users/hyeokx/git/claude.design-mcp/node_modules/playwright-core/index.mjs";

const origin = "http://127.0.0.1:4330";
const output = new URL("./", import.meta.url);
const routes = ["/inbox", "/inbox/1", "/inbox/2", "/inbox/3", "/inbox/4", "/inbox/5", "/places", "/lists", "/settings", "/start"];
const results = { startedAt: new Date().toISOString(), routes, captures: [], checks: [], errors: [], passed: false };
await mkdir(new URL("shots/", output), { recursive: true });
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });

async function bounded(promise, label) {
  let timeout;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timeout = setTimeout(() => reject(new Error(`Timed out: ${label}`)), 20000);
    })]);
  } finally {
    clearTimeout(timeout);
  }
}

async function change(page, action, trigger) {
  console.log(`Interaction: ${action}`);
  const [result] = await Promise.all([
    page.waitForResponse(response => response.url() === `${origin}/api/${action}` && response.request().method() === "POST"),
    trigger(),
  ]);
  assert.equal(result.status(), 200);
  return result.json();
}

async function capture(page, name, viewport) {
  console.log(`Capture: ${name} ${viewport.width}`);
  await page.bringToFront();
  await bounded(page.evaluate(() => document.fonts.ready), "font readiness");
  await bounded(page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))), "compositor frame");
  await page.locator("body[data-map-ready=true]").waitFor();
  const geometry = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    lens: document.body.classList.contains("lens-on"),
    width: innerWidth,
    scrollers: [...document.querySelectorAll("*")].filter(element => /auto|scroll/.test(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight).map(element => `${element.tagName.toLowerCase()}.${element.className}`),
  }));
  assert.equal(geometry.overflow, false, `Horizontal overflow: ${name}`);
  assert.equal(geometry.lens, true, `Lens inactive: ${name}`);
  assert.equal(geometry.width, viewport.width);
  const path = new URL(`shots/${name}-${viewport.width}.png`, output);
  await page.screenshot({ path: path.pathname });
  results.captures.push({ name, viewport, path: path.pathname, ...geometry });
}

try {
  for (const viewport of [{ width: 1440, height: 900, dpr: 2 }, { width: 390, height: 844, dpr: 3 }]) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: viewport.dpr, isMobile: viewport.width === 390, hasTouch: viewport.width === 390, reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"] });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    page.on("pageerror", error => results.errors.push({ type: "pageerror", message: error.message, url: page.url(), viewport }));
    page.on("console", message => { if (message.type() === "error") results.errors.push({ type: "console", message: message.text(), url: page.url(), viewport }); });
    await page.goto(origin);
    await page.waitForURL("**/inbox");
    results.checks.push({ viewport: viewport.width, behavior: "default route redirect", passed: true });
    for (const route of routes) {
      await page.goto(`${origin}${route}`);
      await page.locator("body[data-map-ready=true].lens-on").waitFor();
      if (route.endsWith("/5")) await page.locator(".sidebar .shimmer").first().waitFor();
      else await page.locator(".sidebar .loading").waitFor({ state: "hidden" });
      await capture(page, route.slice(1).replaceAll("/", "-"), viewport);
    }

    await page.goto(`${origin}/inbox`);
    await page.getByTestId("posts").waitFor();
    const first = page.getByRole("button", { name: /연남동 브런치 3곳/ });
    await first.click(); assert.equal(await first.getAttribute("aria-expanded"), "false");
    await first.click(); assert.equal(await first.getAttribute("aria-expanded"), "true");
    results.checks.push({ viewport: viewport.width, behavior: "expand post", passed: true });
    await page.getByRole("group", { name: "카테고리", exact: true }).getByRole("button", { name: "카페", exact: true }).click();
    assert.equal(await page.getByTestId("posts").locator(":scope > li").count(), 2);
    await page.getByRole("group", { name: "카테고리", exact: true }).getByRole("button", { name: "전체", exact: true }).click();
    const checkbox = page.getByRole("checkbox", { name: /예시 브런치 연남/ });
    await checkbox.uncheck(); await page.getByRole("button", { name: "선택한 2곳 저장", exact: true }).waitFor(); await checkbox.check();
    const saved = await change(page, "save", () => page.getByRole("button", { name: "선택한 3곳 저장", exact: true }).click());
    assert.equal(saved.places.filter(place => place.postId === 1 && place.saved).length, 3);
    await page.locator(".detail").getByText("저장됨 (예시)", { exact: true }).first().waitFor();
    results.checks.push({ viewport: viewport.width, behavior: "category filter, checkboxes and save places", passed: true });

    await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "외부 지도 목록", exact: true }).click();
    await page.waitForURL("**/lists");
    await page.getByTestId("pending-deletion").getByRole("button", { name: "확인", exact: true }).click();
    await page.getByRole("dialog").waitFor();
    assert.equal(await page.getByRole("button", { name: "유지", exact: true }).evaluate(element => element === document.activeElement), true);
    await capture(page, "deletion-alert", viewport);
    const deleted = await change(page, "deletion", () => page.getByRole("button", { name: "ReelsMap에서 삭제", exact: true }).click());
    assert.equal(deleted.changes.some(change => change.kind === "deletion"), false);
    await page.getByTestId("pending-deletion").waitFor({ state: "hidden" });
    results.checks.push({ viewport: viewport.width, behavior: "deletion alert focus and confirmation", passed: true });
    const sync = page.getByRole("switch", { name: "네이버 자동 동기화" });
    const toggled = await change(page, "sync", () => sync.click());
    assert.equal(toggled.lists.find(list => list.id === "naver").sync, false);
    assert.equal(await sync.isChecked(), false);
    results.checks.push({ viewport: viewport.width, behavior: "toggle sync", passed: true });

    await page.goto(`${origin}/inbox/4`);
    await page.getByRole("radio", { name: "예시 전망대 리스본 B", exact: true }).check();
    const candidate = await change(page, "candidate", () => page.getByRole("button", { name: "선택한 장소 저장", exact: true }).click());
    assert.equal(candidate.places.find(place => place.postId === 4).name, "예시 전망대 리스본 B");
    await page.getByRole("button", { name: "선택한 1곳 저장", exact: true }).waitFor();
    results.checks.push({ viewport: viewport.width, behavior: "choose Lisbon candidate", passed: true });

    await page.goto(`${origin}/inbox/3`);
    await page.getByRole("combobox", { name: "카테고리", exact: true }).selectOption("식당");
    await page.getByRole("combobox", { name: "저장 위치", exact: true }).selectOption("네이버 지도");
    const edited = await change(page, "save", () => page.getByRole("button", { name: "선택한 1곳 저장", exact: true }).click());
    const editedPlace = edited.places.find(place => place.postId === 3);
    assert.equal(editedPlace.category, "식당");
    assert.equal(editedPlace.destination, "네이버 지도");
    assert.equal(editedPlace.saved, true);
    await page.locator(".sidebar").getByText("저장됨 (예시)", { exact: true }).waitFor();
    await capture(page, "edited-place-saved", viewport);
    results.checks.push({ viewport: viewport.width, behavior: "category and destination edits preserve saved state", passed: true });

    await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "장소", exact: true }).click();
    await page.waitForURL("**/places");
    await page.getByRole("button", { name: "태그 추가", exact: true }).first().click();
    await page.getByRole("textbox", { name: "예시 브런치 연남 새 태그" }).fill("다시방문");
    const tagged = await change(page, "tag", () => page.getByRole("button", { name: "추가", exact: true }).click());
    assert.equal(tagged.places.find(place => place.id === 1).tags.includes("다시방문"), true);
    await page.getByText("#다시방문", { exact: true }).waitFor();
    await page.getByRole("group", { name: "장소 카테고리" }).getByRole("button", { name: "빵집 1곳" }).click();
    assert.equal(await page.locator(".poi-wrap").count(), 1);
    results.checks.push({ viewport: viewport.width, behavior: "add tag and filter map pins", passed: true });
    await page.getByRole("button", { name: "장소 또는 게시물 검색", exact: true }).click();
    await page.getByRole("textbox", { name: "검색어" }).fill("없는장소");
    await page.getByText("일치하는 장소가 없습니다.", { exact: true }).waitFor();
    await page.getByRole("button", { name: "지우기", exact: true }).click();
    await page.getByRole("button", { name: "장소 또는 게시물 검색", exact: true }).click();
    results.checks.push({ viewport: viewport.width, behavior: "client search", passed: true });

    await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "설정", exact: true }).click();
    await page.waitForURL("**/settings");
    await page.getByRole("switch", { name: "확인 필요 항목 알림" }).check();
    const settings = await change(page, "settings", () => page.getByRole("button", { name: "변경 저장", exact: true }).click());
    assert.equal(settings.settings.notifications, true);
    await page.reload();
    await page.getByRole("switch", { name: "확인 필요 항목 알림" }).waitFor();
    assert.equal(await page.getByRole("switch", { name: "확인 필요 항목 알림" }).isChecked(), true);
    results.checks.push({ viewport: viewport.width, behavior: "settings persistence and tab navigation", passed: true });

    await page.goto(`${origin}/start`);
    await page.bringToFront();
    await page.getByRole("button", { name: "복사", exact: true }).click();
    await page.getByRole("button", { name: "복사됨 (예시)", exact: true }).waitFor();
    assert.equal(await bounded(page.evaluate(() => navigator.clipboard.readText()), "clipboard read"), "RM-4821");
    results.checks.push({ viewport: viewport.width, behavior: "clipboard code", passed: true });
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }, { name: "prefers-reduced-motion", value: "reduce" }] });
    await page.locator("body[data-lens-status=fallback]").waitFor();
    assert.equal(await page.locator(".sidebar").evaluate(element => getComputedStyle(element).backdropFilter), "none");
    assert.equal(await page.locator("#lens").evaluate(element => element.width), 0);
    await page.screenshot({ path: new URL(`shots/reduced-transparency-${viewport.width}.png`, output).pathname });
    results.checks.push({ viewport: viewport.width, behavior: "reduced transparency fallback", passed: true });
    console.log(`Closing context: ${viewport.width}`);
    await bounded(context.close(), "context close");
  }
  assert.deepEqual(results.errors, []);
  results.passed = true;
} catch (error) {
  results.errors.push({ type: "assertion", message: error instanceof Error ? error.stack : String(error) });
  process.exitCode = 1;
} finally {
  try {
    await bounded(browser.close(), "browser close");
  } catch (error) {
    results.errors.push({ type: "cleanup", message: error instanceof Error ? error.message : String(error) });
    results.passed = false;
    process.exitCode = 1;
  }
  results.finishedAt = new Date().toISOString();
  await writeFile(new URL("result.json", output), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ passed: results.passed, captures: results.captures.length, checks: results.checks.length, errors: results.errors }, null, 2));
}
