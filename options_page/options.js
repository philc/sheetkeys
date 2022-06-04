async function init() {
  await Settings.set({keyMappings: "map j moveLeft"});
  const result = await Settings.get();
  console.log(">>>> result:", result);
}

document.addEventListener("DOMContentLoaded", init);
