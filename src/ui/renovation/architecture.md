Renovation UI architecture:

- RenovationSystem owns persistent renovation layout data.
- RenovationEditorSystem owns temporary draft-edit semantics and one-time save charging.
- RenovationMobilePageSystem owns only mobile page interaction state and delegates all mutations to RenovationEditorSystem.
- No ordinary drag gesture writes persistent entities.
