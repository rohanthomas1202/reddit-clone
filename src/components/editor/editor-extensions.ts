import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { Underline } from "@tiptap/extension-underline";
import { StarterKit } from "@tiptap/starter-kit";
import { Extension, type Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// ============================================================
// SLASH COMMAND ITEM TYPE
// ============================================================

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: Editor) => void;
  keywords: string[];
}

// ============================================================
// SLASH COMMAND EXTENSION
// ============================================================

export const SlashCommands = Extension.create({
  name: "slashCommands",
  addProseMirrorPlugins() {
    const pluginKey = new PluginKey("slashCommands");
    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, set) {
            return set.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return pluginKey.getState(state) as DecorationSet;
          },
        },
      }),
    ];
  },
});

// ============================================================
// CUSTOM LINK EXTENSION
// ============================================================

export const CustomLink = Link.configure({
  openOnClick: false,
  autolink: true,
  linkOnPaste: true,
  HTMLAttributes: {
    class: "text-orange-500 underline underline-offset-2 hover:text-orange-600 cursor-pointer transition-colors",
    rel: "noopener noreferrer nofollow",
    target: "_blank",
  },
});

// ============================================================
// SLASH COMMAND ITEMS
// ============================================================

export const getSlashCommandItems = (): SlashCommandItem[] => [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: "H1",
    keywords: ["h1", "heading", "title", "large"],
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: "H2",
    keywords: ["h2", "heading", "subtitle", "medium"],
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: "H3",
    keywords: ["h3", "heading", "small"],
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Create an unordered list",
    icon: "•",
    keywords: ["ul", "bullet", "list", "unordered"],
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Create an ordered list",
    icon: "1.",
    keywords: ["ol", "numbered", "ordered", "list"],
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Task List",
    description: "Create a checklist",
    icon: "☑",
    keywords: ["todo", "check", "task", "checkbox"],
    command: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    title: "Code Block",
    description: "Add a code snippet",
    icon: "</>",
    keywords: ["code", "codeblock", "snippet", "pre"],
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Blockquote",
    description: "Add a quote",
    icon: '"',
    keywords: ["quote", "blockquote", "cite"],
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Divider",
    description: "Insert a horizontal rule",
    icon: "—",
    keywords: ["hr", "divider", "line", "separator"],
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "Table",
    description: "Insert a table",
    icon: "⊞",
    keywords: ["table", "grid", "rows", "columns"],
    command: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
];

// ============================================================
// EXTENSIONS BUILDER
// ============================================================

export interface ExtensionOptions {
  placeholder?: string;
  enableCollaboration?: boolean;
}

export function buildExtensions(options: ExtensionOptions = {}) {
  const { placeholder = "Write something amazing..." } = options;

  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: "font-bold leading-tight",
        },
      },
      bulletList: {
        HTMLAttributes: { class: "list-disc list-outside ml-4 space-y-1" },
      },
      orderedList: {
        HTMLAttributes: { class: "list-decimal list-outside ml-4 space-y-1" },
      },
      blockquote: {
        HTMLAttributes: {
          class:
            "border-l-4 border-orange-500/50 pl-4 italic text-zinc-600 dark:text-zinc-400",
        },
      },
      code: {
        HTMLAttributes: {
          class:
            "bg-zinc-100 dark:bg-zinc-800 text-orange-500 rounded px-1.5 py-0.5 text-sm font-mono",
        },
      },
      codeBlock: {
        HTMLAttributes: {
          class:
            "bg-zinc-900 dark:bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-x-auto",
        },
      },
      horizontalRule: {
        HTMLAttributes: {
          class: "border-zinc-200 dark:border-zinc-700 my-4",
        },
      },
    }),
    CustomLink,
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
      HTMLAttributes: {
        class: "rounded px-0.5",
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Typography,
    Subscript,
    Superscript,
    TaskList.configure({
      HTMLAttributes: { class: "not-prose space-y-1" },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: { class: "flex items-start gap-2" },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: "border-collapse w-full",
      },
    }),
    TableRow.configure({
      HTMLAttributes: { class: "border-b border-zinc-200 dark:border-zinc-700" },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class:
          "bg-zinc-50 dark:bg-zinc-800 font-semibold text-left px-3 py-2 text-sm",
      },
    }),
    TableCell.configure({
      HTMLAttributes: { class: "px-3 py-2 text-sm" },
    }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: "is-editor-empty",
    }),
    SlashCommands,
  ];
}