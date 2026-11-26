export const estilos = `
* { box-sizing: border-box; }
:root {
  --line: color-mix(in srgb, var(--ink) 27%, transparent);
  --muted: color-mix(in srgb, var(--ink) 80%, var(--bg));
  --gutter: clamp(18px, 4vw, 72px);
  --space: clamp(64px, 8vw, 124px);
  --ease: cubic-bezier(.22, .75, .2, 1);
  color-scheme: light;
}
html { scroll-behavior: smooth; scroll-padding-top: 22px; }
body {
  margin: 0; color: var(--ink); background: var(--bg);
  font: 1rem/1.55 "Instrument Sans", system-ui, sans-serif;
}
a { color: inherit; }
button, input, select, textarea { font: inherit; color: inherit; }
button { cursor: pointer; }
:focus-visible { outline: 3px solid currentColor; outline-offset: 4px; }
[hidden], a[href=""], .optional:empty, .rating:not(:has(.score:not(:empty))) { display: none !important; }
h1, h2, h3, p, figure { margin: 0; }
h1, h2, h3, a, p { overflow-wrap: anywhere; }
h1, h2, .wordmark { font-family: var(--display); font-weight: var(--display-weight); }
h1 { font-size: clamp(3.2rem, 7vw, 7.3rem); line-height: .92; letter-spacing: -.052em; text-wrap: balance; }
h2 { font-size: clamp(2.45rem, 5.5vw, 6rem); line-height: .95; letter-spacing: -.048em; text-wrap: balance; }
.wrap { width: min(1500px, calc(100% - var(--gutter) * 2)); margin-inline: auto; }
.skip { position: absolute; left: var(--gutter); top: 10px; z-index: 4; color: var(--bg); background: var(--ink); padding: 12px; transform: translateY(-160%); }
.skip:focus { transform: none; }
.masthead .wrap { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 4px 26px; padding-block: 10px; min-height: 74px; }
.wordmark { font-size: clamp(1.25rem, 2.5vw, 2rem); line-height: 1.08; text-decoration: none; letter-spacing: -.04em; }
.nav { display: flex; flex-wrap: wrap; gap: 2px 25px; align-items: center; }
.nav a, .map, .service-link { text-underline-offset: .28em; font-weight: 650; }
.nav a { display: inline-flex; align-items: center; min-height: 44px; font-size: .94rem; text-decoration: none; }
.nav a:hover { text-decoration: underline; }
.pill {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 52px;
  text-align: center; background: var(--accent); color: var(--on); border: 1px solid transparent;
  border-radius: max(8px, var(--radius)); padding: 12px 22px; font-weight: 750; text-decoration: none;
  transition: translate 200ms var(--ease), box-shadow 220ms var(--ease);
}
.pill:focus-visible { outline-color: var(--ink); }
@media (hover: hover) {
  .pill:not(:disabled):hover { translate: 0 -3px; box-shadow: 0 9px 24px color-mix(in srgb, var(--accent) 34%, #0004); }
}
.pill:not(:disabled):active { translate: 0 2px; }
.pill.outline { background: transparent; color: inherit; border-color: var(--line); }
.pill:disabled { opacity: .55; cursor: default; }

.hero { position: relative; isolation: isolate; padding-bottom: clamp(30px, 5vw, 80px); }
.hero-inner {
  display: grid; grid-template-areas: "copy photo"; grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr);
  position: relative; isolation: isolate; align-items: stretch; min-height: clamp(540px, 77svh, 800px);
}
.copy {
  grid-area: copy; position: relative; z-index: 2; min-width: 0; align-self: center;
  padding: clamp(26px, 4.7vw, 86px);
}
.hero .context {
  width: fit-content; max-width: 100%; margin-bottom: 17px; padding: 6px 11px;
  background: color-mix(in srgb, var(--panel) 85%, var(--bg)); color: var(--ink);
  border-radius: max(4px, var(--radius)); border: 1px solid var(--line); font-weight: 650; font-size: .83rem;
}
.hero .intro { max-width: 37ch; color: var(--muted); font-size: clamp(1rem, 1.55vw, 1.23rem); margin: 19px 0 25px; }
.hero h1 { max-width: 14ch; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 19px; }
.hero-visual { grid-area: photo; position: relative; isolation: isolate; display: grid; min-width: 0; min-height: 0; }
.media {
  position: relative; isolation: isolate; display: grid; place-items: center; overflow: hidden;
  background: linear-gradient(140deg, var(--panel) 28%, color-mix(in srgb, var(--panel) 60%, var(--tint)));
  color: var(--ink); border-radius: var(--radius);
}
.media::before { content: ""; position: absolute; inset: 10%; border: 1px solid var(--line); border-radius: inherit; z-index: -1; }
.initials { font: var(--display-weight) var(--initial-size, 4rem)/1 var(--display); letter-spacing: -.045em; }
.media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: var(--crop, center); }
.media img[src=""] { display: none; }
.media figcaption {
  display: none; position: absolute; z-index: 1; top: 12px; right: 12px;
  padding: 4px 8px; background: #211b25dd; color: #fff; border-radius: 4px; font-size: .72rem;
}
.media img:not([hidden])[data-ilustrada] + figcaption { display: block; }
.hero .media { --initial-size: clamp(5rem, 15vw, 16rem); }
.hero .copy { animation: abrir-texto 820ms var(--ease) both; }
.hero .media img { animation: abrir-foto 1150ms var(--ease) both; }
@keyframes abrir-texto { from { opacity: .5; transform: translate(var(--entrada-x, 0), var(--entrada-y, 19px)); } to { opacity: 1; transform: translate(0); } }
@keyframes abrir-foto { from { transform: scale(1.075); } to { transform: scale(1); } }
.foto-nav {
  position: absolute; z-index: 3; right: 16px; bottom: 16px; display: flex; align-items: center; gap: 2px;
  padding: 4px; border: 1px solid #fff4; border-radius: 999px; background: #18151ce0; color: #fff;
  box-shadow: 0 8px 24px #0004; backdrop-filter: blur(10px);
}
.foto-nav button {
  display: grid; place-items: center; width: 44px; height: 44px;
  border: 0; border-radius: 50%; background: transparent; color: inherit;
}
.foto-nav button:hover { background: #fff2; }
.foto-nav button:focus-visible { outline-offset: 1px; }
.foto-nav button::before { content: ""; width: 8px; height: 8px; border-top: 2px solid; border-right: 2px solid; transform: rotate(45deg); }
.foto-nav button[data-anterior]::before { transform: rotate(-135deg); }
.foto-nav [data-posicao] { font-variant-numeric: tabular-nums; min-width: 42px; text-align: center; font-size: .83rem; }
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.hero-visual.outra-foto .media img { object-position: center; }

.poster .hero-inner {
  grid-template-columns: minmax(0, .9fr) minmax(0, 1.35fr);
  background: radial-gradient(ellipse at 38% 110%, color-mix(in srgb, var(--tint) 62%, var(--bg)), transparent 68%), var(--panel);
  border-radius: 16px; overflow: clip;
}
.poster .hero .copy { margin-right: -10%; --entrada-x: -22px; --entrada-y: 0; }
.poster .hero .media { clip-path: polygon(12% 0, 100% 0, 100% 100%, 0% 100%); }
.poster .hero .media::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, #2012386b, transparent 48%); pointer-events: none; }

.dupla .hero-inner { gap: clamp(10px, 2vw, 28px); }
.dupla .copy { padding-inline: clamp(12px, 3.4vw, 54px); }
.tema-forma .hero-inner { grid-template-areas: "photo copy"; grid-template-columns: minmax(0, 1.2fr) minmax(0, .8fr); }
.tema-forma .hero-visual { border-top: 12px solid var(--accent); }
.tema-forma .copy { --entrada-x: 24px; --entrada-y: 0; padding-left: clamp(14px, 3vw, 46px); }
.tema-forma .hero h1 { font-size: clamp(3.7rem, 7.7vw, 8.6rem); }
.tema-mercado .hero-inner {
  background: linear-gradient(125deg, var(--panel), #f5e9a5); border-radius: 14px; padding: clamp(12px, 2vw, 29px);
}
.tema-mercado .hero .media { border-radius: 50% 49% 13px 13px / 15% 15% 13px 13px; }
.tema-essencia .hero-visual { padding: 12px 12px 22px 0; }
.tema-essencia .hero-visual::before {
  content: ""; position: absolute; inset: 10% 0 0 9%; z-index: -1; border-radius: 26px 26px 50% 26px;
  background: linear-gradient(155deg, var(--tint), var(--panel));
}
.tema-essencia .hero .media { border-radius: 20px 20px 48% 20px / 20px 20px 24% 20px; }

.arco .hero-inner {
  background: radial-gradient(ellipse at 77% 68%, #f4a98e, transparent 68%), var(--panel);
  border-radius: 46% 12px 12px 12px / 15% 12px 12px 12px; padding: clamp(13px, 3vw, 45px);
}
.arco .hero .media { border-radius: 50% 50% 10px 10px / 36% 36% 10px 10px; }
.arco .hero h1 { font-size: clamp(3.35rem, 7.6vw, 8.4rem); }

.cena .hero-inner, .tema-barbearia .hero-inner {
  grid-template-columns: minmax(0, 1fr); grid-template-areas: "cena";
  min-height: clamp(560px, 79svh, 840px); border-radius: 16px; overflow: clip;
}
.cena .hero-visual, .cena .copy, .tema-barbearia .hero-visual, .tema-barbearia .copy { grid-area: cena; }
.cena .hero-visual, .tema-barbearia .hero-visual { min-height: 100%; }
.cena .hero .media, .tema-barbearia .hero .media { border-radius: 0; }
.cena .hero .media::after, .tema-barbearia .hero .media::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(95deg, #140d10e9, #161018aa 42%, #18111828 78%), linear-gradient(0deg, #130e175e, transparent 35%);
}
.cena .hero .copy, .tema-barbearia .hero .copy {
  color: #fff7ed; --ink: #fff7ed; --muted: #fff7ed;
  align-self: end; padding-block: clamp(38px, 7vw, 106px); width: min(100%, 810px);
}
.cena .hero .context, .tema-barbearia .hero .context { background: #181419bd; }
.cena .hero h1 { font-size: clamp(3.85rem, 8vw, 9.4rem); }
.tema-mesa .hero .media::after { background: linear-gradient(85deg, #1a0905f2, #1a0807a0 46%, #210b050d 88%), linear-gradient(0deg, #17080375, transparent 42%); }
.tema-horizonte .hero .copy { text-align: center; justify-self: center; display: grid; justify-items: center; width: min(100%, 900px); }
.tema-horizonte .hero .media::after { background: linear-gradient(0deg, #0c242ef4, #0b232da6 39%, #1227331a 86%); }
.tema-chacara .hero .copy {
  --ink: #f4fae9; --muted: #f4fae9; align-self: end; margin: clamp(13px, 3vw, 40px);
  padding: clamp(19px, 3.5vw, 53px); width: min(570px, calc(100% - 26px));
  border: 1px solid #faffee49; border-radius: 8px 44px 8px 8px; background: #142d22ed; backdrop-filter: blur(12px);
}
.tema-chacara .hero h1 { font-size: clamp(3rem, 6.8vw, 6.9rem); }
.tema-chacara .hero .media::after { background: linear-gradient(0deg, #1020177d, transparent 58%); }

.ficha .hero-inner {
  background: radial-gradient(ellipse at 5% 100%, color-mix(in srgb, var(--panel) 33%, var(--tint)), transparent 72%), var(--panel);
  border-radius: 10px;
}
.ficha .hero-visual { padding: 12px; }
.ficha .hero .media { border-radius: 6px; }
.tema-oficio .hero-inner { grid-template-columns: minmax(0, .75fr) minmax(0, 1.25fr); border-block: 5px solid var(--accent); border-radius: 0; }
.tema-oficio .hero-visual { padding: 0; }
.tema-oficio .hero .media { border-radius: 0; }
.tema-oficio .hero h1 { max-width: 10ch; }

.vitrine .hero-inner { background: radial-gradient(ellipse at 90% 90%, var(--tint), transparent 65%), var(--panel); border-radius: 8px; }
.vitrine .hero-visual { padding: 10px; }
.vitrine .hero .media { border-radius: 58% 8px 8px 8px / 22% 8px 8px 8px; }
.tema-calcados .hero-inner { grid-template-columns: minmax(0, .84fr) minmax(0, 1.16fr); }
.tema-calcados .hero .media { border-radius: 8px 8px 12px 55% / 8px 8px 12px 23%; }
.tema-calcados .hero .copy { padding-right: 20px; }

.tema-pulso .hero-inner { background: linear-gradient(149deg, var(--panel) 53%, #542746); overflow: clip; }
.tema-pulso .hero .media { clip-path: polygon(14% 0, 100% 0, 100% 100%, 0 100%); border-radius: 0; }
.tema-pulso .hero .copy { margin-right: -7%; --entrada-x: -25px; --entrada-y: 0; }
.tema-pulso .hero h1 { max-width: 11ch; text-transform: uppercase; letter-spacing: -.025em; }
.tema-barbearia .hero-inner { border-radius: 3px; }
.tema-barbearia .hero .copy { align-self: center; max-width: 730px; }
.tema-barbearia .hero h1 { font-size: clamp(3.7rem, 8.9vw, 10rem); }

.section { padding-block: var(--space); }
.section-title { margin-bottom: clamp(22px, 4vw, 54px); max-width: 18ch; }
.explore { background: linear-gradient(168deg, color-mix(in srgb, var(--panel) 84%, var(--tint)), var(--bg) 66%); }
.services { display: grid; gap: clamp(14px, 2.3vw, 36px); grid-template-columns: repeat(3, minmax(0, 1fr)); }
.services article { min-width: 0; }
.services .media { aspect-ratio: 5 / 4; --crop: center; border-radius: max(8px, var(--radius)); }
.service-copy { padding-block: 15px; display: grid; align-content: start; gap: 7px; }
.service-copy p { max-width: 35ch; color: var(--muted); }
.service-copy h3 { font-family: var(--display); font-weight: var(--display-weight); font-size: clamp(1.65rem, 3.3vw, 3.4rem); line-height: 1; letter-spacing: -.03em; }
.service-link { min-height: 44px; display: inline-flex; align-items: center; width: fit-content; }
.mosaico .services { grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); }
.mosaico .services article:first-child { grid-row: span 2; align-self: start; }
.mosaico .services article:first-child .media { aspect-ratio: 5 / 6; }
.mosaico .services article:not(:first-child) .media { aspect-ratio: 2.5; }
.fileiras .services article { display: grid; grid-template-rows: auto 1fr; }
.fileiras .service-copy { border-top: 2px solid var(--accent); margin-top: 14px; }
.tema-vitrine .services .media, .tema-calcados .services .media { aspect-ratio: 4 / 5; }
.tema-mercado .services .media { aspect-ratio: 5 / 4; }
@media (hover: hover) {
  .services img { transition: transform 700ms var(--ease); }
  .services article:is(:hover,:focus-within) img { transform: scale(1.08); }
}

.contact-band { background: linear-gradient(145deg, color-mix(in srgb, var(--panel) 76%, var(--tint)), var(--panel)); border-top: 1px solid var(--line); }
.contact { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .7fr); gap: 25px; align-items: end; }
.contact h2 { margin-bottom: 13px; }
.contact-data { display: grid; gap: 7px; }
.contact .actions { margin-top: 18px; }
.rating { font-size: .92rem; }
.review-count:not(:empty)::before { content: " · "; }
.review-count:not(:empty)::after { content: " avaliações"; }
.footer { border-top: 1px solid var(--line); }
.footer .wrap { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; padding-block: 19px; font-size: .92rem; color: var(--muted); }

@media (max-width: 820px) {
  .masthead .wrap { gap: 0 18px; min-height: 60px; }
  .nav { gap: 0 15px; }
  .nav a { font-size: .87rem; }
  .hero .hero-inner { grid-template-columns: minmax(0, 1fr); grid-template-areas: "photo" "copy"; min-height: auto; }
  .hero .hero-visual { min-height: 0; aspect-ratio: 1.48; }
  .hero .copy { margin: 0; padding: clamp(18px, 4.5vw, 36px); }
  .hero :is(.copy, .hero-visual) { min-width: 0; }
  .hero h1 { font-size: clamp(2.8rem, 9vw, 5.2rem); }
  .hero .intro { margin: 14px 0 20px; }
  .hero .context { margin-bottom: 12px; }
  .dupla .hero-inner { gap: 0; }
  .tema-forma .hero-visual { border-top-width: 5px; }
  .vitrine .hero-visual, .ficha .hero-visual, .tema-essencia .hero-visual { padding: 0; }
  .poster .hero .media, .tema-pulso .hero .media { clip-path: none; }
  .arco .hero-inner { border-radius: 16px; padding: 10px; }
  .arco .hero .media { border-radius: 49% 49% 8px 8px / 33% 33% 8px 8px; }
  .arco .hero .hero-visual { aspect-ratio: 1.4; }
  .cena .hero .hero-inner, .tema-barbearia .hero .hero-inner { grid-template-areas: "cena"; min-height: clamp(545px, 124vw, 735px); }
  .cena .hero .hero-visual, .tema-barbearia .hero .hero-visual { min-height: 100%; aspect-ratio: auto; }
  .cena .hero .copy, .tema-barbearia .hero .copy { align-self: end; padding-bottom: 90px; }
  .cena .hero .media::after, .tema-barbearia .hero .media::after {
    background: linear-gradient(0deg, #170e14f5, #170e14b5 49%, #170e140d 86%);
  }
  .tema-chacara .hero .copy { width: auto; margin: 12px 12px 77px; padding: 17px; border-radius: 8px 24px 8px 8px; }
  .tema-chacara .hero .media::after { background: linear-gradient(0deg, #132c1fbc, transparent 55%); }
  .mosaico .services, .contact { grid-template-columns: minmax(0, 1fr); }
  .mosaico .services article:first-child { grid-row: auto; }
  .mosaico .services article:first-child .media, .mosaico .services article:not(:first-child) .media { aspect-ratio: 1.55; }
}
@media (max-width: 590px) {
  .services { grid-template-columns: minmax(0, 1fr); }
  .services .media, .tema-vitrine .services .media, .tema-calcados .services .media { aspect-ratio: 1.4; }
  .foto-nav { bottom: 9px; right: 9px; padding: 2px; }
}
@supports (animation-timeline: view()) {
  @media (min-width: 821px) and (prefers-reduced-motion: no-preference) {
    .mosaico .services article:first-child .media img {
      animation: profundidade 1ms linear both;
      animation-timeline: view(block);
      animation-range: entry 0% exit 100%;
    }
    @keyframes profundidade {
      from { transform: scale(1.13) translateY(-3%); }
      to { transform: scale(1.13) translateY(3%); }
    }
  }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
}
`;
export const estiloConsulta = `
.feature { padding-block: var(--space); border-block: 1px solid var(--line); background: linear-gradient(151deg, var(--panel) 45%, color-mix(in srgb, var(--panel) 80%, var(--tint))); }
.feature-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .7fr); align-items: end; gap: 14px 42px; padding-bottom: 28px; }
.feature-head p { max-width: 35ch; }
.feature-main { background: var(--bg); padding: clamp(17px, 4vw, 55px); border-radius: max(10px, var(--radius)); border: 1px solid var(--line); box-shadow: 0 20px 56px #13101b21; }
.feature-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); align-items: start; gap: 16px; }
.feature-field { display: grid; gap: 6px; align-content: start; font-size: .94rem; font-weight: 650; }
.feature-field :is(input, select, textarea) {
  width: 100%; min-width: 0; min-height: 48px; padding: 10px 12px; border: 1px solid var(--line);
  border-radius: var(--radius); background: var(--bg); color: var(--ink); font-size: 1rem;
}
.feature-field textarea { min-height: 84px; resize: vertical; }
.feature-field.wide, .feature-wide { grid-column: 1 / -1; }
.feature-status { font-size: .94rem; color: var(--muted); }
.feature-status:empty { display: none; }
.feature-main > .feature-status { margin-block: 16px; }
.feature-note { font-size: .92rem; margin-top: 12px; color: var(--muted); }
.feature-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.feature-output { white-space: pre-wrap; overflow-wrap: anywhere; padding: 14px; margin-block: 16px; border: 1px solid var(--line); border-left: 4px solid var(--accent); }
.feature-output:empty { display: none; }
.feature-output:not(:empty) { animation: abrir-texto 360ms var(--ease) both; --entrada-y: 6px; }
.feature-dates { display: flex; flex-wrap: wrap; gap: 8px; }
.feature-main > .feature-dates { margin-bottom: 18px; }
.feature-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 215px), 1fr)); gap: 10px 22px; margin-top: 16px; }
.feature-card { display: flex; flex-direction: column; gap: 6px; padding: 16px; background: color-mix(in srgb, var(--panel) 56%, var(--bg)); border: 1px solid var(--line); border-radius: max(8px, var(--radius)); }
.feature-card:has([aria-pressed="true"]) { border-color: var(--accent); }
.feature-card h3 { font-size: 1.16rem; line-height: 1.2; }
.fc-tag, .fc-size { font-size: .9rem; color: var(--muted); }
.fc-price { font-size: .96rem; font-weight: 700; }
.feature-dates button, .fc-add {
  background: transparent; border: 1px solid var(--line); border-radius: var(--radius); min-height: 44px; padding: 8px 12px;
}
.fc-add { align-self: start; margin-top: auto; }
.feature-dates button[aria-pressed="true"], .fc-add[aria-pressed="true"] { background: var(--accent); color: var(--on); }
.feature-cart { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding-top: 16px; border-top: 1px solid var(--line); }
@media (max-width: 640px) { .feature-head { grid-template-columns: 1fr; } }
`;
