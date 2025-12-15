import { generateSlug, RandomWordOptions, totalUniqueSlugs } from "../index";
import { Adjectives, Categories, Nouns, PartsOfSpeech, wordList } from "../words";
import { describe, expect, it, test } from "bun:test";

const allAdjectives: Adjectives[] = wordList.adjective.map(({ word }) => word)
const allNouns: Nouns[] = wordList.noun.map(({ word }) => word);
const numAdjectives = allAdjectives.length;
const numNouns = allNouns.length;

function checkWordInCategories<P extends PartsOfSpeech>(
  partOfSpeech: P,
  word: string,
  categories: Categories[P][]
): boolean {
  const cats = new Set(categories);
  const entry = wordList[partOfSpeech].find(w => w.word === word);
  if (!entry) return false;
  return entry.categories.some(cat => cats.has(cat));
}

describe("wordList", () => {
  // TODO: generalize this for any word types
  it("has no repeats", () => {
    const { noun, adjective } = wordList;
    const allNouns = new Set<string>();
    const repeats: {
      noun: string[];
      adjective: string[];
    } = { noun: [], adjective: [] };
    noun.forEach(({ word }) => {
      if (allNouns.has(word)) {
        repeats.noun.push(word);
      } else {
        allNouns.add(word);
      }
    });
    const allAdjectives = new Set<string>();
    adjective.forEach(({ word }) => {
      if (allAdjectives.has(word)) {
        repeats.adjective.push(word);
      } else {
        allAdjectives.add(word);
      }
    });

    if (repeats.noun.length || repeats.adjective.length) {
      throw new Error(`Some words are repeated: ${JSON.stringify(repeats)}`);
    }
  });
});

describe("generateSlug", () => {
  describe("generates n random kebab-cased words by default", () => {
    const limit = 10;
    const arr = Array.from({length: limit}, (_, i) => i + 1); // 1, 2, ...

    test.each(arr)("should generate slug with %p words", (i) => {
      const slug = generateSlug(i);
      const parts = slug.split("-");
      expect(parts).toBeArrayOfSize(i);
    });
  });
  test("providing 0 number of words should fall back to default", () => {
    const slug = generateSlug(0);
    const parts = slug.split("-");
    // Should probably avoid this magic number and export the default val from index.ts
    expect(parts).toBeArrayOfSize(3);
  });
  test("generates three random kebab-cased words by default", () => {
    const slug = generateSlug();
    const parts = slug.split("-");
    expect(parts).toBeArrayOfSize(3);
    expect(allAdjectives).toContain<Nouns>(parts[0]);
    expect(allAdjectives).toContain<Nouns>(parts[1]);
    expect(allNouns).toContain<Nouns>(parts[2]);
  });
  test("allows user to specify word categories", () => {
    const options: RandomWordOptions<3> = {
      categories: {
        noun: ["animals", "education"],
        adjective: ["color", "appearance"],
      },
    };
    const slug = generateSlug(3, options);
    const parts = slug.split("-");
    expect(
      checkWordInCategories(
        "adjective",
        parts[0],
        options!.categories!.adjective!
      )
    ).toBeTrue();
    expect(
      checkWordInCategories(
        "adjective",
        parts[1],
        options!.categories!.adjective!
      )
    ).toBeTrue();
    expect(
      checkWordInCategories("noun", parts[2], options!.categories!.noun!)
    ).toBeTrue();
  });
  test("should format as camelCase", () => {
    const slug = generateSlug(3, { format: "camel" });
    const second = slug.match(/[A-Z].+?(?=[A-Z])/)![0];
    const splitRegex = new RegExp(second + "(.+)");
    const [first, third] = slug.split(splitRegex);
    expect(first[0]).toBe(first[0].toLowerCase());
    expect(allAdjectives).toContain<Adjectives>(first);
    expect(second[0]).toBe(second[0].toUpperCase());
    expect(allAdjectives).toContain<Adjectives>(second.toLowerCase());
    expect(third[0]).toBe(third[0].toUpperCase());
    expect(allNouns).toContain<Nouns>(third.toLowerCase());
  });
  test("should format as Title Case", () => {
    const slug = generateSlug(3, { format: "title" });
    const [first, second, third] = slug.split(" ");
    expect(first[0]).toBe(first[0].toUpperCase());

    expect(allAdjectives).toContain<Adjectives>(first.toLowerCase());
    expect(second[0]).toBe(second[0].toUpperCase());
    expect(allAdjectives).toContain<Adjectives>(second.toLowerCase());
    expect(third[0]).toBe(third[0].toUpperCase());
    expect(allNouns).toContain<Nouns>(third.toLowerCase());
  });
  test("should format as lower case", () => {
    const slug = generateSlug(3, { format: "lower" });
    const [first, second, third] = slug.split(" ");
    expect(first[0]).toBe(first[0].toLowerCase());
    expect(allAdjectives).toContain<Adjectives>(first);
    expect(second[0]).toBe(second[0].toLowerCase());
    expect(allAdjectives).toContain<Adjectives>(second);
    expect(third[0]).toBe(third[0].toLowerCase());
    expect(allNouns).toContain<Nouns>(third);
  });
  test("should format as Sentence case", () => {
    const slug = generateSlug(3, { format: "sentence" });
    const [first, second, third] = slug.split(" ");
    expect(first[0]).toBe(first[0].toUpperCase());
    expect(allAdjectives).toContain<Adjectives>(first.toLowerCase());
    expect(second[0]).toBe(second[0].toLowerCase());
    expect(allAdjectives).toContain<Adjectives>(second);
    expect(third[0]).toBe(third[0].toLowerCase());
    expect(allNouns).toContain<Nouns>(third);
  });
});

describe("totalUniqueSlugs", () => {
  it("should tally up total slugs", () => {
    const num = totalUniqueSlugs();
    const actualTotal = numAdjectives * numAdjectives * numNouns;
    expect(num).toBe(actualTotal);
  });
  it("should tally slugs in subset of categories", () => {
    const num = totalUniqueSlugs(4, {
      categories: {
        noun: ["animals", "people"],
        adjective: ["color", "appearance"],
      },
    });
    const numAdjectives = wordList.adjective.filter(({ categories }) => {
      for (let category of categories) {
        if (category === "color" || category === "appearance") {
          return true;
        }
      }
      return false;
    }).length;
    const numNouns = wordList.noun.filter(({ categories }) => {
      for (let category of categories) {
        if (category === "animals" || category === "people") {
          return true;
        }
      }
      return false;
    }).length;
    const actualTotal = numAdjectives ** 3 * numNouns;
    expect(num).toBe(actualTotal);
  });
});
