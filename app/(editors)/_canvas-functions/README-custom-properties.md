# Fabric.js Custom Properties

Diese Dokumentation erklärt, wie Custom Properties in Fabric.js implementiert und verwendet werden.

## Implementierung

Die Custom Properties sind nach dem offiziellen Fabric.js Pattern implementiert:

### 1. TypeScript Type Declaration (`layer-management/types.ts`)

```typescript
declare module 'fabric' {
  interface FabricObject {
    dynamicLayerType?: 'team_logo' | 'primary_color' | ...
    name?: string
  }

  interface SerializedObjectProps {
    dynamicLayerType?: string
    name?: string
  }
}
```

### 2. Runtime Registration (`canvas-setup.ts`)

```typescript
import { FabricObject } from "fabric";

export const initializeFabricCustomProperties = () => {
  FabricObject.customProperties = ["dynamicLayerType", "name"];
};
```

### 3. Aufruf beim Canvas Init

```typescript
import { initializeFabricCustomProperties } from '@/app/(editors)/_canvas-functions/canvas-setup'

useEffect(() => {
  // MUSS VOR der Canvas-Erstellung aufgerufen werden
  initializeFabricCustomProperties()

  const canvas = new fabric.Canvas(...)
}, [])
```

## Verwendung

### Properties setzen

```typescript
// ✅ Korrekt: Mit TypeScript Type-Safety
const rect = new fabric.Rect({...})
rect.dynamicLayerType = 'team_logo'
rect.name = 'Mein Layer'

// ❌ Alt (funktioniert noch, aber nicht empfohlen)
(rect as any).dynamicLayerType = 'team_logo'
```

### Serialisierung

```typescript
// Die customProperties werden automatisch inkludiert!
const json = canvas.toJSON();
// enthält: { objects: [{ ..., dynamicLayerType: 'team_logo', name: '...' }] }

// Zusätzliche Properties können optional angegeben werden:
const jsonWithExtra = canvas.toJSON(["data", "visible"]);
```

### Deserialisierung

```typescript
// Custom Properties werden automatisch wiederhergestellt
canvas.loadFromJSON(json, () => {
  const objects = canvas.getObjects();
  objects.forEach((obj) => {
    console.log(obj.dynamicLayerType); // ✅ TypeScript kennt diese Property
    console.log(obj.name); // ✅ TypeScript kennt diese Property
  });
});
```

## Vorteile

1. **Type-Safety**: TypeScript kennt die Properties und bietet Autocomplete
2. **Automatische Serialisierung**: Keine manuellen toJSON-Parameter mehr nötig
3. **Sauber und wartbar**: Ein zentraler Ort für die Definition
4. **Fabric.js Standard**: Folgt der offiziellen Dokumentation

## Migration vom alten `data`-Objekt

Das alte Pattern:

```typescript
// ❌ Alt
obj.data = {
  dynamicType: "team_logo",
  name: "Layer 1",
};
```

Neues Pattern:

```typescript
// ✅ Neu
obj.dynamicLayerType = "team_logo";
obj.name = "Layer 1";
```

**Hinweis**: Das `data`-Objekt bleibt aus Kompatibilitätsgründen erhalten und wird weiterhin serialisiert (siehe `serialization.ts`).

## Wichtig

- `initializeFabricCustomProperties()` muss **einmalig** beim App-Start aufgerufen werden
- Aufruf erfolgt **VOR** der Canvas-Erstellung
- Properties gelten dann **global** für alle FabricObject-Instanzen
- **Nicht** bei jedem Layer oder bei jeder Serialisierung neu setzen!
