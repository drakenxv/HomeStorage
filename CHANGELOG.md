# Changelog

## v0.5 2026-08-11
### added
* Settings toggle for dark/light mode with persistent user preference
* Shopping list actions to add items by barcode or by name directly from the shopping screen
* Category management now supports a 2-level parent/subcategory relation
* Storage places rendered in a nested tree view with slash-delimited parent paths
* Storage parent selectors now show full breadcrumb paths
* Added delete protection to prevent deleting storage places or items when attached stock exists
* Inventory and add/remove flows now use symbol labels for add, remove, edit, view, and inventory

### changed
* All action labels updated to symbols: +, -, pencil, list, trash bin
* Inventory uses full storage paths when showing locations
* Search and category filters support category path labels
* Theme toggle now persists across reloads
* Remove flow respects available stock and prevents invalid deletions

### removed
* none

---

## v0.4 2026-08-11
### added
* Storage
** added parent-relations to storage places
** view the inventory of a storage place
* Inventory
** added a filter function for categories
** added a search function on the name
* Inventory
** added a button to view all listings of an item
- where are the items placed
- what best-before dates are there with what amount
* Items
** edit the details of an item
* barcode scanning
** if an item with the specific barcode is already created (even though not in stock) jump to the change amount screen and offer two new buttons: "create new" and "change item"


### changed
* reports
** each report is now its own sub-screen
** make the link to the Dashboard a proper button not a link formatting
* "New Item" form
** when adding a storage place but canceling not the entire form will be closed but only the "add storage place" form
** drop down of categories does not work
* Change item amount form
** give it the same best-before settings as in the "New Item" form
** the same +/- buttons for the Amount change as in v0.3
** automatically select the same storage place as the majority of these items are already
* Rename the title of the inventory page to "Inventory"

### removed

---
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
* none

---

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

---

## v0.1 2026-08-11
### added
* "Add manually" button in add/remove screen