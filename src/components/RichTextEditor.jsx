import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: { class: "prose prose-sm max-w-none focus:outline-none" },
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-2xl bg-white">
      <Toolbar editor={editor} />
      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function Toolbar({ editor }) {
  const Btn = ({ active, onClick, children }) => (
    <button
      className={`text-xs px-2 py-1 rounded-lg border ${active ? "bg-gray-100" : "hover:bg-gray-50"}`}
      onClick={onClick}
      type="button"
    >{children}</button>
  );
  return (
    <div className="flex gap-2 p-2 border-b bg-white rounded-t-2xl">
      <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</Btn>
      <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>I</Btn>
      <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</Btn>
      <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</Btn>
      <Btn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
      <Btn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;&rdquo;</Btn>
    </div>
  );
}
