import { getWordsByCategory, isWordValid, PartsOfSpeech, wordList, wordListSet } from '../words';
import { describe, expect, test } from "bun:test";

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
  test("should be sorted alphabetically", () => {
    for (const cat of categories) {
      const wordListCat = wordList[cat];
      const unsorted: string[] = wordListCat.map(wordObj => wordObj.word);
      const sorted = [...unsorted].sort();
      expect(unsorted).toStrictEqual(sorted);
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
  test("should not contain special characters", () => {
    const validString = /^[a-z]+$/; // no whitespace, numbers, uppercase, special chars
    wordListSet.forEach((word) => {
      expect(validString.test(word)).toBeTrue();
    });
  });
});