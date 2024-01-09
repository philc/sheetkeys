## SheetKeys - The Hacker's Spreadsheet

SheetKeys is a browser extension which adds powerful keyboard shortcuts to Google Sheets, in the
spirit of the Vim text editor. It's written by one of the authors of
[Vimium](https://github.com/philc/vimium).

[Watch the demo video here](https://www.youtube.com/watch?v=aUgHj2qrXe4).

If you are a project manager, programmer, finance person, or just someone who uses spreadsheets a
lot, this can greatly increase your efficiency in Google Sheets.

(If you are using SheetKeys with [Vimium](https://github.com/philc/vimium), disable Vimium on Google
Sheets so its key mappings don't collide with SheetKeys. To do so, click on the Vimium icon in your
browser's toolbar, enter `https?://docs.google.com/spreadsheets/*` for the excluded sites Pattern,
and click Save.)

## How to install

* Chrome:
  [Chrome web store](https://chrome.google.com/webstore/detail/sheetkeys/dnckajfoijllhbnfdhdklcfpckcbonhi)
* Edge:
  [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/sheetkeys/ekpdiiifhofjohmblmajadhemckcjice)
* Firefox: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/sheetkeys/)

To install from source, see
[here](https://github.com/philc/sheetkeys/wiki/How-to-install-from-source).

## Keyboard Mappings

SheetKeys adds many key mappings to Google Sheets. After installing, you can see and customize all
of them by typing `?` while on a Google Sheets page.

Here is a partial list:

**Movement**

    j      Move cursor down
    k      Move cursor up
    h      Move cursor left
    l      Move cursor right

    C-J    Move rows down
    C-K    Move rows up
    C-H    Move columns left
    C-L    Move columns right

    C-d    Scroll half page down
    C-u    Scroll half page up
    gg    Scroll to the top of the sheet
    G      Scroll to the bottom of the sheet

**Selection**

    v      Begin selecting cells
    V      Begin selecting rows
    A-v    Begin selecting columns

**Editing**

    i      Edit cell
    a      Append to cell (edit but, starting at the end)
    u      Undo
    C-r    Redo

    o      Insert a row below the cursor and edit it
    O      Insert a row above the cursor and edit it
    s      Insert a row below the cursor
    S      Insert a row above the cursor

    dd    Delete the current row (or selected rows/columns)
    x      Delete cell contents
    yy    Copy the current row (or selected rows/columns)
    yc    Copy cells
    p      Paste

    ;ma  Merge selected cells
    ;mh  Merge selected cells horizontally
    ;mv  Merge selected cells vertically

**Formatting**

    ;al  Align left
    ;ac  Align center
    ;ar  Align right

    ;ww  Wrap cell
    ;ww  Overflow the cell
    ;wc  Clip the cell


    ;fs  Set font size to small
    ;fn  Set font size to normal
    ;fl  Set font size to large

    ;fr  Freeze row
    ;fc  Freeze column

**Tabs**

    >>    Move tab right
    <<    Move tab left
    K      Next tab
    J      Previous tab

**Other**

    ?      Show the help dialog
    ;wf  Toggle full screen
    ;o     Open URL in cell in a new tab

**Repeating commands**

SheetKeys supports command repetition. For example, typing `5s` will insert 5 rows into the sheet
rather than one. Due to the integration with Google Sheets, undoing a repeated command will undo it
one step at a time.

## Other usability improvements to Google Sheets

* In Google Sheets, when editing a cell, typing ESC erases all of the changes you've made, and your
  changes can't be brought back with "Undo". This can be infuriating when done accidentally.
  SheetKeys fixes this. Now ESC will save your changes to the cell, and you can revert them if
  needed by using Undo.
* `Ctrl-e` on Mac OS X is a handy system-wide shortcut which moves the cursor to the end of the form
  field you're currently editing. This essential shortcut doesn't work in Google Sheets. With
  SheetKeys, it does.
* Sheets has a useful full screen mode (View > Full screen) which allows many more rows of the
  spreadsheet to be visible on screen. But it has two inconveniences: there is no keyboard shortcut
  for toggling it, and there's a persistent popup whenever one enters full screen mode. SheetKeys
  adds a shortcut for it, and auto-dismisses the popup for you.

## Developer workflow

* You can use the
  [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)
  which provides a quick shortcut for reloading all of your locally-developed extensions. See
  [here](http://stackoverflow.com/a/12767200/46237) for further info.
* Refresh your Google Sheets page after reloading the SheetKeys extension in Chrome.
* If you want to load this extension in Firefox from source, run `./make.js write-firefox-manifest`
  to get a Firefox-compatible manifest.json. Then navigate to `about:debugging` and add SheetKeys.

## Release notes

See [changelog.md](CHANGELOG.md).

## License

Copyright (c) Phil Crosby. See [MIT-LICENSE.txt](MIT-LICENSE.txt) for details.
