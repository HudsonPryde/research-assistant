"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import LexicalErrorBoundry from "@lexical/react/LexicalErrorBoundary";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ToolbarPlugin } from "./EditorToolBar";
import { SuggestionPlugin } from "./suggestion-plugin/SuggestionPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { SuggestionNode } from "./suggestion-plugin/SuggestionPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ListNode, ListItemNode } from "@lexical/list";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { initialState } from "@/data/sampleEditorState";

const TextEditor = () => {
  const theme = {
    heading: {
      h1: "editor-h1",
      h2: "editor-h2",
      h3: "editor-h3",
    },
    text: {
      bold: "editor-bold",
      italic: "editor-italic",
      underline: "editor-underline",
      strikethrough: "editor-strikethrough",
    },
  };

  const initConfig: InitialConfigType = {
    namespace: "Editor",
    theme,
    onError: (error, info) => console.log(error, info),
    nodes: [HeadingNode, ListNode, ListItemNode, SuggestionNode],
    editorState: initialState,
  };

  return (
    <div>
      <LexicalComposer initialConfig={initConfig}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="contentEditable" />}
          placeholder={<div className="placeHolder">Start typing...</div>}
          ErrorBoundary={LexicalErrorBoundry}
        />
        <SuggestionPlugin />
        <ListPlugin />
        <HistoryPlugin />
      </LexicalComposer>
    </div>
  );
};

export default TextEditor;
