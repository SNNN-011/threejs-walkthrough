# COMBAT ZONE v3

3D FPS game built with Three.js — single HTML file, no build step.

## Features

- **Wave-based combat** — enemies get harder each wave
- **Multiple weapons** — pistol, shotgun, sniper, rifle (switch with 1-4 keys)
- **Grenade system** — throw grenades with G key
- **Health & Armor** — pickups scattered across the map
- **Combo system** — chain kills for score multiplier
- **HUD** — crosshair, scope overlay, minimap, killfeed, ammo counter
- **Reload mechanic** — R to reload, visual reload bar

## Controls

| Key | Action |
|-----|--------|
| `WASD` | Move |
| `Mouse` | Look |
| `Left Click` | Shoot |
| `R` | Reload |
| `1-4` | Switch weapons |
| `G` | Throw grenade |
| `Right Click` | Aim down sights |
| `Shift` | Sprint |
| `Space` | Jump |

## Play

Open `index.html` in browser. No server needed.

```bash
# Or serve locally
npx serve .
```

## Tech

- [Three.js](https://threejs.org/) v0.170.0
- Single HTML file (~90KB)
- No dependencies, no build

## License

MIT
