import * as React from "react";
import { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import { WebView } from "react-native-webview";
import editorHtml from "../editor/dist/index.html";
import type {
  EditorState,
  NativeMessage,
  WebViewMessage,
} from "../editor/main";

interface RichTextEditorProps {
  content?: string;
}
export const RichTextEditor = (props: RichTextEditorProps) => {
  const { content = "" } = props;
  const [editorState, setEditorState] = useState<EditorState>({
    html: "",
    canBold: false,
    canItalic: false,
    canStrike: false,
    canSinkListItem: false,
    canLiftListItem: false,
    isBulletListActive: false,
    isBoldActive: false,
    isItalicActive: false,
    isStrikeActive: false,
  });

  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    sendMessageToWebView({ kind: "initialContent", payload: content });
  }, [content]);

  function sendMessageToWebView(message: NativeMessage) {
    webViewRef?.current?.postMessage(JSON.stringify(message));
  }

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() =>
            sendMessageToWebView({ kind: "action", payload: "toggleBold" })
          }
          style={[
            styles.actionDefault,
            editorState.isBoldActive
              ? styles.actionActive
              : styles.actionInactive,
          ]}
        >
          <Text>Bold</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            sendMessageToWebView({ kind: "action", payload: "toggleItalic" })
          }
          style={[
            styles.actionDefault,
            editorState.isItalicActive
              ? styles.actionActive
              : styles.actionInactive,
          ]}
        >
          <Text>Italic</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            sendMessageToWebView({ kind: "action", payload: "toggleListItem" })
          }
          style={[
            styles.actionDefault,
            editorState.isBulletListActive
              ? styles.actionActive
              : styles.actionInactive,
          ]}
        >
          <Text>Toggle List</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            sendMessageToWebView({ kind: "action", payload: "sinkListItem" })
          }
          style={[
            styles.actionDefault,
            !editorState.canSinkListItem ? styles.actionDisabled : {},
          ]}
        >
          <Text>Sink List item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            sendMessageToWebView({ kind: "action", payload: "liftListItem" })
          }
          style={[
            styles.actionDefault,
            !editorState.canLiftListItem ? styles.actionDisabled : {},
          ]}
        >
          <Text>Lift List item</Text>
        </TouchableOpacity>
      </View>
      <TouchableWithoutFeedback
        onPress={() => {
          sendMessageToWebView({ kind: "editor", payload: "focus" });
        }}
      >
        <WebView
          ref={webViewRef}
          style={styles.webview}
          originWhitelist={["*"]}
          scrollEnabled={false}
          onMessage={(event) => {
            const webViewMessage = JSON.parse(
              event.nativeEvent.data
            ) as WebViewMessage;

            if (webViewMessage.kind === "editorStateUpdate") {
              setEditorState(webViewMessage.payload);
            }
            if (webViewMessage.kind === "editorInitialised") {
              sendMessageToWebView({
                kind: "initialContent",
                payload: content,
              });
            }
          }}
          source={{ html: `${editorHtml}` }}
        />
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = {
  ...StyleSheet.create({
    container: {
      flex: 1,
      maxHeight: 200,
    },
    actions: { flexDirection: "row", gap: 4, padding: 4 },
    actionDefault: {
      padding: 4,
      borderRadius: 6,
    },
    actionActive: { backgroundColor: "rgba(0,0,0,0.1)" },
    actionInactive: {},
    actionDisabled: {
      opacity: 0.5,
    },
    webview: {
      flex: 1,
      minHeight: 140,
    },
  }),
};
