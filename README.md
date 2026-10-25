# 🐨 Koalamochi

A cozy Tamagotchi-style pocket pet game starring **Mochi**, a kawaii koala.

## ▶️ How to play
Double-click **`index.html`**. It opens in your web browser (Chrome or Edge recommended). Nothing to install.
Progress saves automatically in that browser.

- **Stats**: 🍓 Hunger · 💖 Happiness · ⚡ Energy · 🫧 Cleanliness. They slowly go down, even while the game is closed.
- **Feed** 🍙: give snacks from your fridge. Buy more in the Shop.
- **Play** 🎮: mini-games (Leaf Catch, Memory Match, Bubble Pop). They cost energy and earn coins + XP and make your koala happy.
- **Clean** 🧽: tap messes in the room, or do chores (Bath Time, Wash Dishes, Wipe Windows) for coins + XP.
- **Sleep** 🌙: restores energy. Your koala wakes up when fully rested.
- **Shop** 🛍️: Snacks, Gifts (they go on your shelf, tap them to play), Outfits, Upgrades, and Room themes.
- **Closet** 🎀: dress up your koala (bows, hats, glasses, neckwear, outfits).
- **Tap the koala** to give pets and hearts 💕
- **Level up** to unlock new shop items. Your koala grows: Baby → Kiddo → Teen → Superstar ✨
- **Daily Treat** 🎁: come back every day for a bigger coin streak bonus.

## 🎨 Adding your Grok art
See **GROK_IMAGE_PROMPTS.md**. Drop images into `assets/images/` with these names and refresh the game:

| Characters (transparent PNG) | Backgrounds |
|---|---|
| koala_idle, koala_happy, koala_sad, koala_sleep, koala_eat, koala_dirty | bg_bedroom, bg_bathroom, bg_kitchen, bg_garden, bg_playroom, bg_sky (+ optional bg_bedroom_mint / _cloud / _lavender / _starry) |

Missing images fall back to the built-in drawings, so you can add them one at a time.
If outfits don't line up on your new koala art, tweak `CONFIG.slots` at the top of `game.js`.

## 🎵 Adding Suno music
See **SUNO_MUSIC_PROMPTS.md**. Put `bgm.mp3` (and optionally `bgm_games.mp3` and `bgm_sleep.mp3`) into `assets/music/`.

## 🛠️ Tweaking
Open `game.js`. Everything at the top is easy to change: prices, snacks, gifts, outfits, upgrades, how fast stats drain (`CONFIG.rates`), and starting coins.
