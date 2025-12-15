import { generateSlug, RandomWordOptions, totalUniqueSlugs } from "../index";
import { Adjectives, Categories, getWordsByCategory, isWordValid, Nouns, PartsOfSpeech, wordList, wordListSet } from '../words';
import { describe, expect, test } from "bun:test";

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

const findDuplicates = <T>(arr: T[]): T[] => {
    let seen = new Set<T>();
    let duplicates = new Set<T>();
    for (let num of arr) {
        if (seen.has(num)) {
            duplicates.add(num);
        }
        seen.add(num);
    }
    
    return [...duplicates];
};

describe("wordList", () => {
  const categories = Object.keys(wordList) as [PartsOfSpeech];
  test("has the correct structure", () => {
    expect(categories).toBeArray();

    // For every cat ("noun, etc")...
    for (const cat of categories) {
      // ...get the child object which is a list of
      // an object containing the word and the category...
      const wordListCat = wordList[cat];
      expect(wordListCat).toBeArray();
      expect(wordListCat).not.toBeEmpty();

      // ...and then for each object in that above child object...
      for (const wordObj of wordListCat) {
        // ... check that the "word" and "categories" props are valid.
        expect(wordObj).toBeObject();
        const { categories, word } = wordObj;
        expect(categories).toBeArray();
        expect(categories).not.toBeEmpty();
        expect(word).toBeString();
        expect(word).not.toBeEmpty();
      }
    }
  });
  test("has no repeat words", () => {
    for (const cat of categories) {
      const allWords = getWordsByCategory(cat as PartsOfSpeech);
      const duplicates = findDuplicates(allWords);
      expect(duplicates).toBeArrayOfSize(0);
    }
  });
});

describe("wordListSet", () => {
  test("should contain all words", () => {
    const categories = Object.keys(wordList) as [PartsOfSpeech];
    for (const cat of categories) {
      const wordListCat = wordList[cat];
      for (const wordObj of wordListCat) {
        const word = wordObj.word;
        expect(isWordValid(word)).toBeTrue();
      }
    }
  });
  describe("should return false for invalid words", () => {
    const cases: any[] = [
      undefined,
      "",
      " ",
      "\n",
      "foo",
      "bar",
      " orange",
      "orange ",
    ];

    test.each(cases)("arg %p should not be valid", (word) => {
      expect(isWordValid(word)).toBeFalse();
    });
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
  test("defaults to kebab-cases given invalid format string", () => {
    // @ts-ignore using incorrect arg for testing
    const slug = generateSlug(undefined, { format: "foo!" });
    const parts = slug.split("-");
    expect(parts).toBeArrayOfSize(3);
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
  test("should tally up total slugs", () => {
    const num = totalUniqueSlugs();
    const actualTotal = numAdjectives * numAdjectives * numNouns;
    expect(num).toBe(actualTotal);
  });
  test("should tally slugs in subset of categories", () => {
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
