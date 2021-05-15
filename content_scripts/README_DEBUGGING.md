

```ts
var menuItems = document.querySelectorAll(".goog-menuitem");
var menuItems = Array.from(menuItems);
textItems = menuItems.map(item => item.innerText)

var searchItems = menuItems.filter(item => item.innerText == "Font size")

// Print all itmes that match partial

var searchTerm = "Search the menu"
textItems
    .filter(item => item != undefined)
    .filter(item => item.includes(searchTerm))
    .map(item => {
        console.log(item);
        return item;
    })


var searchTerm = "border"
textItems
    .filter(item => item != undefined)
    .filter(item => item.match(searchTerm))
    .map(item => {
        console.log(item);
        return item;
    })



KeyboardUtils.simulateClick(
    SheetActions.getMenuItem("90%")
)


// Toolbar icons

var toolbarItems = document.querySelectorAll(".goog-toolbar-menu-button");
var toolbarItems = document.querySelectorAll(".toolbar-icon");
var toolbarItems = Array.from(toolbarItems);

var searchTerm = "Top border"
toolbarItems
    // .map(item => item.attributes['data-tooltip'])
    .filter(item => item.attributes['data-tooltip'] != undefined)
    .filter(item => item.attributes['data-tooltip'].nodeValue.includes(searchTerm))
    .map(item => {
        // console.log(item);
        console.log(item.attributes['data-tooltip'].nodeValue);
        return item;
    })


var el = document.querySelector(`*[placeholder='Search the menus (Option+/)']`);
KeyboardUtils.simulateClick(el);
el.focus();

```

