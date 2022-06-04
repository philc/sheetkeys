async function init() {
  // await Settings.set({keyMappings: "map j moveLeft"});
  // const result = await Settings.get();
  // console.log(">>>> result:", result);
  let h = new HelpDialog();
  await h.getHtml();

}

document.addEventListener("DOMContentLoaded", init);
