import photoUrl from "../assets/placeholder-raster.jpg?url";
import photo from "../assets/placeholder-raster.jpg";
import logoUrl from "../assets/logos/company/opengov.png?url";
import logo from "../assets/logos/company/opengov.png";

/**
 * The file import's src is an absolute `/@fs` path. From the dev server that
 * request 404s. The `?url` import is the file Storybook serves under its base.
 */
function servedImage<T extends { src: string }>(file: T, url: string): T {
  return { ...file, src: url };
}

/** Shared picture for stories. Real pages never import this module. */
export const sampleImage = servedImage(photo, photoUrl);

/** Small mark for company labels and end marks. */
export const sampleLogo = servedImage(logo, logoUrl);

export const sampleHighlights = [
  { value: "12", detail: "Teams using the kit" },
  { value: "4 wks", detail: "From a blank repo to the first study" },
  { value: "1", detail: "Place to see every component" },
];
