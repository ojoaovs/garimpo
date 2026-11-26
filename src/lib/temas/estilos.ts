export const estilos = `
* { box-sizing: border-box; }
:root {
  --line: color-mix(in srgb, var(--ink) 21%, transparent);
  --muted: color-mix(in srgb, var(--ink) 76%, var(--bg));
  --gutter: clamp(16px, 5vw, 80px);
  --space: clamp(60px, 9vw, 128px);
  --ease: cubic-bezier(.2, .75, .25, 1);
}
html { scroll-behavior: smooth; }
body { margin: 0; color: var(--ink); background: var(--bg); font: 1rem/1.55 "Instrument Sans", system-ui, sans-serif; }
a { color: inherit; }
button, input, select, textarea { font: inherit; color: inherit; }
button { cursor: pointer; }
:focus-visible { outline: 3px solid currentColor; outline-offset: 4px; }
[hidden], a[href=""], .optional:empty, .rating:not(:has(.score:not(:empty))) { display: none !important; }
h1, h2, h3, p, figure { margin: 0; }
h1, h2, h3, a, p { overflow-wrap: anywhere; }
h1, h2, .wordmark { font-family: var(--display); font-weight: var(--display-weight); }
h1 { font-size: clamp(3.2rem, 6.8vw, 7rem); line-height: .96; letter-spacing: -.048em; }
h2 { font-size: clamp(2.25rem, 4.6vw, 4.75rem); line-height: 1; letter-spacing: -.045em; text-wrap: balance; }
.wrap { width: min(1440px, calc(100% - var(--gutter) * 2)); margin-inline: auto; }
.skip { position: absolute; left: var(--gutter); top: 12px; z-index: 3; color: var(--bg); background: var(--ink); padding: 12px; transform: translateY(-160%); }
.skip:focus { transform: none; }

.masthead { border-bottom: 1px solid var(--line); }
.masthead .wrap { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px 28px; padding-block: 12px; min-height: 72px; }
.wordmark { font-size: clamp(1.25rem, 3vw, 1.85rem); line-height: 1.12; text-decoration: none; letter-spacing: -.035em; }
.nav { display: flex; flex-wrap: wrap; gap: 6px 24px; align-items: center; }
.nav a, .map, .service-link { text-underline-offset: .24em; font-weight: 650; }
.nav a { display: inline-flex; align-items: center; min-height: 44px; text-decoration: none; font-size: .92rem; }
.nav a:hover { text-decoration: underline; }
.pill {
  display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 48px;
  text-align: center; background: var(--accent); color: var(--on); border: 1px solid transparent;
  border-radius: var(--radius); padding: 10px 19px; font-weight: 700; text-decoration: none;
  transition: transform 160ms var(--ease), box-shadow 160ms var(--ease);
}
.pill:focus-visible { outline-color: var(--ink); }
.pill:hover { box-shadow: 0 3px 0 color-mix(in srgb, currentColor 45%, transparent); }
.pill:active { transform: translateY(2px); }
.pill.outline { background: transparent; color: inherit; border-color: var(--line); }
.pill:disabled { opacity: .55; cursor: default; box-shadow: none; transform: none; }

.hero { padding-block: clamp(24px, 5vw, 78px); }
.hero-inner { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(20px, 5vw, 82px); align-items: center; }
.copy { min-width: 0; }
.hero .context { color: var(--muted); font-size: .94rem; font-weight: 670; margin-bottom: 18px; }
.hero .intro { max-width: 38ch; color: var(--muted); font-size: clamp(1rem, 1.6vw, 1.26rem); margin: 21px 0 25px; }
.hero h1 { max-width: 14ch; text-wrap: balance; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 20px; }
.hero .media { --initial-size: clamp(5rem, 15vw, 16rem); min-height: clamp(390px, 46vw, 645px); }
.media {
  position: relative; isolation: isolate; display: grid; place-items: center; overflow: hidden; margin: 0;
  color: var(--ink); background: var(--panel); border-radius: var(--radius);
}
.media::before { content: ""; position: absolute; z-index: -1; inset: 12%; border: 1px solid var(--line); border-radius: inherit; }
.initials { font: var(--display-weight) var(--initial-size, 4rem)/1 var(--display); letter-spacing: -.035em; }
.media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: var(--crop, center); }
.media img[src=""] { display: none; }
.media figcaption {
  display: none; position: absolute; z-index: 1; bottom: 10px; right: 10px;
  padding: 4px 8px; background: #191619; color: #fff; border-radius: 3px; font-size: .72rem;
}
.media img[hidden] + figcaption { display: none; }
.hero .media img { animation: assentar 680ms var(--ease) both; }
@keyframes assentar { from { transform: scale(1.045); } to { transform: scale(1); } }

.poster .hero-inner { grid-template-columns: 1fr; gap: 34px; }
.poster .copy { display: grid; grid-template-columns: minmax(0, 1fr) minmax(220px, .45fr); align-items: end; gap: 14px 40px; }
.poster .copy h1 { grid-row: span 2; font-size: clamp(3.6rem, 9vw, 9.4rem); max-width: 13ch; }
.poster .copy .context { grid-column: 1 / -1; margin-bottom: 0; }
.poster .copy .intro { margin-block: 0; }
.poster .copy .actions { align-self: start; }
.poster .hero .media { min-height: clamp(250px, 43vw, 600px); }

.dupla .hero .media { border-radius: var(--radius) var(--radius) 40% var(--radius); }
.tema-forma .hero .media { grid-column: 1; grid-row: 1; border-radius: 0; }
.tema-forma .hero .copy { grid-column: 2; }
.tema-forma .hero h1 { font-size: clamp(3.6rem, 8vw, 8.75rem); }
.tema-mercado .hero { background: var(--panel); }
.tema-mercado .hero .media { border-radius: 14px; min-height: clamp(280px, 34vw, 460px); }
.tema-mercado .hero-inner { grid-template-columns: 1fr .8fr; }

.arco .hero .media { border-radius: 49% 49% 24px 24px / 41% 41% 24px 24px; width: min(100%, 510px); justify-self: center; }
.arco .hero h1 { font-size: clamp(3.5rem, 8vw, 8rem); }
.arco .hero { border-bottom: 1px solid var(--line); }

.cena .hero { padding-block: 0; }
.cena .hero-inner { position: relative; isolation: isolate; min-height: clamp(515px, 55vw, 760px); display: grid; grid-template-columns: 1fr; align-items: end; width: 100%; }
.cena .hero .media { position: absolute; inset: 0; z-index: -2; border-radius: 0; }
.cena .hero .copy {
  width: min(1440px, calc(100% - var(--gutter) * 2)); margin-inline: auto; padding-block: 64px;
  color: #fff; --ink: #fff; --muted: #fff;
}
.cena .hero h1 { font-size: clamp(3.5rem, 9vw, 9rem); }
.cena .hero .media::after { position: absolute; content: ""; inset: 0; background: linear-gradient(0deg, #161318ed, #1715198a 58%, #17151924); pointer-events: none; }
.cena .hero .media::before { border: 0; }
.tema-mesa .hero .copy { text-align: center; display: grid; justify-items: center; }
.tema-mesa .hero .actions { justify-content: center; }
.tema-chacara .hero-inner { width: min(1600px, 100%); min-height: clamp(520px, 60vw, 820px); }
.tema-chacara .hero .copy { align-self: end; justify-self: start; background: var(--bg); color: var(--ink); --ink: #283c25; --muted: #283c25; width: min(540px, calc(100% - var(--gutter) * 2)); margin: var(--gutter); padding: clamp(21px, 4vw, 52px); }
.tema-chacara .hero h1 { font-size: clamp(3rem, 6vw, 6.2rem); }
.tema-chacara .hero .media::after { content: none; }

.ficha .hero .hero-inner { background: var(--panel); gap: 0; align-items: stretch; }
.ficha .copy { padding: clamp(24px, 5vw, 76px); display: flex; flex-direction: column; justify-content: center; border-left: 5px solid var(--accent); }
.ficha .hero h1 { font-size: clamp(3.1rem, 6.4vw, 7rem); }
.ficha .hero .media { min-height: clamp(295px, 38vw, 550px); border-radius: 0; }
.tema-atlas .ficha .copy { border: 0; }
.tema-oficio .hero .media img { filter: saturate(.73); }
.tema-oficio .hero h1 { max-width: 10ch; }

.vitrine .hero-inner { grid-template-columns: minmax(280px, .8fr) minmax(0, 1.2fr); gap: 0; background: var(--panel); }
.vitrine .hero .copy { padding: clamp(24px, 5vw, 75px); }
.vitrine .hero .media { border-radius: 55% 0 0 55% / 74% 0 0 74%; }
.tema-calcados .hero-inner { grid-template-columns: 1fr; }
.tema-calcados .hero .copy { display: grid; justify-items: center; text-align: center; }
.tema-calcados .hero h1 { max-width: 17ch; }
.tema-calcados .hero .media { min-height: clamp(260px, 32vw, 500px); border-radius: 48% 48% 0 0 / 27% 27% 0 0; }

.janela .hero-inner { gap: clamp(12px, 2vw, 40px); align-items: stretch; }
.janela .hero .copy { display: flex; flex-direction: column; justify-content: center; padding: clamp(24px, 4vw, 58px); background: var(--panel); }
.janela .hero .media { min-height: clamp(330px, 45vw, 640px); }
.tema-pulso .hero .media { clip-path: polygon(13% 0, 100% 0, 100% 100%, 0 100%); }
.tema-pulso .hero h1 { letter-spacing: -.03em; max-width: 12ch; }
.tema-barbearia .hero .media { border: 10px solid var(--panel); }
.tema-barbearia .hero .media img { filter: sepia(.13); }

.section { padding-block: var(--space); }
.section-title { margin-bottom: clamp(22px, 4vw, 51px); max-width: 24ch; }
.services { display: grid; gap: clamp(14px, 2.4vw, 36px); }
.services article { min-width: 0; }
.services .media { aspect-ratio: 4 / 3; --crop: center; }
.service-copy { padding-block: 16px; display: grid; align-content: start; gap: 6px; }
.service-copy p { max-width: 35ch; color: var(--muted); }
.service-copy h3 { font-family: var(--display); font-weight: var(--display-weight); font-size: clamp(1.6rem, 3vw, 3rem); line-height: 1.06; letter-spacing: -.025em; }
.service-link { width: fit-content; min-height: 44px; display: inline-flex; align-items: center; }
.colecao .services { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.tema-vitrine .services .media, .tema-calcados .services .media { aspect-ratio: 4 / 5; }
.tema-mercado .services .media { aspect-ratio: 6 / 4; }
.mosaico .services { grid-template-columns: minmax(0, 1.36fr) minmax(0, 1fr); }
.mosaico .services article:first-child { grid-row: span 2; align-self: start; }
.mosaico .services article:first-child .media { aspect-ratio: 5 / 6; }
.mosaico .services article:not(:first-child) .media { aspect-ratio: 5 / 2; }
.fileiras .services { gap: 0; }
.fileiras .services article {
  display: grid; grid-template-columns: minmax(85px, .42fr) minmax(0, 1fr); align-items: center; gap: clamp(14px, 4vw, 55px);
  padding-block: clamp(14px, 2vw, 26px); border-top: 1px solid var(--line);
}
.fileiras .services article:last-child { border-bottom: 1px solid var(--line); }
.fileiras .services .media { aspect-ratio: 2.1; }

.contact-band { background: var(--panel); border-top: 1px solid var(--line); }
.contact { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .7fr); gap: 26px; align-items: end; }
.contact h2 { margin-bottom: 12px; }
.contact-data { display: grid; gap: 8px; }
.contact-data:empty { display: none; }
.contact .actions { margin-top: 16px; }
.rating { font-size: .91rem; }
.review-count:not(:empty)::before { content: " · "; }
.review-count:not(:empty)::after { content: " avaliações"; }
.footer { border-top: 1px solid var(--line); }
.footer .wrap { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; padding-block: 17px; font-size: .9rem; color: var(--muted); }

@media (max-width: 780px) {
  .masthead .wrap { gap: 0 18px; min-height: 57px; }
  .nav { gap: 2px 14px; }
  .nav a { font-size: .85rem; }
  .hero .hero-inner, .poster .copy, .mosaico .services, .contact { grid-template-columns: minmax(0, 1fr); }
  .hero .hero-inner { gap: 22px; }
  .hero h1 { max-width: 15ch; }
  .hero .media, .janela .hero .media, .tema-mercado .hero .media { min-height: 0; aspect-ratio: 6 / 5; }
  .tema-forma .hero .media, .tema-forma .hero .copy { grid-area: auto; }
  .poster .copy { display: block; }
  .poster .copy .context { margin-bottom: 12px; }
  .poster .copy .intro { margin: 14px 0 20px; }
  .poster .hero .media { aspect-ratio: 7 / 5; min-height: 0; }
  .arco .hero .media { aspect-ratio: 7 / 6; }
  .cena .hero-inner { min-height: clamp(460px, 102vw, 600px); }
  .cena .hero .copy { padding-block: 50px; }
  .cena .hero .media { aspect-ratio: auto; }
  .tema-chacara .hero .copy { padding: 22px; }
  .ficha .hero .hero-inner, .vitrine .hero .hero-inner, .janela .hero .hero-inner { gap: 0; }
  .ficha .hero .media { min-height: 0; aspect-ratio: 7 / 5; }
  .vitrine .hero .media, .tema-calcados .hero .media { min-height: 0; border-radius: 35% 35% 0 0 / 25% 25% 0 0; }
  .tema-pulso .hero .media { clip-path: none; }
  .mosaico .services article:first-child { grid-row: auto; }
  .mosaico .services article:first-child .media, .mosaico .services article:not(:first-child) .media { aspect-ratio: 7 / 4; }
  .fileiras .services .media { aspect-ratio: 1; }
}
@media (max-width: 545px) {
  .colecao .services { grid-template-columns: 1fr; }
  .tema-vitrine .services .media, .tema-calcados .services .media { aspect-ratio: 7 / 5; }
  .fileiras .services article { align-items: start; }
  .fileiras .service-copy { padding: 0; }
  .fileiras .services figcaption { font-size: .65rem; right: 3px; bottom: 3px; padding: 2px 4px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; animation: none !important; transition: none !important; }
}
`;

export const estiloConsulta = `
.feature { padding-block: var(--space); border-block: 1px solid var(--line); background: var(--panel); }
.feature-head { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .7fr); align-items: end; gap: 14px 42px; padding-bottom: 28px; }
.feature-head p { max-width: 35ch; }
.feature-main { background: var(--bg); padding: clamp(16px, 4vw, 50px); border-radius: var(--radius); }
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
.feature-dates { display: flex; flex-wrap: wrap; gap: 8px; }
.feature-main > .feature-dates { margin-bottom: 18px; }
.feature-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 215px), 1fr)); gap: 10px 22px; margin-top: 16px; }
.feature-card { display: flex; flex-direction: column; gap: 5px; padding: 14px 0; border-top: 1px solid var(--line); }
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
