import React from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./MenuBar";

interface Props {
  editor: Editor | null;
}

export default (props: Props) => {
  const editor = props.editor;
  function printContent() {
    console.log("editor.getHTML()");
    if (!editor) {
      return null;
    }
    console.log(editor.getHTML());
  }

  return (
    <div
      className="w-full overflow-auto"
      style={{ maxHeight: "700px" }}
      id="positionDescription"
    >
      <div className="sticky top-0 bg-brand-elementBG rounded-tl-2xl rounded-tr-2xl z-50 w-full h-max">
        <MenuBar editor={editor} />
      </div>
      <EditorContent
        id="EditorContent"
        onChange={printContent}
        editor={editor}
      />
    </div>
  );
};
