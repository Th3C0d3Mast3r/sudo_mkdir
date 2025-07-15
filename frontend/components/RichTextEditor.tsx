// At the top of your file
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import CodeBlock from "@tiptap/extension-code-block";
import FontSize from "@tiptap/extension-font-size";
import Blockquote from "@tiptap/extension-blockquote";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Code2,
  Quote,
} from "lucide-react";

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      BulletList,
      OrderedList,
      ListItem,
      CodeBlock,
      TextStyle,
      FontSize,
      Blockquote,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const isActive = (fn: () => boolean) =>
    editor && fn() ? "bg-orange-100 text-orange-600" : "";

  if (!editor) return null;
  return (
    <div>
      {/* Toolbar */}
      {editor && (
        <div className="flex flex-wrap gap-1 mb-2 border rounded p-1 bg-muted/30">
          <button
            type="button"
            className={`p-1 rounded ${isActive(() => editor.isActive("bold"))}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`p-1 rounded ${isActive(() =>
              editor.isActive("italic")
            )}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`p-1 rounded ${isActive(() =>
              editor.isActive("underline")
            )}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`p-1 rounded ${isActive(() =>
              editor.isActive("strike")
            )}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <span className="mx-1 border-l h-5" />
          <button
            type="button"
            className={`p-1 rounded ${isActive(() =>
              editor.isActive({ textAlign: "left" })
            )}`}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`p-1 rounded ${isActive(() =>
              editor.isActive({ textAlign: "center" })
            )}`}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`p-1 rounded ${isActive(() =>
              editor.isActive({ textAlign: "right" })
            )}`}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <span className="mx-1 border-l h-5" />
          <button
            type="button"
            className={`p-1 rounded ${isActive(() =>
              editor.isActive("bulletList")
            )}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`p-1 rounded ${isActive(() =>
              editor.isActive("orderedList")
            )}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <span className="mx-1 border-l h-5" />

          <button
            type="button"
            className={`p-1 rounded ${isActive(() =>
              editor.isActive("codeBlock")
            )}`}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code Block"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <select
            className="border rounded p-1 text-xs"
            onChange={(e) =>
              editor.chain().focus().setFontSize(e.target.value).run()
            }
            value={editor.getAttributes("textStyle").fontSize || "16px"}
          >
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="24px">24</option>
            <option value="32px">32</option>
          </select>
          <button
            type="button"
            className={`p-1 rounded ${isActive(() =>
              editor.isActive("blockquote")
            )}`}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Editor */}
      <EditorContent
        editor={editor}
        className="border rounded p-2 min-h-[120px] bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 rich-text-content"
      />
      <style jsx global>{`
        .rich-text-content ul {
          list-style-type: disc;
          margin-left: 1.5em;
          padding-left: 1.5em;
        }
        .rich-text-content ol {
          list-style-type: decimal;
          margin-left: 1.5em;
          padding-left: 1.5em;
        }
        .rich-text-content li {
          margin-bottom: 0.25em;
        }
        .rich-text-content pre {
          background: #1a1a1a;
          color: #f8f8f2;
          border-radius: 0.375rem;
          padding: 1em;
          font-size: 0.95em;
          overflow-x: auto;
          margin: 0.5em 0;
        }
        .rich-text-content code {
          background: var(--muted);
          color: #d6336c;
          border-radius: 0.25em;
          padding: 0.2em 0.4em;
          font-size: 0.95em;
        }
        .rich-text-content blockquote {
          border-left: 4px solid #f97316;
          background: var(--muted);
          color: #a16207;
          margin: 0.5em 0;
          padding: 0.5em 1em;
          border-radius: 0.375rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
