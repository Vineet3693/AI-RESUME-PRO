import { Mark, mergeAttributes } from '@tiptap/core';

export interface ColorMarkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    colorMark: {
      setColorMark: (color: 'green' | 'yellow' | 'red' | 'grey') => ReturnType;
      unsetColorMark: () => ReturnType;
    };
  }
}

export const ColorMark = Mark.create<ColorMarkOptions>({
  name: 'colorMark',
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-color'),
        renderHTML: attributes => {
          if (!attributes.color) {
            return {};
          }
          return {
            'data-color': attributes.color,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span[data-color]',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setColorMark: (color) => ({ commands }) => {
        return commands.setMark(this.name, { color });
      },
      unsetColorMark: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});
