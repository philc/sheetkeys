async function init() {
  let h = new HelpDialog();
  await h.show();
}

document.addEventListener("DOMContentLoaded", init);
