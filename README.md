## SheetKeys - The Hacker's Spreadsheet

Sheetkeys is a Chrome extension which adds powerful keyboard navigation shortcuts to Google Sheets, in the
spirit of the Vim text editor. It's written by one of the authors of
[Vimium](https://github.com/philc/vimium).

If you are a project manager, programmer, finance person, or just someone who uses spreadsheets a lot, this
can greatly increase your efficiency in Google Sheets.

(If you are using SheetKeys with [Vimium](https://github.com/philc/vimium), disable Vimium on Google Sheets so
its key mappings don't collide with SheetKeys. To do so, click on the Vimium icon in Chrome's toolbar, enter
`https?://docs.google.com/spreadsheets/*` for the excluded sites Pattern, and click Save.)

## How to install

Install on the Chrome web store (coming soon).

To install from source, see [here](https://github.com/philc/sheetkeys/wiki/How-to-install-from-source).

## Keyboard Mappings

SheetKeys adds many key mappings to Google Sheets. After installing, you can see and customize all of them by
typing `?` while on a Google Sheets page.

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
    g,g    Scroll to the top of the sheet
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

    d,d    Delete the current row (or selected rows/columns)
    x      Delete cell contents
    y,y    Copy the current row (or selected rows/columns)
    y,c    Copy cells
    p      Paste

    ;,m,a  Merge selected cells
    ;,m,h  Merge selected cells horizontally
    ;,m,v  Merge selected cells vertically

**Formatting**

    ;,a,l  Align left
    ;,a,c  Align center
    ;,a,r  Align right

    ;,w,w  Wrap cell
    ;,w,w  Overflow the cell
    ;,w,c  Clip the cell


    ;,f,s  Set font size to small
    ;,f,n  Set font size to normal
    ;,f,l  Set font size to large

    ;,f,r  Freeze row
    ;,f,c  Freeze column

**Other**

    ?      Show the help dialog
    ;,w,f  Toggle full screen
    ;o     Open URL in cell in a new tab

## Other usability improvements to Google Sheets

* In Google Sheets, when editing a cell, typing ESC erases all of the changes you've made, and your changes
  can't be brought back with "Undo". This can be infuriating when done accidentally. Sheetkeys fixes this. Now
  ESC will save your changes to the cell, and you can revert them if needed by using Undo.
* `Ctrl-e` on Mac OS X is a handy system-wide shortcut which moves the cursor to the end of the form field
  you're currently editing. This essential shortcut doesn't work in Google Sheets. With Sheetkeys, it does.
* Sheets has a useful full screen mode (View > Full screen) which allows many more rows of the spreadsheet to
  be visible on screen. But it has two inconveniences: there is no keyboard shortcut for toggling it, and
  there's a persistent popup whenever one enters full screen mode. SheetKeys adds a shortcut for it, and
  auto-dismisses the popup for you.

## Developer workflow

* You can use the
  [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)
  which provides a quick shortcut for reloading all of your locally-developed extensions. See
  [here](http://stackoverflow.com/a/12767200/46237) for further info.
* Refresh your Google Sheets page after reloading the Sheetkeys extension in Chrome.

## License

Copyright (c) Phil Crosby. See [MIT-LICENSE.txt](MIT-LICENSE.txt) for details.
