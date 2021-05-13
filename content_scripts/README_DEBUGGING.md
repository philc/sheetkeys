

```ts
var menuItems = document.querySelectorAll(".goog-menuitem");
var menuItems = Array.from(menuItems);
textItems = menuItems.map(item => item.innerText)

var searchItems = menuItems.filter(item => item.innerText == "Font size")

textItems
    .filter(item => item != undefined)
    .filter(item => item.includes('Font size'))
    .map(item => {
        console.log(item);
        return item;
    })



KeyboardUtils.simulateClick(
    SheetActions.getMenuItem("10")
)

```