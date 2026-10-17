import { test } from "node:test";
import assert from "node:assert/strict";
import { loadData } from "../build/build.mjs";

const DATA = loadData();

test("stages run college → next, in order", () => {
  assert.deepEqual(DATA.stages.map((s) => s.id), ["college", "postgrad", "aspire", "pause", "security", "next"]);
});

test("turning points, the future stage and the numbers stage are where the story says", () => {
  const ids = (key) => DATA.stages.filter((s) => s[key]).map((s) => s.id);
  assert.deepEqual(ids("turn"), ["aspire", "security"]);
  assert.deepEqual(ids("future"), ["next"]);
  assert.deepEqual(ids("numbers"), ["aspire"]);
});

test("every stage has a title and at least one paragraph", () => {
  for (const s of DATA.stages) {
    assert.ok(s.title, `${s.id} title`);
    assert.ok(Array.isArray(s.body) && s.body.length > 0, `${s.id} body`);
  }
});

test("numbers: the four figures, <2% included", () => {
  assert.equal(DATA.numbers.length, 4);
  assert.ok(DATA.numbers.some((n) => n.value === "<2%"));
});

test("off the clock: eight items, each illustration used once", () => {
  assert.deepEqual(
    DATA.offClock.map((o) => o.icon).sort(),
    ["controller", "dumbbell", "football", "guitar", "mountain", "planet", "server", "speech"]
  );
});

test("privacy: no family words, no phone, city-level location", () => {
  assert.doesNotMatch(JSON.stringify(DATA), /\b(mother|father|brother|sister|wife|husband|family)\b/i);
  assert.equal(DATA.contact.phone, undefined);
  assert.equal(DATA.contact.location, "Kochi, Kerala, India");
});

test("the hiring-page fields are gone", () => {
  assert.equal(DATA.phases, undefined);
  assert.equal(DATA.stats, undefined);
  assert.equal(DATA.contactHeading, "Say hello.");
});
