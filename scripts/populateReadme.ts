import { totalUniqueSlugs } from "../index";
import { WordList, wordList } from "../words";

console.log("Generating stats for README file");
console.time("populate readme");

const templatePath = "./scripts/README_TEMPLATE.md";
const templateFile = Bun.file(templatePath);

const combos = totalUniqueSlugs().toLocaleString("en-US");
const templateText = await templateFile.text();

// Populate categories
function listToUnique(list: WordList[keyof WordList]) {
  const unique = new Set<string>();
  list.forEach(({ categories }: WordList[keyof WordList][number]) => {
    categories.forEach(
      (category: WordList[keyof WordList][number]["categories"][number]) =>
        unique.add(category)
    );
  });
  return "- " + [...unique].sort().join("\n- ");
}

const adjectiveCategories = listToUnique(wordList.adjective);
const nounCategories = listToUnique(wordList.noun);

console.log("Inserting stats");

const replaced = templateText
  .replace("{{uniqueCombinations}}", combos)
  .replace("{{adjectiveCategories}}", adjectiveCategories)
  .replace("{{nounCategories}}", nounCategories);

console.log("Saving README file");
await Bun.write("./README.new.md", replaced);
console.timeEnd("populate readme");
