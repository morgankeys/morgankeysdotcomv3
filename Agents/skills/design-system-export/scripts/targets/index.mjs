// Target registry. To support a new platform, add a module here that exports
// { id, title, summary, build(model) } and returns { files, archives?, next? }.
import designMd from "./design-md.mjs";
import lovable from "./lovable.mjs";
import replit from "./replit.mjs";
import bolt from "./bolt.mjs";
import v0 from "./v0.mjs";
import figmaMake from "./figma-make.mjs";

export const targets = [designMd, lovable, replit, bolt, v0, figmaMake];
