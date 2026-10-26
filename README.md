# Angel Anchor

A concept prototype for a case submission: a strategy proposal for Angel Anchor, an agent inside Angel One's app that lets investors borrow against their holdings instead of selling them, and manages that credit line for its life.

## Pages

- `index.html`: the strategy story (what, why, how, monetization), with interactive diagrams.
- `journey.html`: an animated walkthrough on a phone mock-up of one customer's journey, from starting a redemption to the life of the loan. Space plays or pauses; the arrow keys step through scenes.

## View locally

Open `index.html` in a browser. There is no build step and nothing to install.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository, on the `main` branch.
2. In the repository, open Settings → Pages.
3. Under "Build and deployment", choose "Deploy from a branch", select `main` and the `/ (root)` folder, and save.

The empty `.nojekyll` file makes GitHub Pages serve the files as they are.

## Files

```
index.html, journey.html
assets/css/styles.css   design tokens and page styles
assets/js/main.js       interactions on index.html
assets/js/journey.js    timeline controller and scenes for journey.html
assets/img/             Angel One logo (owner-supplied) and a small icon
```

The journey starts from a mutual fund redemption. The trigger is set in `CONFIG.TRIGGER` at the top of `assets/js/journey.js`.

## Disclaimer

Concept prototype prepared for a case submission by Vishad Tyagi. Not an Angel One product. Figures are illustrative or drawn from public sources listed on this site.
