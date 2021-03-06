import { promises as fs } from 'fs';
import path from 'path';
import open from 'open';
import {
  ExtensionContext,
  commands,
  workspace,
} from 'coc.nvim';
import { buildReveal } from './reveal';

async function getFullText(): Promise<string> {
  const doc = await workspace.document;
  return doc.textDocument.getText();
}

async function getSelectedText(): Promise<string> {
  const doc = await workspace.document;
  const range = await workspace.getSelectedRange('v', doc);
  return doc.textDocument.getText(range);
}

async function getRangeText(line1: string, line2: string): Promise<string> {
  const { nvim } = workspace;
  const lines = await (nvim.eval(`getline(${line1},${line2})`)) as string[];
  return lines.join('\n');
}

async function createReveal(options: {
  content: string;
  output: string;
  open?: boolean;
}) {
  const html = buildReveal(options.content);
  await fs.writeFile(options.output, html);
  if (options.open) open(options.output);
}

async function revealIt(content: string, options?: any): Promise<void> {
  const { nvim } = workspace;
  const input = await nvim.eval('expand("%:p")') as string;
  options = {
    open: true,
    ...options,
  };
  if (options.watch) {
    // TODO
  } else {
    const basename = path.basename(input, path.extname(input));
    createReveal({
      content,
      output: basename && `${basename}.html`,
      open: options.open,
    });
  }
}

export function activate(context: ExtensionContext): void {
  context.subscriptions.push(workspace.registerKeymap(
    ['n'],
    'reveal-it',
    async () => {
      await revealIt(await getFullText());
    },
    { sync: false },
  ));

  context.subscriptions.push(workspace.registerKeymap(
    ['v'],
    'reveal-it-v',
    async () => {
      await revealIt(await getSelectedText());
    },
    { sync: false },
  ));

  context.subscriptions.push(commands.registerCommand(
    'reveal.it',
    async (...args: string[]) => {
      const positional = [];
      const options: any = {};
      for (const arg of args) {
        if (['-w', '--watch'].includes(arg)) options.watch = true;
        else if (['--no-open'].includes(arg)) options.open = false;
        else if (!arg.startsWith('-')) positional.push(arg);
      }
      const [line1, line2] = positional;
      const content = line1 && line2 ? await getRangeText(line1, line2) : await getFullText();
      await revealIt(content, options);
    },
  ));
}
