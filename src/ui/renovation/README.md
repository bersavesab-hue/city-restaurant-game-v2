# Mobile Renovation Page

The mobile renovation page keeps the store floor plan as the primary workspace.

Layout priorities:

- Top bar: balance, current renovation cost, remaining balance, layout score.
- Center: maximum-size draggable store grid.
- Bottom sheet: furniture categories and horizontal furniture cards.
- Selected placement: floating rotate/delete controls only while selected.
- Layout issues: collapsed by default and expandable on demand.
- Templates: separate expandable entry; preview never changes finance or live operations.
- Save: commits the draft once; Save & Activate commits and enables the layout.

`RenovationMobilePageSystem` is UI-state only. Persistent renovation data remains owned by `RenovationSystem`/`RenovationEditorSystem`.
