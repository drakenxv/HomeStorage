# Changelog

## v0.1 2026-08-11
### added
* "Add manually" button in add/remove screen

## v0.2 2026-08-11
### added
* Category dropdown list
** free typing but also suggestions from previous entered categories
** categories can be managed in a new "category" section in the burger menu
* language switch
** language switch german / english in settings

### changed
* in the add/remove screen changed the hint-text in the search box to "search by name or category"
** removed functionality to search by barcode from search bar
** added functionality to search by category to the search bar
* made the add manually button the same size as the scan barcode button

### removed
* in dashboard removed the tiles for "products", "units in stock", "below minimum"

## v0.3 2026-08-11
### added
* settings functionality to Create, Update or Delete item size units
* "New Item" form
** add a "Cancel" button in form of an "x" in the top right corner


### changed
* "New Item" form
** changed the order
- Name
- Amount
--> add a "+" and "-" button at the end of the line to increase or decrease by one unit
- category
- storage place
--> add a jumping point to a pop-up window to create a new storage place
- item size
- item size unit
--> place the item size unit in the same line as the item size
- best-before
--> make the best before in the format of "mm/yy" and let me enter it by typing "mmyy" and interpret that as "01.mm.yyyy" in the report / dashboard
- minimum
- barcode
- notes
- Recipe Cross reference
--> new name "recipes"
--> it shall not be a text field but a dynamic list of every recipe where this item is used sorted a-z (future release)

* Changed "Inventory" title to "HomeStorage"
* title now a link to homescreen (Dashboard)
* Dashboard has no "Add / remove items" button anymore

### removed

