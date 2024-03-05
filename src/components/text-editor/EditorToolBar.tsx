import * as React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $setBlocksType } from "@lexical/selection";
import "./styles.css";
import {
  $isRangeSelection,
  $getSelection,
  type TextFormatType,
  $getTextContent,
} from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  StrikethroughIcon,
  FontBoldIcon,
  FontItalicIcon,
  UnderlineIcon,
} from "@radix-ui/react-icons";
import * as Toolbar from "@radix-ui/react-toolbar";
import Image from "next/image";
import { useAppDispatch } from "@/redux/hooks";
import { GENERATE_QUERIES_COMMAND } from "./suggestion-plugin/SuggestionPlugin";

interface ToolbarButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  children: React.ReactNode;
}

function ToolbarButton(props: ToolbarButtonProps): JSX.Element {
  return (
    <Toolbar.Button className="toolbarButton" onClick={props.onClick}>
      {props.children}
    </Toolbar.Button>
  );
}

function TextFormatToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const getIcon = (format: TextFormatType): JSX.Element | null => {
    switch (format) {
      case "bold":
        return <FontBoldIcon />;
      case "italic":
        return <FontItalicIcon />;
      case "strikethrough":
        return <StrikethroughIcon />;
      case "underline":
        return <UnderlineIcon />;
      default:
        return null;
    }
  };
  const onClick = (format: TextFormatType): void => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText(format);
      }
    });
  };
  const supportedTextFormats: TextFormatType[] = [
    "bold",
    "italic",
    "strikethrough",
    "underline",
  ];
  return (
    <>
      {supportedTextFormats.map((format) => (
        <ToolbarButton
          key={format}
          onClick={() => {
            onClick(format);
          }}
        >
          {getIcon(format)}
        </ToolbarButton>
      ))}
    </>
  );
}

type HeadingTag = "h1" | "h2" | "h3";
function HeadingToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const headingTags: HeadingTag[] = ["h1", "h2", "h3"];
  const onClick = (tag: HeadingTag): void => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };
  return (
    <>
      {headingTags.map((tag) => (
        <ToolbarButton
          onClick={() => {
            onClick(tag);
          }}
          key={tag}
        >
          {tag.toUpperCase()}
        </ToolbarButton>
      ))}
    </>
  );
}

function ListToolbarPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const onClick = (tag: "ol" | "ul"): void => {
    if (tag === "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      return;
    }
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };
  return (
    <>
      <ToolbarButton
        onClick={() => {
          onClick("ol");
        }}
      >
        <Image
          src="./number-list.svg"
          alt="Ordered List"
          width={26}
          height={26}
        />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          onClick("ul");
        }}
      >
        <Image
          src="./bullet-list.svg"
          alt="Unordered List"
          width={26}
          height={26}
        />
      </ToolbarButton>
    </>
  );
}

function SuggestionToolbarPlugin(): JSX.Element {
  const dispatch = useAppDispatch();
  const [editor] = useLexicalComposerContext();
  const onClick = (): void => {
    editor.dispatchCommand(GENERATE_QUERIES_COMMAND, undefined);
  };
  return (
    <ToolbarButton onClick={onClick}>
      <Image
        src="./quick_reference.svg"
        alt="Suggestion"
        width={26}
        height={26}
      />
    </ToolbarButton>
  );
}

export function ToolbarPlugin(): JSX.Element {
  return (
    <Toolbar.Root className="toolbarRoot">
      <TextFormatToolbarPlugin />
      <HeadingToolbarPlugin />
      <ListToolbarPlugin />
      <SuggestionToolbarPlugin />
    </Toolbar.Root>
  );
}
