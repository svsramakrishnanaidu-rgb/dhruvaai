import leafSpot from "@/assets/diseases/leaf-spot.jpg";
import blight from "@/assets/diseases/blight.jpg";
import rust from "@/assets/diseases/rust.jpg";
import wilt from "@/assets/diseases/wilt.jpg";
import powdery from "@/assets/diseases/powdery-mildew.jpg";
import downy from "@/assets/diseases/downy-mildew.jpg";
import rot from "@/assets/diseases/rot.jpg";
import mosaic from "@/assets/diseases/mosaic-virus.jpg";
import blast from "@/assets/diseases/blast.jpg";
import borer from "@/assets/diseases/borer.jpg";
import anthracnose from "@/assets/diseases/anthracnose.jpg";
import smut from "@/assets/diseases/smut.jpg";
import aphids from "@/assets/diseases/aphids.jpg";
import bacterial from "@/assets/diseases/bacterial.jpg";

// Ordered keyword → image mapping. First match wins, so more specific
// keywords (e.g. "powdery mildew") must appear before generic ones ("mildew").
const RULES: [RegExp, string][] = [
  [/anthracn/i, anthracnose],
  [/powder/i, powdery],
  [/downy/i, downy],
  [/mildew/i, powdery],
  [/blast/i, blast],
  [/rust|orange spot/i, rust],
  [/smut|bunt/i, smut],
  [/mosaic|virus|yellow vein|curl/i, mosaic],
  [/borer|stem\s*fly|caterpillar|worm|larva/i, borer],
  [/aphid|hopper|thrip|whitefly|jassid|mite|mealy/i, aphids],
  [/bacter|blight/i, bacterial],
  [/blight|scorch/i, blight],
  [/wilt|droop|yellowing/i, wilt],
  [/rot|damping|decay|smoulder/i, rot],
  [/spot|specks|lesion|patch/i, leafSpot],
];

const FALLBACK = leafSpot;

/** Returns a representative photo for a disease name (keyword-matched). */
export function diseaseImage(name: string): string {
  for (const [re, img] of RULES) if (re.test(name)) return img;
  return FALLBACK;
}
