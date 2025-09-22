export const h1 = (text: string) => `# ${text}`;

export const h2 = (text: string) => `## ${text}`;

export const h3 = (text: string) => `### ${text}`;

export const h4 = (text: string) => `#### ${text}`;

export const h5 = (text: string) => `##### ${text}`;

export const h6 = (text: string) => `###### ${text}`;

export const bold = (text: string) => `**${text}**`;

export const italic = (text: string) => `*${text}*`;

export const strikethrough = (text: string) => `~~${text}~~`;

export const underline = (text: string) => `__${text}__`;

export const inlineCode = (text: string) => `\`${text}\``;

export const codeBlock = (text: string, language = '') =>
  `\`\`\`${language}\n${text}\n\`\`\``;

export const blockquote = (text: string) => `> ${text}`;

export const link = (text: string, url: string) => `[${text}](${url})`;

export const unorderedList = (items: string[]) =>
  items.map((item) => `- ${item}`).join('\n');

export const orderedList = (items: string[]) =>
  items.map((item, index) => `${index + 1}. ${item}`).join('\n');

export const horizontalRule = () => '---';

export const lineBreak = () => '\n';
