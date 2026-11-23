# HTML atlas reveal and GIF export

## Files

Load `atlas-reveal.css`, then `atlas-gif.js` and `atlas-reveal.js`. The three runtime files are frozen after the checks recorded alongside them. No external script, service, browser recorder, or PDF viewer is needed.

The base page owns its semantic HTML and layout. This module adds a restrained reading toolbar and prose reveal. It does not replace source paragraphs with flattened HTML. Existing emphasis, superscripts, subscripts, math, SVGs and links retain their original DOM structure.

## Page contract

Use `<main id="reader-content">` and an optional empty `<div id="reader-tools"></div>`. Put one JSON configuration in `<script type="application/json" id="reader-config">`; `reader-data` remains accepted for compatibility.

```js
{
  entryId: 'alternating-towers',
  title: 'Alternating real towers',
  root: '#reader-content',
  controls: '#reader-tools',
  status: 'exact',
  sourceLabel: 'Reviewed source note',
  sourceUrl: 'https://encapsulatorp.github.io/atlas/proofs/alternating-towers.html',
  menuHref: '/atlas/README.html',
  passages: [{
    id: 'a-stable-passage-id',
    selector: '[data-passage-id="a-stable-passage-id"]', // optional
    english: 'The exact original source string.',
    zyntalic: 'Actual engine output, without its metadata tail.',
    status: 'exact'
  }],
  gifBlocks: [{
    type: 'paragraph',
    text: 'Final semantic GIF text; use ^(...) and _(...) for math.',
    sourceEnglish: 'The exact original source string.', // when text differs only in semantic notation
    passageId: 'a-stable-passage-id',
    status: 'exact'
  }]
}
```

Prose nodes must retain complete ordinary English in the HTML before enhancement. The selector defaults to the matching `data-passage-id`. Missing translations or source mismatches leave that prose readable; they do not fabricate Zyntalic. The browser instance is `window.atlasReveal`. Repeated mounting on the same root returns the existing instance.

Exact/proved material reveals from authentic Zyntalic to its preserved English. Dedicated false pages reverse the direction and dissolve only the configured claim. Exploratory, conjectural, conditional and numerical material remains neutral and readable. A `collection` lazily starts eligible passages as they enter the viewport, pauses them offscreen, and does not animate every hidden paragraph in advance.

False pages can set `trapSelector` and `correctionSelector`; the correction remains available after the claim vanishes. `returnUrl` and `menuHref` both identify the return link. No treasure/trap switch is inserted beside the document.

## Controls and methods

An empty controls container gets Play/Pause, Replay, Read English, GIF pace, Export and Cancel controls. Existing controls can instead provide `data-reader-action="play|pause|replay|plain|gif|cancel-gif"`. An existing `[data-reader-export-status]` receives progress.

The instance exposes `play()`, `pause()`, `replay()`, `plain()`, `renderAt(ms)`, `snapshot()`, `exportGif(options)`, `cancelExport()` and `destroy()`. Reduced motion keeps HTML readable and disables playback. Printing switches to the complete English source.

GIF pace defaults to **Preview**, with a 3.5-second readable hold on every page. **Reading** uses longer holds proportional to page content. Both export every supplied block. The UI reports expected pages and playback duration before encoding, then page/frame progress; cancel aborts without downloading a partial file.

## GIF blocks and images

Blocks are in reading order and support `heading`, `paragraph`, `math` and `caption`, with optional `status`, `sourceLabel`, `passageId`, `sourceEnglish`, `role`, `image`, `width`, `height`, `alt` and `caption`.

Each `image` is loaded once. Math SVGs and figures fit wholly on a portrait page with their aspect ratio preserved. Raw LaTeX is not drawn on top of a successful math SVG. Figure-caption blocks retain their text after the image. Plain mathematical hard line breaks and explicit powers/subscripts are preserved.

All semantic blocks are paginated; none are discarded by a first-N limit. Coverage records list contiguous ranges for every input block. Frames use only the current entry's configuration. Memory retains the current Canvas, current/previous indexed frame and compressed output, not every raw frame.

## Node generation: the same renderer

```js
const {createCanvas, loadImage} = require('@napi-rs/canvas');
const AtlasReveal = require('./atlas-reveal.js');

const result = await AtlasReveal.exportGifData(config, {
  createCanvas,
  loadImage,
  resolveImage: relative => resolveToLocalFile(relative),
  readHoldMs: 3500,
  readPerWordMs: 0,
  signal: abortController.signal,
  onProgress: progress => console.log(progress)
});
// result.bytes is a Uint8Array; result.mime is 'image/gif'.
// result.summary includes all block coverage, pages, frames and playback duration.
```

`buildGifPlan(config,{createCanvas,preparedImages,...})` returns the pagination and coverage. `preparedImages` is a Map from original block image URL to loaded image. `renderGifFrame(plan,pageIndex,time,canvas)` draws one exact frame. Node and browser use these same functions. Defaults are 760 × 1040 portrait pixels. GIFs play once unless an explicit loop option is supplied.

## Verification

Copy `verify_reader.cjs` into `atlas/` and `qa-dom.cjs` into `atlas/tests/reader-dom.cjs`, then run `node atlas/verify_reader.cjs`. It requires `@napi-rs/canvas` and verifies the actual 46 reader entry pages and complete README, controlled DOM playback, reduced motion, lazy collection behavior, traps, cancellation, and independent GIF pixel decoding. It does not launch a browser or claim browser rendering has been observed.

For this build, actual-source coverage, Canvas rendering, controlled DOM tests and Pillow decoding of every generated QA GIF frame are also recorded in `qa-actual-atlas.json`, `qa-core.json`, `qa-dom.json` and `qa-gif-decode.json`.
