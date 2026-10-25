# 🐨 Koalamochi: Grok Image Prompts

The game already runs with built-in drawings. Every image you add replaces the matching drawing automatically.
Save each image into `assets/images/` using the **exact file name** shown, for example `koala_idle.png`.

---

## ⭐ How to get a consistent character (read this first!)

**Your reference koala is saved at `assets/reference/koala_reference.jpg`.**

1. **Upload `koala_reference.jpg` to Grok** and use the Master Prompt plus the idle pose to make **koala_idle**. Re-roll until you love it.
2. For every other pose, **upload your favorite koala_idle** and use the pose prompts below. That keeps Mochi looking the same in every pose.

> 🎨 **Style tip:** your reference is a fluffy 3D plush, but your bedroom is flat 2D line art. The prompts below turn Mochi into a **2D cartoon version of your reference** so she matches the room. If you'd rather keep the 3D plush look, change the style sentence in the Master Prompt to: `Soft 3D animated movie style, fluffy realistic fur, glossy eyes.` Then regenerate the bedroom in that style too, so they match.
3. **Remove the background.** Grok gives you a JPG with a white background. Make it transparent:
   - Windows 11 **Paint**: open the image, click **Remove background**, then save as PNG.
   - Or use the Windows **Photos** app, or remove.bg.
4. Save as `.png` with the exact name. Character images must be transparent PNGs. Backgrounds can be `.jpg` or `.png`.
5. Use a **square (1:1)** aspect ratio for characters and **portrait (2:3 or 9:16)** for backgrounds.

> 💡 **Leave the pink bow off** the character images (the prompts say "no bow"). The game draws the bow and all outfits on top, so you can swap them in the Closet. Otherwise she'd wear two bows.

---

## 🎀 MASTER CHARACTER PROMPT (upload the reference image, then paste this)

```
Use the uploaded koala as the character reference: same face, same proportions, same personality. A baby koala named Mochi: chubby round body sitting upright, big round head, huge fluffy round ears sticking out to the sides with cream-white fluffy insides, soft medium-grey fur with a little fluffy tuft on top of the head, a cream-white belly and muzzle, big round shiny dark eyes with white highlights, soft light-grey eyebrows, a large glossy black spoon-shaped koala nose, a sweet small smile, thin white whiskers, soft pink blush on the cheeks, little paws resting on the tummy, round feet facing forward showing grey toe-bean paw pads. Style: cute flat 2D cartoon illustration with clean dark outlines and soft pastel colors, kawaii game character, sticker-like. Full body, front view, centered, character fills about 80% of the frame, plain pure white background, no bow, no accessories, no clothing, no nest or cushion, no text, no watermark, no ground shadow.
```

---

## 🐨 Character poses (square 1:1, then make the background transparent)

| File name | Add this after the Master Prompt (or use it as the edit prompt on your idle image) |
|---|---|
| `koala_idle.png` | `Pose: sitting calmly, paws resting on tummy, sweet gentle smile, eyes open looking at the viewer.` |
| `koala_happy.png` | `Same character, same style, plain white background, no bow. Pose: sitting, both little arms raised up in celebration, eyes closed into happy upside-down U curves (^ ^), big open smile, extra rosy cheeks.` |
| `koala_sad.png` | `Same character, same style, plain white background, no bow. Pose: sitting, ears drooping down, eyebrows tilted up in the middle, one small light-blue tear on the cheek, small frown, looking a little lonely.` |
| `koala_sleep.png` | `Same character, same style, plain white background, no bow. Pose: sleeping peacefully while sitting, eyes closed into gentle downward curves, head tilted to one side, hugging its tummy, tiny content smile. No letters or Z's.` |
| `koala_eat.png` | `Same character, same style, plain white background, no bow. Pose: sitting, happily eating, holding a green eucalyptus leaf with both paws up to its mouth, eyes closed in happy curves, cheeks puffed while munching.` |
| `koala_dirty.png` | `Same character, same style, plain white background, no bow. Pose: sitting, a few brown mud splotches on its fur, head and belly, a small leaf stuck to one ear, sheepish worried smile.` |

---

## 🏠 Backgrounds (portrait 2:3; leave the middle open because the koala stands there)

**Style line to add at the end of every background prompt:**
```
Kawaii pastel illustration, flat colors with soft shading, thick soft outlines, cozy and cute, Japanese kawaii aesthetic, front-facing flat view like a 2D game scene, no characters, no animals, no people, no text, no watermark.
```

| File name | Prompt |
|---|---|
| `bg_bedroom.png` | `A cozy kawaii bedroom interior for a virtual pet game. Strawberry-milk pink wallpaper with small white polka dots covering the top two thirds, warm light wooden plank floor on the bottom third, a white arched window with blue sky and a fluffy cloud on the upper left wall, a round pink rug in the center of the floor, a tiny potted plant in the bottom corner. The upper right wall is plain and empty. The center of the room is open and empty.` |
| `bg_bathroom.png` | `A cute pastel bathroom interior. Soft baby-blue square tiled walls, a round mirror, a towel rack with a pink fluffy towel, little rubber ducks on a shelf, white floor tiles. The center of the image is plain empty tiled wall.` |
| `bg_kitchen.png` | `A cute pastel kitchen interior. Butter-yellow walls, mint green cabinets, a little sink and a stove, hanging strawberry-print tea towels, a window with gingham curtains. The center of the image is empty counter space.` |
| `bg_garden.png` | `A sunny outdoor eucalyptus garden. Bright pastel blue sky with fluffy clouds filling the top two thirds, small rounded eucalyptus trees on the far left and right edges, soft green grass with little pink flowers on the bottom third. The middle is wide open sky.` |
| `bg_playroom.png` | `A soft pastel toy playroom wall, very simple and low detail. Light pink wall with tiny hearts and stars pattern, blurry toy shelves at the far edges. Mostly plain so cards can sit on top.` |
| `bg_sky.png` | `A dreamy pastel sky. Gradient from soft blue at the top to cotton-candy pink at the bottom, a few fluffy white clouds, tiny twinkling stars, very soft and airy. Mostly empty space.` |

### Optional: room theme versions (unlocked in Shop > Rooms)
If you skip these, the game tints `bg_bedroom` automatically.

| File name | Change the bedroom prompt's colors to |
|---|---|
| `bg_bedroom_mint.png` | `mint green striped wallpaper, light oak floor, mint rug` |
| `bg_bedroom_cloud.png` | `sky-blue wallpaper with fluffy white cloud pattern, pale blue floor, white cloud-shaped rug` |
| `bg_bedroom_lavender.png` | `lavender wallpaper with lilac polka dots, purple checkered floor, lilac rug` |
| `bg_bedroom_starry.png` | `nighttime room, deep navy wallpaper with tiny glowing yellow stars, purple floor, crescent moon in the window, yellow star rug` |

---

## ✨ Optional extras

| File name | Prompt |
|---|---|
| `logo.png` | `Cute bubbly game logo text that says "Koalamochi" in rounded puffy pink letters with a white outline, a tiny koala face and a red bow on the letter i, kawaii style, white background.` *(AI text can come out misspelled, so re-roll until it's right.)* |
| App/desktop icon | `A kawaii koala face icon, round head, big pink-lined ears, red bow on one ear, dot eyes, big nose, blush, pastel pink circle background, app icon style.` |

**Outfit art (advanced, optional):** you can replace any outfit drawing with `acc_<id>.png` (for example `acc_crown.png` or `acc_tutu.png`). Each one should be a single transparent item, front view, square. If it sits in the wrong spot on your koala, adjust `CONFIG.slots` at the top of `game.js`.
