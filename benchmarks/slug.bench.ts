import { generateSlug } from "../index";
import { performance } from "perf_hooks";

function runBenchmark(name: string, fn: () => void, iterations = 100000) {
  // quick warm-up
  for (let i = 0; i < 1000; i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const end = performance.now();

  const totalMs = end - start;
  const avgUs = (totalMs * 1000) / iterations;
  const opsPerSec = (iterations / totalMs) * 1000;

  console.log(
    `${name}: ${iterations} runs — ${totalMs.toFixed(3)} ms total — ${avgUs.toFixed(3)} µs/op — ${opsPerSec.toFixed(2)} ops/sec`
  );
}

const NUM = 100000;

const scenarios = [
  { name: "default (3 words, kebab)", fn: () => generateSlug() },
  { name: "4 words, camel", fn: () => generateSlug(4, { format: "camel" }) },
  { name: "2 words, title", fn: () => generateSlug(2, { format: "title" }) },
  { name: "custom parts (adj,noun,adj)", fn: () => generateSlug(3, { partsOfSpeech: ["adjective", "noun", "adjective"] }) },
];

(async () => {
  console.log("Starting generateSlug benchmarks\n");
  console.time("Slug benchmark");
  for (const s of scenarios) {
    runBenchmark(s.name, s.fn, NUM);
  }
  console.log("\n");
  console.timeEnd("Slug benchmark");
})();

