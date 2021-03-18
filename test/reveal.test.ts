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
---

${content}`;
  const md2 = `\
---
title: 'hello'
author: it's me
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
    slides,
  };
  expect(buildSlides(md1)).toEqual(out);
  expect(buildSlides(md2)).toEqual(out);
});
