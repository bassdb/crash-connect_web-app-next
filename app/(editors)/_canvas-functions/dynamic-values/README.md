# Dynamic Values Actions

This folder contains action functions for managing dynamic values (user and team data) in the design template editor.

## Architecture

These actions are separated from the Zustand store to enable easy usage from client components without directly importing the store.

## Available Actions

### `applyPreviewValues()`

Applies preview values to saved values. Call this when the user confirms their changes.

```typescript
import { applyPreviewValues } from "@/app/(editors)/_canvas-functions/dynamic-values";

function handleApply() {
  applyPreviewValues();
  // Changes are now saved
}
```

### `discardPreviewValues()`

Discards preview values and resets them to saved values. Call this when the user cancels their changes.

```typescript
import { discardPreviewValues } from "@/app/(editors)/_canvas-functions/dynamic-values";

function handleCancel() {
  discardPreviewValues();
  // Preview values are reset to saved values
}
```

### `loadSavedValues(values)`

Loads saved values from server/database. Merges with default values and updates both saved and preview values.

```typescript
import { loadSavedValues } from "@/app/(editors)/_canvas-functions/dynamic-values";

function handleLoad(serverData) {
  loadSavedValues({
    name: serverData.name,
    jerseyNumber: serverData.jerseyNumber,
    userPrimaryColor: serverData.primaryColor,
    // ... other values
  });
}
```

### `loadFromExampleTeam(teamId, teamName, teamLogoUrl, colors)`

Loads team values from an example team into preview values. Updates team name, logo, colors, and selected team ID. User values remain unchanged.

```typescript
import { loadFromExampleTeam } from "@/app/(editors)/_canvas-functions/dynamic-values";

function handleSelectTeam(team) {
  loadFromExampleTeam(
    team.id,
    team.name,
    team.team_logo_url,
    team.colors // Array of { name: 'primary', value: '#FF0000', label: 'Primary' }
  );
}
```

### `resetToDefaults()`

Resets preview values to default values. Saved values remain unchanged.

```typescript
import { resetToDefaults } from "@/app/(editors)/_canvas-functions/dynamic-values";

function handleReset() {
  resetToDefaults();
  // Preview values are reset to defaults
}
```

### `setDynamicValuesLoading(isLoading)`

Sets the loading state for dynamic values.

```typescript
import { setDynamicValuesLoading } from "@/app/(editors)/_canvas-functions/dynamic-values";

async function loadData() {
  setDynamicValuesLoading(true);
  try {
    // Load data...
  } finally {
    setDynamicValuesLoading(false);
  }
}
```

## Usage in Components

### Using with the Store Hook

For reading values, use the store hook directly:

```typescript
'use client'

import useDynamicValuesStore from '@/app/(editors)/_hooks/useDynamicValuesStore'
import { applyPreviewValues, discardPreviewValues } from '@/app/(editors)/_canvas-functions/dynamic-values'

function MyComponent() {
  const { previewValues, savedValues, isDirty } = useDynamicValuesStore()

  return (
    <div>
      <input
        value={previewValues.name}
        onChange={(e) => {
          useDynamicValuesStore.getState().setPreviewName(e.target.value)
        }}
      />

      {isDirty && (
        <div>
          <button onClick={applyPreviewValues}>Save</button>
          <button onClick={discardPreviewValues}>Cancel</button>
        </div>
      )}
    </div>
  )
}
```

## Color Mapping

When loading team colors, the following mapping is used:

- `primary` → `teamPrimaryColor`
- `secondary` → `teamSecondaryColor`
- `accent` → `teamTertiaryColor`
- `tertiary` → `teamTertiaryColor`

## Store Structure

The store maintains two sets of values:

- **savedValues**: Values that have been persisted (from server/database)
- **previewValues**: Temporary values being edited

The `isDirty` flag is automatically calculated when preview values differ from saved values.
