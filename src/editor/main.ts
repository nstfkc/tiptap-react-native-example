import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

export type EditorState = {
  html: string;
  canBold: boolean;
  canItalic: boolean;
  canStrike: boolean;
  canSinkListItem: boolean;
  canLiftListItem: boolean;
  isBulletListActive: boolean;
  isBoldActive: boolean;
  isItalicActive: boolean;
  isStrikeActive: boolean;
};

export type WebViewMessage =
  | {
      kind: "editorStateUpdate";
      payload: EditorState;
    }
  | { kind: "editorInitialised" };

function sendMessageFromWebView(params: WebViewMessage) {
  (window as any).ReactNativeWebView?.postMessage(JSON.stringify(params));
}

function getEditorState(editor: Editor): EditorState {
  return {
    html: editor.getHTML(),
    canBold: editor.can().chain().focus().toggleBold().run(),
    canItalic: editor.can().chain().focus().toggleItalic().run(),
    canStrike: editor.can().chain().focus().toggleStrike().run(),
    canSinkListItem: editor.can().sinkListItem("listItem"),
    canLiftListItem: editor.can().liftListItem("listItem"),
    isBulletListActive: editor.isActive("bulletList"),
    isBoldActive: editor.isActive("bold"),
    isItalicActive: editor.isActive("italic"),
    isStrikeActive: editor.isActive("strike"),
  };
}

const editor = new Editor({
  element: document.getElementById("editor")!,
  extensions: [StarterKit],
  onCreate: () => {
    sendMessageFromWebView({ kind: "editorInitialised" });
  },
  onSelectionUpdate: ({ editor }) => {
    sendMessageFromWebView({
      kind: "editorStateUpdate",
      payload: getEditorState(editor),
    });
  },
  onUpdate: ({ editor }) => {
    sendMessageFromWebView({
      kind: "editorStateUpdate",
      payload: getEditorState(editor),
    });
  },
});

type EditorAction =
  | "toggleBold"
  | "toggleItalic"
  | "toggleStrike"
  | "toggleListItem"
  | "sinkListItem"
  | "liftListItem";

const editorActions: Record<EditorAction, VoidFunction> = {
  liftListItem: () => editor.chain().focus().liftListItem("listItem").run(),
  sinkListItem: () => editor.chain().focus().sinkListItem("listItem").run(),
  toggleListItem: () => editor.chain().focus().toggleBulletList().run(),
  toggleBold: () => editor.chain().focus().toggleBold().run(),
  toggleItalic: () => editor.chain().focus().toggleItalic().run(),
  toggleStrike: () => editor.chain().focus().toggleStrike().run(),
};

export type NativeMessage =
  | { kind: "action"; payload: EditorAction }
  | { kind: "editor"; payload: "focus" | "blur" }
  | { kind: "initialContent"; payload: string };

window.addEventListener("message", (message: { data: string }) => {
  const nativeMessage: NativeMessage = JSON.parse(message.data);
  if (nativeMessage.kind === "action") {
    const fn = editorActions[nativeMessage.payload];
    fn();
  }
  if (nativeMessage.kind === "initialContent") {
    editor.commands.setContent(nativeMessage.payload);
  }
  if (nativeMessage.kind === "editor") {
    if (nativeMessage.payload === "focus") {
      editor.commands.focus();
    }
    if (nativeMessage.payload === "blur") {
      editor.commands.blur();
    }
  }
});
