// Run this code through Figma MCP's `use_figma` tool against the Dune library.
// It recomputes every Figma-bound px line height from:
//
//   Size × Line Height (percent) ÷ 100
//
// Load the `figma-use` skill first and pass its session ID to the tool call.

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const variables = await figma.variables.getLocalVariablesAsync();
const typescale = collections.find(
  (collection) => collection.name === "Typescale",
);

if (!typescale) {
  throw new Error("Typescale collection not found");
}

const byId = new Map(variables.map((variable) => [variable.id, variable]));
const editorialVariables = variables.filter(
  (variable) =>
    variable.variableCollectionId === typescale.id &&
    variable.name.startsWith("Editorial/"),
);

const resolveValue = (value) => {
  if (!value || typeof value !== "object" || value.type !== "VARIABLE_ALIAS") {
    return value;
  }

  const target = byId.get(value.id);
  if (!target) throw new Error(`Alias target not found: ${value.id}`);

  const targetValue = Object.values(target.valuesByMode)[0];
  return resolveValue(targetValue);
};

const roles = [
  ...new Set(
    editorialVariables.map((variable) =>
      variable.name.split("/").slice(0, 2).join("/"),
    ),
  ),
];
const updated = [];

for (const role of roles) {
  const find = (leaf) =>
    editorialVariables.find((variable) => variable.name === `${role}/${leaf}`);
  const size = find("Size");
  const percent = find("Line Height (percent)");
  const px = find("Line Height (px)");

  if (!size || !percent || !px) {
    throw new Error(`${role} is missing Size, percent, or px line height`);
  }

  for (const mode of typescale.modes) {
    const sizeValue = Number(resolveValue(size.valuesByMode[mode.modeId]));
    const percentValue = Number(
      resolveValue(percent.valuesByMode[mode.modeId]),
    );

    if (!Number.isFinite(sizeValue) || !Number.isFinite(percentValue)) {
      throw new Error(`${role}/${mode.name} has a non-numeric size or percent`);
    }
    if (percentValue < 80 || percentValue > 250) {
      throw new Error(
        `${role}/${mode.name} percent ${percentValue} is outside 80–250`,
      );
    }

    const value =
      Math.round(((sizeValue * percentValue) / 100) * 10000) / 10000;
    px.setValueForMode(mode.modeId, value);
    updated.push({
      role,
      mode: mode.name,
      size: sizeValue,
      percent: percentValue,
      px: value,
    });
  }
}

return {
  collectionId: typescale.id,
  roles: roles.length,
  valuesUpdated: updated.length,
  updated,
};
