# WILDCASE Case Design Manual

## 1. Principles of an Outdoor Mystery

A high-quality WILDCASE case must turn a 30-minute outdoor walk into an atmospheric investigative thriller.

### Core Case Ingredients

1. **Intriguing Premise**: A clear incident (theft, tampering, historical cipher, missing artifact) that left physical traces outdoors.
2. **Distinct Physical Sector**: Designed for specific terrain:
   - `park_green`: Trails, tree bark, benches, boundary fences, stone walls.
   - `urban_alley`: Brick masonry, metal utility boxes, fire escapes, bollards, signs.
   - `suburban_trail`: Footbridges, wooden markers, storm culverts, paving stones.
   - `coastal_dock`: Wooden pilings, metal cleats, ropes, weathered planks.
   - `campus_quad`: Archways, bronze plaques, stone pillars, iron gates.
3. **Exactly Three Suspects**:
   - Each suspect has a distinct occupation, access method, and physical habits.
   - Example: An electrician who uses copper wire vs a surveyor who uses red paint vs a caretaker who carries heavy keys.
4. **Exactly One True Culprit**:
   - The culprit must be committed at case initialization (`culpritId`) and cannot change during gameplay.
5. **Progressive Elimination Loop**:
   - Beat 1: Proves forced entry/entry style.
   - Beat 2: Disproves Suspect A's alibi (e.g. no master key used).
   - Beat 3: Disproves Suspect C's toolset (e.g. paint color does not match).
   - Beat 4: Pinpoints the specific signature of Suspect B.

---

## 2. Supported Sensor Descriptors vs Unsupported Capabilities

To guarantee physical solvability, all case authoring must strictly use verified sensor descriptors. `CaseValidator.validate()` automatically rejects cases with impossible or unsupported predicates.

### Supported Sensor Descriptors:
- **Materials**: `metal`, `wood`, `wood-like`, `stone`, `stone-like`, `concrete`, `concrete-like`, `glass`, `organic`
- **Shapes & Structures**: `vertical`, `horizontal`, `circular`, `rectangular`, `irregular`, `flat`, `elongated`, `post`, `fence`, `pillar`, `gate`, `wall`, `boundary`
- **Surfaces**: `smooth`, `rough`, `textured`, `reflective`, `matte`, `weathered`, `bark`, `rust`, `oxidized`
- **Colors**: `red`, `orange`, `yellow`, `green`, `blue`, `dark`, `light`, `neutral`, `bright`, `color_anomaly`
- **Object Hints**: `sign`, `post`, `wall`, `rail`, `path`, `vegetation`, `leaf`, `soil`, `grass`, `moss`, `bolt`, `fastener`, `plate`, `fixture`, `bracket`

### Unsupported / Forbidden Capabilities:
- ❌ `magnetic` / `magnetism` (Device camera cannot detect electromagnetic fields).
- ❌ `infrared` / `thermal` (Requires FLIR hardware).
- ❌ `chemical_composition` / `dna` (Requires physical laboratory assays).
- ❌ `sub-surface` / `underground` (Requires ground-penetrating radar).

---

## 3. Evidence Predicate Standards

Target predicates must satisfy:
- **Common Physical Availability**: Must be discoverable in typical public outdoor environments within 10–20 minutes.
- **Safety**: Must never require touching dangerous equipment, climbing fences, entering private property, or crossing highways.
- **Material Diversity**: A case should span at least two distinct material categories (e.g. metal and wood/stone).

```json
{
  "id": "pred-01",
  "name": "Perimeter Iron Boundary Fence",
  "targetCategory": "architectural_boundary",
  "requiredDescriptors": ["metal", "vertical"],
  "optionalDescriptors": ["iron", "fence", "post"],
  "minimumMatchScore": 0.50,
  "safetyNotice": "Only observe objects in open, public, accessible areas. Never trespass."
}
```

---

## 4. The 4-Tier Graduated Hint Standard

Every beat must define 4 progressive hint levels:
- **Level 1 (Nudge)**: Broad environmental observation cue.
- **Level 2 (Direction)**: Object category direction (e.g., look for weathered metal posts).
- **Level 3 (Relation)**: Specific spatial orientation (e.g., within 15 meters of path fork).
- **Level 4 (Deduction)**: Explicit descriptor alignment without spoiling the culprit.
