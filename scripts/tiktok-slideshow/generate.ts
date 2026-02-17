import { writeFile, mkdir, readFile } from "fs/promises";
import { join } from "path";
import { generateImage, pickBestImage } from "./lib/gemini";
import { addTextOverlay } from "./lib/overlay";
import { uploadImage, createTikTokDraft } from "./lib/postiz";
import { SCRIPTS, getScript, type ScriptData } from "./prompts";

// Load env
const envPath = join(import.meta.dir, ".env");
try {
  const envContent = await readFile(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const [key, ...vals] = line.split("=");
    if (key && vals.length) process.env[key.trim()] = vals.join("=").trim();
  }
} catch {}
try {
  const globalEnv = await readFile(
    join(process.env.HOME!, ".config/env/global.env"),
    "utf-8"
  );
  for (const line of globalEnv.split("\n")) {
    const [key, ...vals] = line.split("=");
    if (key && vals.length && !process.env[key.trim()])
      process.env[key.trim()] = vals.join("=").trim();
  }
} catch {}

const OUTPUT_DIR = join(import.meta.dir, "output");
const DELAY_MS = 3000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── CLI parsing ──

function parseArgs() {
  const args = process.argv.slice(2);
  let scriptNum: number | "all" | undefined;
  let variations = 5;
  let post = false;
  let picks: number[] | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--all") {
      scriptNum = "all";
    } else if (arg === "--variations" && args[i + 1]) {
      variations = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--post") {
      post = true;
    } else if (arg === "--picks" && args[i + 1]) {
      picks = args[i + 1].split(",").map((n) => parseInt(n.trim(), 10));
      i++;
    } else if (!scriptNum && /^\d+$/.test(arg)) {
      scriptNum = parseInt(arg, 10);
    }
  }

  return { scriptNum, variations, post, picks };
}

// ── Generate variations, judge, return winning picks ──

async function generateAndJudge(
  script: ScriptData,
  variations: number
): Promise<number[]> {
  const outputDir = join(OUTPUT_DIR, script.slug);
  await mkdir(outputDir, { recursive: true });

  const totalImages = script.slides.length * variations;
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Script ${script.number}: "${script.hook}"`);
  console.log(`${script.slides.length} slides x ${variations} variations = ${totalImages} images`);
  console.log(`${"=".repeat(60)}`);

  const winners: number[] = [];

  for (let s = 0; s < script.slides.length; s++) {
    const slide = script.slides[s];
    console.log(`\n── Slide ${s + 1}/${script.slides.length}: ${slide.name} ──`);

    // Generate all variations for this slide
    const variationBuffers: Buffer[] = [];

    for (let v = 1; v <= variations; v++) {
      console.log(`  [v${v}/${variations}] Generating...`);

      let imageBuffer = await generateImage(slide.prompt);

      if (slide.overlayText) {
        imageBuffer = await addTextOverlay(imageBuffer, slide.overlayText);
      }

      const filename = `slide-${s + 1}-v${v}.png`;
      await writeFile(join(outputDir, filename), imageBuffer);
      variationBuffers.push(imageBuffer);
      console.log(`  [v${v}/${variations}] Saved ${filename}`);

      if (v < variations) await sleep(DELAY_MS);
    }

    // Judge: send all variations to Gemini vision
    console.log(`  Judging ${variations} variations...`);
    const { winner, reasoning } = await pickBestImage(
      variationBuffers,
      slide.prompt
    );
    const winnerV = winner + 1; // 1-indexed for display
    winners.push(winnerV);
    console.log(`  Winner: v${winnerV} — ${reasoning}`);

    if (s < script.slides.length - 1) await sleep(DELAY_MS);
  }

  // Save caption + picks
  await writeFile(join(outputDir, "caption.txt"), script.caption);
  await writeFile(join(outputDir, "picks.json"), JSON.stringify({
    script: script.number,
    slug: script.slug,
    picks: winners,
    picksString: winners.join(","),
  }, null, 2));

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Results for Script ${script.number}:`);
  for (let s = 0; s < script.slides.length; s++) {
    console.log(`  Slide ${s + 1} (${script.slides[s].name}): v${winners[s]}`);
  }
  console.log(`Picks: ${winners.join(",")}`);
  console.log(`Output: ${outputDir}`);
  console.log(`${"=".repeat(60)}`);

  // Open in Finder
  const proc = Bun.spawn(["open", outputDir]);
  await proc.exited;

  return winners;
}

