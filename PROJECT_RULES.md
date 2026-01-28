# Project Rules & Context

This file contains critical rules and context to prevent recurring issues in the ELIXIR Ireland website project.

## 1. Jekyll / YAML Front Matter
**CRITICAL**: The `description` field in YAML front matter MUST be on a single line. Do not split it across multiple lines, as this causes a Jekyll build `YAML Exception`.

**Correct**:
```yaml
description: This is a long description that should stay on one line regardless of length.
```

**Incorrect** (Causes Build Failure):
```yaml
description: This is a long description that
  has been split across lines.
```

**Validation Utility**:
I have created a script at `scripts/validate_front_matter.py`. Run this script whenever you modify HTML files to ensure YAML front matter remains valid:
```bash
python3 scripts/validate_front_matter.py
```

## 2. Formatting & Style
-   **Cursor Behavior**: Cards that are not links (e.g., Team Member cards) should NOT have `cursor: pointer`. Only the specific interactive elements (like email icons) inside them should have the pointer cursor.
-   **Image Styling**: Use `object-position` to ensure faces are not cropped in circular avatars (e.g., Pilib Ó Broin).
