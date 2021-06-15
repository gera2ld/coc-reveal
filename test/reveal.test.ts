import './mock-env';
import { buildSlides } from '../src/reveal';

test('without front matter', () => {
  const md1 = `\
# hello

- world

## hello 2

- world 2
`;
  const md2 = `\
should ignore text before first heading

${md1}`;
  const out = `\
<section><section data-markdown><script type="text/template"># hello

- world
</script></section><section data-markdown><script type="text/template">## hello 2

- world 2
</script></section></section>`;
  expect(buildSlides(md1).slides).toEqual(out);
  expect(buildSlides(md2).slides).toEqual(out);
});

test('with front matter', () => {
  const content = `\
# hello

- world

## hello 2

- world 2
`;
  const md1 = `\
---
title: 'hello'
author: it's me
css:
  - https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css
---

${content}`;
  const md2 = `\
---
title: 'hello'
author: it's me
css:
  - https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css
---

should ignore text before first heading

${content}`;
  const slides = `\
<section><section data-markdown><script type="text/template"># hello

- world
</script></section><section data-markdown><script type="text/template">## hello 2

- world 2
</script></section></section>`;
  const out = {
    title: 'hello',
    author: 'it\'s me',
    theme: 'black',
    highlightTheme: 'zenburn',
    revealVersion: 'TEST',
    css: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/combine/npm/reveal.js@TEST/dist/reveal.css,npm/reveal.js@TEST/dist/theme/black.css,npm/reveal.js@TEST/plugin/highlight/zenburn.css">\n<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css">',
    js: '<script src="https://cdn.jsdelivr.net/combine/npm/reveal.js@TEST/dist/reveal.min.js,npm/reveal.js@TEST/plugin/markdown/markdown.js,npm/reveal.js@TEST/plugin/highlight/highlight.js,npm/reveal.js@TEST/plugin/math/math.js,npm/reveal.js@TEST/plugin/notes/notes.js,npm/reveal.js@TEST/plugin/search/search.js,npm/reveal.js@TEST/plugin/zoom/zoom.js"></script>',
    slides,
  };
  expect(buildSlides(md1)).toEqual(out);
  expect(buildSlides(md2)).toEqual(out);
});
