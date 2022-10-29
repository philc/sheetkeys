async function init() {
  const h = new HelpDialog();
  await h.show();
}

document.addEventListener("DOMContentLoaded", init);
