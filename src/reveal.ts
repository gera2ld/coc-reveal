import yaml from 'js-yaml';

const TEMPLATE = process.env.TEMPLATE;

export function parseMarkdown(content: string) {
  const lines = content.split('\n');
  let index = 0;

  const frontMatter = {
    title: 'Reveal it',
    author: 'reveal.js',
  };
  if (lines[index].trimRight() === '---') {
    const raw = [];
    for (index += 1; index < lines.length; index += 1) {
      const line = lines[index].trimRight();
      if (line === '---') {
        index += 1;
        try {
          Object.assign(frontMatter, yaml.load(raw.join('\n')));
        } catch {
          // noop
        }
        break;
      }
      raw.push(line);
    }
  }

  const sections: { level: number; content: string }[] = [];
  let section: { level: number; lines: string[] } | undefined;
  const closeSection = () => {
    if (!section) return;
    sections.push({
      level: section.level,
      content: section.lines.join('\n'),
    });
    section = null;
  };
  const newSection = (level: number) => {
    closeSection();
    section = {
      level,
      lines: [],
    };
  };
  for (; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = line.match(/^(#{1,2}) \S/);
    if (heading) {
      const level = heading[1].length;
      newSection(level);
    }
    section?.lines.push(line);
  }
  closeSection();

  return { frontMatter, sections };
}

export function buildSlides(content: string) {
  const { frontMatter, sections } = parseMarkdown(content);
  const data = [];
  for (const section of sections) {
    if (section.level === 1 && data.length) {
      data.push('</section>', '<section>');
    }
    data.push(
      '<section data-markdown>',
      '<script type="text/template">',
      section.content,
      '</script>',
      '</section>',
    );
  }
  data.unshift('<section>');
  data.push('</section>');
  return {
    ...frontMatter,
    revealVersion: process.env.REVEAL_VERSION,
    slides: data.join(''),
  };
}

export function buildReveal(content: string) {
  const context = buildSlides(content);
  const html = TEMPLATE.replace(/{{\s*(\w+)\s*}}/g, (m, g) => context[g] || m);
  return html;
}
