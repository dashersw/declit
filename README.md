# declit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Declarative buildings in JSX.** Describe architecture the way you describe UI — function components for walls, doors, windows and outlets, parameters as props, constraints resolved for you — with a live 3D preview rendered by react-three-fiber.

```tsx
<Model>
  <Level elevation={0} height={2.7}>
    <Wall id="south" from={[0, 0]} to={[8, 0]} thickness={0.24}>
      <Door at={1.6} width={1.0} open={0.4} />
      <Window at={4.6} width={1.8} sill={0.85} />
      <Outlet at={3.4} />
    </Wall>
    <Wall id="west" from={[0, 0]} to={[0, 5]} thickness={0.24} />
    {/* the corner joins itself */}
  </Level>
</Model>
```

## Workspace

| package | what it is |
| --- | --- |
| [`packages/core`](packages/core) | `@declit/core` — the standard library: components, templates, the model store and the constraint resolver |
| [`apps/studio`](apps/studio) | the studio — a live IDE: your design files in a code editor on the left, the 3D model on the right |
| [`apps/studio/src/examples`](apps/studio/src/examples) | the example projects: a one-story **apartment**, a three-story **country house**, and a six-story, 60-room **hotel** |

```sh
npm install
npm run dev        # studio on http://localhost:5177
npm test           # resolver unit tests
npm run typecheck
```

## How it works

The JSX tree is the building. Components don't draw imperatively — during React's commit each element registers a **pure spec** (`WallSpec`, `OpeningSpec`, …) into a model store (zustand). A memoized **resolver** turns the raw specs into a `ResolvedModel`, and the meshes you see are rendered from the *resolved* model, never directly from props. Change a prop → spec re-registers → resolver re-runs → geometry updates. It's virtual-DOM thinking applied to BIM: declaration and view are the same tree, the resolver is the reconciliation pass.

### Constraints

Three mechanisms, by design:

1. **Hosting — the JSX hierarchy.** A `<Door>`/`<Window>` inside a `<Wall>` registers an opening with its host; the wall's geometry is an extruded elevation profile with real holes cut for every valid opening. Fixtures (`<Outlet>`, `<Switch>`) attach to a wall face without cutting. There is no way to have an orphaned door — the type system and the tree make the host relationship mandatory.

2. **Topology — the corner solver.** Walls that share an endpoint (5 mm tolerance, per elevation) form a node. At each node the first wall by id extends past the corner by half the thickest neighbor, every other wall shrinks back by half the primary's thickness. This one rule produces clean butt joints for L, T, X and straight junctions at any combination of wall thicknesses — thickness is just a prop, corners always heal. Opt out per wall with `join={false}`.

3. **Validation — the problem list.** The resolver checks every opening: within the wall's length, within its height, sill above the base, no overlap with sibling openings. Invalid openings are not cut; they render as red ghosts in the scene and surface in `useModelProblems()` — the studio app shows them in a live "Constraints" panel. Violations are *states you can see*, not exceptions.

### Layers and stories

Every component belongs to a **layer** — the semantic ones (`structure`, `openings`, `electrical`, `plumbing`, `furniture`, `annotations`) plus, for multi-story buildings, one **per story**. `<Story level={n}>` wraps its floor in a visibility group named `ground floor` / `floor n` (override with the `layer` prop, e.g. `layer="roof"`), and `<GableRoof>` defaults to the `roof` layer. The studio's Layers panel lists the active layers in two groups — systems and stories — so you can switch the roof off and inspect each floor one at a time. Hiding a floor hides its geometry but keeps its walls registered in the model, so constraints keep resolving while you look inside.

Parameter defaults cascade like CSS: `<Level height={2.7}>` sets the wall height for every wall that doesn't override it; templates pass their `thickness` down to the walls they emit.

### Standard library

| component | purpose |
| --- | --- |
| `<Model>` | model scope; owns the element store (pass your own via `store` to read it outside the canvas) |
| `<Level elevation height>` | floor datum + cascading wall-height default |
| `<Wall from to thickness height color join>` | extruded wall, hosts openings and fixtures |
| `<Door at width height open hinge swing>` | cuts opening; frame, leaf, handle, dashed swing arc |
| `<Window at width height sill>` | cuts opening; frame, glass, mullion, sill board |
| `<Outlet at height face>` / `<Plug>` | socket on a wall face |
| `<Switch at height face>` | light switch on a wall face |
| `<Slab outline holes thickness>` | floor plate from a plan polygon, with optional voids (e.g. a stairwell) |
| `<Stories storyHeight>` / `<Story level>` | vertical composition — stacks levels by story index |
| `<Stairs from to rise>` | a single straight stair flight climbing one story |
| `<Staircase at rise width run>` | a switchback (dog-leg) stair — two half-flights + landing, stacks vertically and is walkable |
| `<Elevator at width depth height car>` | one story of an elevator shaft: three walls, landing doors, optional car |
| `<GableRoof at width depth rise>` | pitched roof (a triangular prism, gable ends included) |
| `<Pool at width depth>` | water surface with a curb |
| `<Balcony at width depth open>` | cantilevered deck + parapet, open on the side that meets the building |
| `<Toilet at facing>` / `<Basin>` / `<Bathtub>` | bathroom fixtures (furniture layer) |
| `<Bed at headTo>` / `<Lounger facing>` / `<Parasol at>` | furniture: bed, sun lounger, umbrella (furniture layer) |
| `<WallRun points closed>` | chained walls sharing corners |
| `<Wire points>` | electrical cable run along 3D waypoints (electrical layer) |
| `<Pipe points radius color>` | water pipe run along 3D waypoints (plumbing layer) |
| `<BreakerPanel at height>` | breaker box on a wall face (electrical layer) |
| `<Dimension from to offset>` | measured dimension line with label (annotations layer) |
| `<RectRoom at width depth door windows>` | template: four joined walls + slab, openings addressed by side |

