# HTML atlas reveal and GIF export

## Files

Load `atlas-reveal.css`, then `atlas-gif.js` and `atlas-reveal.js`. No external script, service, browser recorder, or PDF viewer is needed.

The base page owns its semantic HTML and layout. This module adds a reading toolbar and a full-content downward cascade. Headings, prose, formulas, images, captions and source labels begin concealed. Existing emphasis, superscripts, subscripts, mathematics, SVGs and links keep their original DOM structure and become readable as the cascade reaches them. The EncapsulatorP logo and reading controls remain visible.

## Page contract

Use `<main id="reader-content">` and an optional empty `<div id="reader-tools"></div>`. Put one JSON configuration in `<script type="application/json" id="reader-config">`; `reader-data` remains accepted for compatibility.

```js
{
  entryId: 'alternating-towers',
  title: 'Alternating real towers',
  root: '#reader-content',
  controls: '#reader-tools',
  status: 'exact',
  logoSrc: '../../assets/logo-encapsulatorp-512.png',
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

Prose nodes retain complete ordinary English in the HTML. The selector defaults to the matching `data-passage-id`. Authentic Zyntalic is used only when its source matches. Other content uses a deterministic visual cipher mask, recorded separately from translation provenance. A visual mask is never described as a translation or proof. The browser instance is `window.atlasReveal`. Repeated mounting on the same root returns the existing instance.

Exact/proved prose reveals from authentic Zyntalic to its preserved English. Dedicated false pages reverse the direction and dissolve only the configured claim. Exploratory, conjectural, conditional and numerical material retains its neutral evidence classification while unveiling. The reveal effect never changes a status. A `collection` masks all content synchronously, then starts the moving cascade as passages enter the viewport and pauses them offscreen.

## Before the first paint

Generated readers add an immediate head script that sets `ar-reveal-pending`, except for reduced-motion readers. Inline head CSS hides `#reader-content` and `[data-reader-reveal]` until the runtime has installed every initial mask. The runtime then removes that class. A bounded watchdog restores the complete source if enhancement cannot initialize; without JavaScript the English source remains visible.

Use `data-reader-reveal` for document headings or captions outside the main content root, and `data-reader-chrome` for branding, scope indicators and navigation that remain readable. The originals are retained beneath presentation masks and remain available to assistive reading. Printing and **Read English** restore all original content immediately.

False pages can set `trapSelector` and `correctionSelector`; the correction remains available after the claim vanishes. `returnUrl` and `menuHref` both identify the return link. No treasure/trap switch is inserted beside the document.

## Controls and methods

An empty controls container gets Play/Pause, Replay, Read English, GIF pace, Export and Cancel controls. Existing controls can instead provide `data-reader-action="play|pause|replay|plain|gif|cancel-gif"`. An existing `[data-reader-export-status]` receives progress.

The instance exposes `play()`, `pause()`, `replay()`, `plain()`, `renderAt(ms)`, `snapshot()`, `exportGif(options)`, `cancelExport()` and `destroy()`. Reduced motion keeps HTML readable and disables playback. Printing switches to the complete English source.

GIF pace defaults to **Preview**, with a 3.5-second readable hold on every page. **Reading** uses longer holds proportional to page content. Both export every supplied block. The UI reports expected pages and playback duration before encoding, then page/frame progress; cancel aborts without downloading a partial file.

## GIF blocks and images

Blocks are in reading order and support `heading`, `paragraph`, `math`, `image` and `caption`, with optional `status`, `sourceLabel`, `passageId`, `sourceEnglish`, `role`, `image`, `width`, `height`, `alt`, `caption` and `pageArtwork`.

Each `image` is loaded once. Math SVGs and figures fit wholly on a portrait page with their aspect ratio preserved. Whole-page artwork may scale up with `pageArtwork: true`; its initial visual cipher clears from top to bottom to reveal the unchanged image. Raw LaTeX is not drawn on top of a successful math SVG. Figure-caption blocks retain their text after the image. Plain mathematical hard line breaks and explicit powers/subscripts are preserved.

Every exported frame requires the actual EncapsulatorP logo. `logoSrc` may be a local relative URL or an embedded data URL. Missing or unreadable logos stop the export with a clear error. The GIF palette reserves colours from the original logo, including its small amber accent. Document title and body are concealed in the first frame; branding and scope indicators remain readable. `gifOptions` can set document defaults such as portrait width and height, while explicit export options take precedence.

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

`buildGifPlan(config,{createCanvas,preparedImages,logoImage,...})` returns the pagination and coverage. `preparedImages` is a Map from original block image URL to loaded image; it can also contain the configured logo URL. `gifFrameState(plan,pageIndex,time)` exposes the deterministic title, source and block states. `renderGifFrame(plan,pageIndex,time,canvas)` draws one exact frame and requires a prepared logo. Node and browser use these same functions. Defaults are 760 × 1040 portrait pixels. GIFs play once unless an explicit loop option is supplied.

## Complete source-page imports

`import_pdf_readers.py` creates self-contained HTML editions of existing documents. It preserves every original page as vector artwork where decoding is faithful, with direct 216-dpi page images for mixed graphics or bitmap fonts, full extracted text where the source encodes it, and immutable source/page hashes. The shared runtime, stylesheet and actual logo are embedded. Downloaded readers work offline and keep the repository's existing access boundary.

These imports use neutral source/evidence labels unless an explicit reviewed classification is supplied. Their page masks are visual ciphers, not purported translations of unreviewed source mathematics. Pages with no encoded text retain their exact artwork and an explicit extraction record. A pinned source revision can reproduce an edition after the former PDF leaves the current repository tree.

## Verification

Run `node atlas/verify_reader.cjs`. It requires `@napi-rs/canvas` and verifies the actual 46 reader entry pages and complete README, full initial concealment, downward cascade order, logo pixels, exact original endpoints, controlled DOM playback, reduced motion, lazy collection behavior, traps, cancellation, and independent GIF decoding. It does not launch a browser or claim browser rendering has been observed.

For this build, actual-source coverage, Canvas rendering, controlled DOM tests and Pillow decoding of every generated QA GIF frame are also recorded in `qa-actual-atlas.json`, `qa-core.json`, `qa-dom.json` and `qa-gif-decode.json`.
