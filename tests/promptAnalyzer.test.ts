// tests/promptAnalyzer.test.ts
// Bun test runner

import { describe, it, expect } from "bun:test";
import { normalizeText, analyzePrompts } from "../lib/promptAnalyzer";
import { parseTextToPrompts } from "../lib/promptParser";

describe("promptParser", () => {
  it("parses newline and JSON array", () => {
    const txt = "one\\ntwo\\nthree";
    expect(parseTextToPrompts(txt)).toEqual(["one","two","three"]);
    const arr = JSON.stringify(["a","b","c"]);
    expect(parseTextToPrompts(arr)).toEqual(["a","b","c"]);
  });
});

describe("promptAnalyzer - normalizeText", () => {
  it("removes code blocks, urls and lowercases", () => {
    const raw = "Here is `inline` code and ```const x = 1``` plus https://example.com and Mail@test.com";
    const out = normalizeText(raw);
    expect(out.includes("https://")).toBe(false);
    expect(out.includes("mail@test.com")).toBe(false);
    expect(out).toBe(out.toLowerCase());
  });
});

describe("promptAnalyzer - analyzePrompts", () => {
  it("counts unigrams and bigrams", () => {
    const prompts = [
      "Skriv en affärsplan för en SaaS-startup",
      "Skriv en affärsplan för en saas startup",
      "Skriv en affärsplan för en mobilapp",
    ];
    const res = analyzePrompts(prompts, {minN:1, maxN:2, minCount:1, removeStopwords:false});
    expect(res.totalPrompts).toBe(3);
    const uni = res.ngrams[1].find(x => x.phrase.includes("affärsplan"));
    expect(uni).toBeTruthy();
  });
});
