# Changelog

## v0.6 2026-08-11
### added
* Inventory buttons are now visually consistent in width and height
* Inventory item action buttons are right-aligned while item text remains left-aligned

### changed
* Unified button sizing across the app to keep symbols like + and − the same size
* Inventory screen item cards now keep action controls separated from item labels

### removed
* none

---

## v0.5 2026-08-11
### added
* Dark/light theme toggle in settings with persisted preference
* Shopping list actions for adding items by barcode or by name directly on the shopping screen
* Category management now supports a 2-level parent/subcategory structure
* Storage places displayed as a nested tree view with slash-delimited parent paths
* Storage parent selector shows full breadcrumb-style paths
* Delete protection when storage places or items still have attached stock
* Symbol-based labels for actions: +, −, pencil, list, trash bin

### changed
* Replaced all add/remove/edit/view labels with icon symbols
* Inventory and storage displays now use full path labels
* Search supports nested category labels and paths
* Theme selection is permanently stored and reapplied
* Removal flows are safer and block invalid stock deletes

### removed
* none

---

## v0.4 2026-08-11
### added
* Storage places now support parent relationships
* Storage view shows nested storage and inventory per place
* Inventory filter by category and search by item name
* Item listing view shows locations, quantities, and best-before dates
* Item edit screen added for item detail updates
* Barcode scanning now recognizes existing items and offers create or edit flows

### changed
* Reports split into expiring and under-minimum sub-screens
* Dashboard navigation simplified with proper buttons
* New Item form allows creating a storage place without closing the item form
* Add/remove amount screen uses matching best-before and +/- controls
* Inventory header label updated to the list symbol

### removed
* none

---

## v0.3 2026-08-11
### added
* Settings section for managing item size units
* New Item form with a cancel button as an X in the top-right

### changed
* New Item form updated order:
  - Name
  - Amount (+/− buttons)
  - Category
  - Storage place (+ new storage shortcut)
  - Item size
  - Item size unit
  - Best-before (mmyy input converted to mm/yy display)
  - Minimum
  - Barcode
  - Notes
  - Recipes
* Item size unit now appears inline with item size
* Header title changed to HomeStorage
* Dashboard layout removed the add/remove button

### removed
* none

---

## v0.2 2026-08-11
### added
* Category dropdown with free typing and suggestion support
* Category management screen in the menu
* Language switch added in settings

### changed
* Add/remove search box now searches by name or category
* Barcode search removed from the main search input
* Add manual and scan barcode buttons matched in width

### removed
* Dashboard tiles for products, units in stock, and below minimum

---

## v0.1 2026-08-11
### added
* Initial add/remove screen with a manual add button

### changed
* none

### removed
* none