Hooks: `useResolvedModel`, `useModelProblems`, `useResolvedWall`, `useWall`, `useLevel`, plus `useRegisterElement` / `useOpeningRegistration` for building your own components on the same constraint machinery.

**Design parameters:** `useParam(label, { min, max, step, default, unit })` declares a live parameter from inside a design component. The value is a number like any other prop; the hosting app renders a slider for every active parameter automatically. Parameter values survive recompiles, so tuning in the panel and editing code compose.

**Layers:** every component belongs to a layer (`structure`, `openings`, `electrical`, `plumbing`, `furniture`, `annotations` — override per element with the `layer` prop). The studio lists active layers with toggles. Elements that register model data (walls, slabs, doors, windows) hide visually but stay in the model, so constraints keep resolving; pure visuals (wires, pipes, fixtures, dimensions) unmount.

**Selection:** every element with an `id` is clickable in the viewport. Clicking selects it (blue tint) and the studio jumps the editor to the `id="..."` occurrence in your source — across files. Template-generated ids like `studio-west` fall back to their longest declared prefix (`studio`). Clicking empty space deselects.

## The studio

`npm run dev` opens an IDE, not a demo. The left pane is a CodeMirror editor over a small virtual project — by default `Apartment.tsx` (the entry), `Bathroom.tsx` and `GardenStudio.tsx`. These are *your* files: plain TSX with multi-file imports (`import Bathroom from './Bathroom'`), compiled in the browser (sucrase) into a module graph where `@declit/core`, `react`, `three`, `@react-three/fiber` and `@react-three/drei` resolve to the app's own instances. Every keystroke recompiles (300 ms debounce) and hot-swaps the design.

Everything else is chrome you never write: the `Stage` (canvas, sky, lights, ground, grid, camera, `<Model>` scope), the parameters panel (fed by your `useParam` calls), the layers panel, the constraints panel, error banners. Your entry file just default-exports a component. Compile errors and runtime errors show in a banner while the last good model keeps rendering. Each example gets its own localStorage slot, so edits are kept per example; the `reset` button restores the selected example; `+` adds a new file.

### Examples

The **example** dropdown (top-left) switches between three self-contained projects. The camera re-frames the building whenever you switch.

- **Apartment** — a single-story flat: walls, doors, windows, plus wiring and plumbing on toggleable layers and a detached garden studio.
- **Country house** — three stories stacked with `<Stories>`, each floor in its own file, a stair flight per level, low attic knee walls under a `<GableRoof>`. Sliders drive story height and roof pitch.
- **Hotel** — six stories: a public ground floor (lobby, reception, restaurant tables, and a `<Pool>` on the terrace), a stack of guest floors along a double-loaded corridor, and a west circulation core — two `<Elevator>` shafts facing a shared elevator lobby, a `<Staircase>` switchback whose entry and exit meet that same lobby, and a corridor door on every floor (including the ground-floor lobby) — serving every level through matching slab voids. All 60 rooms come from `rooms = guestFloors × roomsPerSide × 2` — mapping over the room index generates every window, door, party wall, **ensuite bathroom**, **balcony** (with its şezlong and parasol — the east rooms get pool-view balconies), outlet, cable run, supply stub, drain and bed — the risers feed under-slab branches, every fixture taps them through the floor, and the drains fall to soil stacks. Drag the *Guest floors* slider and the whole tower — rooms, ensuites, services and the stair/lift core — grows a story at a time.

Both multi-story examples carry **electrical and plumbing on every floor**, and they stay consistent for free: the hotel puts all its services in the one `GuestFloor` component that every floor renders, and the country house shares a `Services` component (a panel-fed ceiling ring main plus a cold/hot/soil wet stack rising beside the bathroom it serves) across its three floors. Change the wiring in one place and every floor updates together — that's the whole argument for describing a building as code.

The hotel is the clearest case: sixty rooms are a `.map()`, not sixty things to place. (One consequence: because those elements share a single source line, clicking one in the viewport highlights it but can't jump the editor to a unique line — click-to-source lands on statically-named elements like the pool.)

## Design notes

- **Geometry without CSG.** Wall openings are holes in a `THREE.Shape` extruded by the wall thickness — exact, fast, and dependency-free.
- **The resolver is pure and tested** ([resolve.ts](packages/core/src/model/resolve.ts), [tests](packages/core/tests/resolve.test.ts)). It knows nothing about React or three.js, so it can later back exporters (IFC/glTF) or a headless checker.
- **Non-orthogonal corners** currently get butt joints, not miters — fine for right angles, approximate otherwise.
- **Perf:** the resolver recomputes the whole model per change (memoized per store snapshot). Fine for hundreds of elements; per-element structural sharing is the obvious next step.

## Roadmap

- Miter joins for angled corners; walls ending against another wall's face (T-into-face)
- Hipped/flat/shed roofs; animated elevator cars
- Click-to-source for `.map()`-generated elements (locate the generating expression, not a unique id)
- Named anchors + relational constraints (`align`, `offset`, dimension-driven layouts)
- IFC export via ifcXML — the resolved model is already a typed element graph
- Per-element resolver memoization

## License

[MIT](LICENSE)
