# Renovation UI

The only mountable renovation UI entry is `RenovationGameView`.

Internal modules such as `RenovationEditorBaseView` and `RenovationFloorplanBaseView` only provide interaction and floorplan rendering primitives. They are not route entries and are not re-exported from the public UI barrel.

Layout priorities:

- Global game top bar and formal page title.
- Real floor plan as the primary workspace.
- Layout templates, floor/zone switching, zoom and diagnosis.
- Furniture categories and draggable furniture cards.
- Selected placement rotate/delete controls.
- Layout score and operating-effect diagnostics.
- Draft save and construction confirmation.

`RenovationMobilePageSystem` remains UI-state logic only. Persistent renovation data remains owned by `RenovationSystem` and `RenovationEditorSystem`.
