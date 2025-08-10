// lib/promptAnalyzer.ts
// Analysis helpers: normalizeText, tokenize, n-gram extraction and analyzePrompts

export type AnalyzeOptions = {
  minN: number;
  maxN: number;
  minCount: number;
  removeStopwords: boolean;
};

export type PhraseEntry = {
  phrase: string;
  count: number;
  examples: string[];
  ngram: number;
};

export type AnalyzeResult = {
  totalPrompts: number;
  canonical: PhraseEntry[];
  ngrams: Record<number, PhraseEntry[]>;
};

export const DEFAULT_STOPWORDS_SV = new Set([
  "och","i","att","det","en","är","som","på","för","med","av","till",
]);

export function normalizeText(raw: string) {
  if (!raw) return "";
  let s = raw.replace(/```[\s\S]*?```/g, " ");
  s = s.replace(/`[^`]*`/g, " ");
  s = s.replace(/https?:\/\/\S+/gi, " ");
  s = s.replace(/\S+@\S+\.\S+/gi, " ");
  s = s.replace(/\s+/g, " ");
  s = s.trim();
  s = s.toLowerCase();
  // Accept Latin letters (incl. åäö etc), numbers, whitespace, hyphen and plus
  s = s.replace(/[^0-9A-Za-z\u00C0-\u024F\s\-+]/g, "");
  s = s.replace(/\s+/g, " ");
  return s;
}

export function tokenize(text: string) {
  if (!text) return [] as string[];
  return text.split(/\s+/).filter(Boolean);
}

export function extractNgramsFromTokens(tokens: string[], n: number, removeStopwords = false) {
  const out: string[] = [];
  for (let i = 0; i + n <= tokens.length; i++) {
    const slice = tokens.slice(i, i + n);
    if (removeStopwords) {
      const allStop = slice.every((w) => DEFAULT_STOPWORDS_SV.has(w));
      if (allStop) continue;
    }
    out.push(slice.join(" "));
  }
  return out;
}

export function topNFromMap(map: Map<string, {count:number, examples:Set<string>}>, minCount = 1, limit = 200) {
  const arr = Array.from(map.entries()).map(([phrase, {count, examples}]) => ({
    phrase,
    count,
    examples: Array.from(examples).slice(0,3),
  }));
  arr.sort((a,b) => b.count - a.count);
  return arr.filter(x => x.count >= minCount).slice(0, limit);
}

export function analyzePrompts(rawPrompts: string[], opts?: Partial<AnalyzeOptions>): AnalyzeResult {
  const options: AnalyzeOptions = {
    minN: opts?.minN ?? 1,
    maxN: opts?.maxN ?? 3,
    minCount: opts?.minCount ?? 2,
    removeStopwords: opts?.removeStopwords ?? false,
  };

  const canonicalMap = new Map<string, {count:number, examples:Set<string>}>();
  const ngramMaps: Record<number, Map<string, {count:number, examples:Set<string>}>> = {} as any;
  for (let n = options.minN; n <= options.maxN; n++) ngramMaps[n] = new Map();

  for (const raw of rawPrompts) {
    const normalized = normalizeText(raw);
    if (!normalized) continue;
    const c = canonicalMap.get(normalized) ?? {count:0, examples:new Set<string>()};
    c.count += 1;
    if (c.examples.size < 3) c.examples.add(raw);
    canonicalMap.set(normalized, c);

    const tokens = tokenize(normalized);
    for (let n = options.minN; n <= options.maxN; n++) {
      if (tokens.length < n) continue;
      const ngrams = extractNgramsFromTokens(tokens, n, options.removeStopwords);
      const map = ngramMaps[n];
      for (const g of ngrams) {
        const entry = map.get(g) ?? {count:0, examples:new Set<string>()};
        entry.count += 1;
        if (entry.examples.size < 3) entry.examples.add(raw);
        map.set(g, entry);
      }
    }
  }

  const canonicalArr = topNFromMap(canonicalMap, options.minCount, 500).map(x => ({...x, ngram: 0}));
  const ngramsRes: Record<number, PhraseEntry[]> = {} as any;
  for (let n = options.minN; n <= options.maxN; n++) {
    ngramsRes[n] = topNFromMap(ngramMaps[n], options.minCount, 500).map(x => ({...x, ngram: n}));
  }

  return {
    totalPrompts: rawPrompts.length,
    canonical: canonicalArr,
    ngrams: ngramsRes,
  };
}