// ── Post picks to Postiz ──

async function postPicks(
  script: ScriptData,
  picks: number[]
): Promise<void> {
  if (picks.length !== script.slides.length) {
    console.error(
      `Error: ${picks.length} picks but script has ${script.slides.length} slides`
    );
    process.exit(1);
  }

  const outputDir = join(OUTPUT_DIR, script.slug);

  console.log(`\nPosting Script ${script.number}: "${script.hook}"`);
  console.log(`Picks: ${picks.join(",")}`);

  const uploaded = [];
  for (let s = 0; s < script.slides.length; s++) {
    const v = picks[s];
    const filename = `slide-${s + 1}-v${v}.png`;
    const filepath = join(outputDir, filename);

    console.log(`  Uploading ${filename}...`);
    const imageBuffer = Buffer.from(await readFile(filepath));
    const result = await uploadImage(imageBuffer, `${script.slug}-slide-${s + 1}.png`);
    uploaded.push(result);
    console.log(`  Uploaded: ${result.path}`);
  }

  console.log(`Creating TikTok draft...`);
  const postResult = await createTikTokDraft(script.caption, uploaded);
  console.log(`TikTok draft created!`);
  console.log(JSON.stringify(postResult, null, 2));
}

// ── Load saved picks ──

async function loadSavedPicks(script: ScriptData): Promise<number[] | null> {
  try {
    const picksPath = join(OUTPUT_DIR, script.slug, "picks.json");
    const data = JSON.parse(await readFile(picksPath, "utf-8"));
    return data.picks;
  } catch {
    return null;
  }
}

// ── Main ──

const { scriptNum, variations, post, picks } = parseArgs();

if (!scriptNum) {
  console.log(`
Usage: bun run generate.ts <script-number|--all> [options]

Generate & judge:
  bun run generate.ts 1                    Generate 5 variations per slide, auto-pick best
  bun run generate.ts 1 --variations 3     Generate 3 variations instead of 5
  bun run generate.ts --all                Generate all 8 scripts

Post to TikTok:
  bun run generate.ts 1 --post             Post auto-picked winners to Postiz
  bun run generate.ts 1 --post --picks 2,1,3,1   Override picks manually

Available scripts:`);

  for (const s of SCRIPTS) {
    console.log(`  ${s.number}. [${s.audience}] "${s.hook}" (${s.slides.length} slides)`);
  }
  process.exit(0);
}

if (post) {
  // Post mode
  if (scriptNum === "all") {
    console.error("Error: --post only works with a single script number");
    process.exit(1);
  }
  const script = getScript(scriptNum);
  if (!script) {
    console.error(`Error: Script ${scriptNum} not found (valid: 1-8)`);
    process.exit(1);
  }

  // Use manual picks if provided, otherwise load saved picks from judging
  const finalPicks = picks ?? await loadSavedPicks(script);
  if (!finalPicks) {
    console.error("Error: No picks found. Run generation first, or provide --picks manually.");
    process.exit(1);
  }

  await postPicks(script, finalPicks);
} else {
  // Generate + judge mode
  const scriptsToGenerate: ScriptData[] =
    scriptNum === "all"
      ? SCRIPTS
      : (() => {
          const s = getScript(scriptNum);
          if (!s) {
            console.error(`Error: Script ${scriptNum} not found (valid: 1-8)`);
            process.exit(1);
          }
          return [s];
        })();

  for (const script of scriptsToGenerate) {
    await generateAndJudge(script, variations);
  }
}
