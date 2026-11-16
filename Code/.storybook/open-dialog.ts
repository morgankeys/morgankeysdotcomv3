/** Opens the first dialog in a story so overlay shells are visible. */
export async function openDialog({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}): Promise<void> {
  const dialog = canvasElement.querySelector("dialog");
  if (dialog instanceof HTMLDialogElement && !dialog.open) {
    dialog.showModal();
  }
}
