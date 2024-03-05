import {
  COMMAND_PRIORITY_LOW,
  createCommand,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  TextNode,
  $applyNodeReplacement,
  $getRoot,
  $isElementNode,
  $isTextNode,
  $isLineBreakNode,
  $createTextNode,
  ElementNode,
  SerializedElementNode,
  Spread,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { addClassNamesToElement, mergeRegister } from "@lexical/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { createSuggestions, selectSuggestions } from "@/redux/slice";

type ChangeHandler = (text: string | null, prevText: string | null) => void;

type SuggestionMatcherResult = {
  index: number;
  length: number;
  text: string;
};

type SerializedSuggestionNode = Spread<
  {
    text: string;
  },
  SerializedElementNode
>;

export type SuggestionMatcher = (
  text: string
) => SuggestionMatcherResult | null;

export class SuggestionNode extends ElementNode {
  __text: string;

  static getType(): string {
    return "suggestion";
  }

  static clone(node: SuggestionNode): SuggestionNode {
    return new SuggestionNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(key);
    this.__text = text;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement("span");
    addClassNamesToElement(
      element,
      " max-w-max hover:bg-blue-200 bg-transparent border-b-2 border-blue-300 transition-all duration-300 ease-in-out"
    );

    element.addEventListener("mouseenter", (e) => {
      const { height, y } = element.getBoundingClientRect();
      const elementY = e.y - y; // y position relative to the element
      const top = elementY < height / 2 ? y : y + height / 2; // position the tooltip above the text line *only works for 2 lines of text*
      const evt = new CustomEvent("suggestionHover", {
        detail: { x: e.pageX, y: top, visible: true, text: this.__text },
      });
      document.dispatchEvent(evt);
    });
    element.addEventListener("mouseleave", () => {
      const evt = new CustomEvent("suggestionHover", {
        detail: { visible: false },
      });
      document.dispatchEvent(evt);
    });
    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedSuggestionNode): SuggestionNode {
    const node = $createSuggestionNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedSuggestionNode {
    return {
      ...super.exportJSON(),
      type: "suggestion",
      text: this.__text,
    };
  }

  canInsertTextBefore(): false {
    return false;
  }

  canInsertTextAfter(): false {
    return false;
  }

  // isTextEntity(): true {
  //   return true;
  // }

  canMergeWith(node: ElementNode): boolean {
    return false;
  }

  canBeEmpty(): false {
    return false;
  }

  getText(): string {
    return this.__text;
  }
}

export function $createSuggestionNode(text = ""): SuggestionNode {
  return $applyNodeReplacement(new SuggestionNode(text));
}

export function $isSuggestionNode(
  node: LexicalNode | null | undefined
): node is SuggestionNode {
  return node instanceof SuggestionNode;
}

const PUNCTUATION_OR_SPACE = /[.,;?!\s]/;

function isSeparator(char: string): boolean {
  return PUNCTUATION_OR_SPACE.test(char);
}

function endsWithSeparator(textContent: string): boolean {
  return isSeparator(textContent[textContent.length - 1]);
}

function startsWithSeparator(textContent: string): boolean {
  return isSeparator(textContent[0]);
}

export const GENERATE_QUERIES_COMMAND = createCommand("generateQueries");

function isPreviousNodeValid(node: LexicalNode): boolean {
  let previousNode = node.getPreviousSibling();
  if ($isElementNode(previousNode)) {
    previousNode = previousNode.getLastDescendant();
  }
  return (
    previousNode === null ||
    $isLineBreakNode(previousNode) ||
    ($isTextNode(previousNode) &&
      endsWithSeparator(previousNode.getTextContent()))
  );
}

function isNextNodeValid(node: LexicalNode): boolean {
  let nextNode = node.getNextSibling();
  if ($isElementNode(nextNode)) {
    nextNode = nextNode.getFirstDescendant();
  }
  return (
    nextNode === null ||
    $isLineBreakNode(nextNode) ||
    ($isTextNode(nextNode) && startsWithSeparator(nextNode.getTextContent()))
  );
}

const findFirstMatch = (
  text: string,
  matchers: Array<SuggestionMatcher>
): SuggestionMatcherResult | null => {
  for (let i = 0; i < matchers.length; i++) {
    const match = matchers[i](text);
    if (match) {
      return match;
    }
  }
  return null;
};

const isContentArroundIsValid = (
  matchStart: number,
  matchEnd: number,
  text: string,
  nodes: TextNode[]
): boolean => {
  const contentBeforeIsValid =
    matchStart > 0
      ? isSeparator(text[matchStart - 1])
      : isPreviousNodeValid(nodes[0]);
  if (!contentBeforeIsValid) return false;
  const contentAfterIsValid =
    matchEnd < text.length
      ? isSeparator(text[matchEnd])
      : isNextNodeValid(nodes[nodes.length - 1]);
  return contentAfterIsValid;
};

function extractMatchingNodes(
  nodes: TextNode[],
  startIndex: number,
  endIndex: number
): [
  matchingOffset: number,
  unmodifiedBeforeNodes: TextNode[],
  matchingNodes: TextNode[],
  unmodifiedAfterNodes: TextNode[]
] {
  const unmodifiedBeforeNodes: TextNode[] = [];
  const matchingNodes: TextNode[] = [];
  const unmodifiedAfterNodes: TextNode[] = [];
  let matchingOffset = 0;

  let currentOffset = 0;
  const currentNodes = [...nodes];

  while (currentNodes.length > 0) {
    const currentNode = currentNodes[0];
    const currentNodeText = currentNode.getTextContent();
    const currentNodeLength = currentNodeText.length;
    const currentNodeStart = currentOffset;
    const currentNodeEnd = currentOffset + currentNodeLength;

    if (currentNodeEnd <= startIndex) {
      unmodifiedBeforeNodes.push(currentNode);
      matchingOffset += currentNodeLength;
    } else if (currentNodeStart >= endIndex) {
      unmodifiedAfterNodes.push(currentNode);
    } else {
      matchingNodes.push(currentNode);
    }
    currentOffset += currentNodeLength;
    currentNodes.shift();
  }
  return [
    matchingOffset,
    unmodifiedBeforeNodes,
    matchingNodes,
    unmodifiedAfterNodes,
  ];
}

export function SuggestionPlugin(): JSX.Element | null {
  const dispatch = useAppDispatch();
  const suggestions = useAppSelector(selectSuggestions);
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([SuggestionNode])) {
      throw new Error(
        "SuggestionPlugin requires SuggestionNode to be registered"
      );
    }
  }, [editor]);

  const createSuggestionNode = (
    nodes: TextNode[],
    startIndex: number,
    endIndex: number,
    match: SuggestionMatcherResult
  ): TextNode | undefined => {
    const suggestionNode = $createSuggestionNode(match.text);
    if (nodes.length === 1) {
      let remainingTextNode = nodes[0];
      let suggestionTextNode;
      if (startIndex === 0) {
        [suggestionTextNode, remainingTextNode] =
          remainingTextNode.splitText(endIndex);
      } else {
        [, suggestionTextNode, remainingTextNode] = remainingTextNode.splitText(
          startIndex,
          endIndex
        );
      }
      const textNode = $createTextNode(match.text);
      textNode.setFormat(suggestionTextNode.getFormat());
      textNode.setDetail(suggestionTextNode.getDetail());
      suggestionNode.append(textNode);
      suggestionTextNode.replace(suggestionNode);
      return remainingTextNode;
    } else if (nodes.length > 1) {
      const firstTextNode = nodes[0];
      let offset = firstTextNode.getTextContent().length;
      let firstSuggestionTextNode;
      if (startIndex === 0) {
        firstSuggestionTextNode = firstTextNode;
      } else {
        [, firstSuggestionTextNode] = firstTextNode.splitText(startIndex);
      }
      const suggestionNodes = [];
      let remainingTextNode;
      for (let i = 1; i < nodes.length; i++) {
        const currentNode = nodes[i];
        const currentNodeText = currentNode.getTextContent();
        const currentNodeLength = currentNodeText.length;
        const currentNodeStart = offset;
        const currentNodeEnd = offset + currentNodeLength;
        if (currentNodeStart < endIndex) {
          if (currentNodeEnd <= endIndex) {
            suggestionNodes.push(currentNode);
          } else {
            const [suggestionTextNode, endNode] = currentNode.splitText(
              endIndex - currentNodeStart
            );
            suggestionNodes.push(suggestionTextNode);
            remainingTextNode = endNode;
          }
        }
        offset += currentNodeLength;
      }
      const textNode = $createTextNode(
        firstSuggestionTextNode.getTextContent()
      );
      textNode.setFormat(firstSuggestionTextNode.getFormat());
      textNode.setDetail(firstSuggestionTextNode.getDetail());
      suggestionNode.append(textNode, ...suggestionNodes);
      firstSuggestionTextNode.replace(suggestionNode);
      return remainingTextNode;
    }
    return undefined;
  };

  const handleSuggestionCreation = (
    nodes: TextNode[],
    matchers: Array<SuggestionMatcher>,
    onChange: ChangeHandler
  ): void => {
    let currentNodes = [...nodes];
    const initialText = currentNodes
      .map((node) => node.getTextContent())
      .join("");
    let text = initialText;
    let match;
    let invalidMatchEnd = 0;

    while ((match = findFirstMatch(text, matchers)) && match != null) {
      const matchStart = match.index;
      const matchLength = match.length;
      const matchEnd = matchStart + matchLength;
      const isValid = isContentArroundIsValid(
        invalidMatchEnd + matchStart,
        invalidMatchEnd + matchEnd,
        initialText,
        currentNodes
      );
      if (isValid) {
        const [matchingOffset, , matchingNodes, unmodifiedAfterNodes] =
          extractMatchingNodes(
            currentNodes,
            invalidMatchEnd + matchStart,
            invalidMatchEnd + matchEnd
          );

        const actualMatchStart = invalidMatchEnd + matchStart - matchingOffset;
        const actualMatchEnd = invalidMatchEnd + matchEnd - matchingOffset;
        const remainingTextNode = createSuggestionNode(
          matchingNodes,
          actualMatchStart,
          actualMatchEnd,
          match
        );
        currentNodes = remainingTextNode
          ? [remainingTextNode, ...unmodifiedAfterNodes]
          : unmodifiedAfterNodes;
        onChange(match.text, null);
        invalidMatchEnd = 0;
      } else {
        invalidMatchEnd += matchEnd;
      }
      text = text.substring(matchEnd);
    }
  };

  const getNodesToMatch = (): TextNode[] => {
    return $getRoot()
      .getAllTextNodes()
      .filter((node) => !$isSuggestionNode(node.getParentOrThrow()));
  };

  const getTextMatch = (text: string) => {
    if (suggestions.length < 1 || text.length < 1) return null;
    const snippets = suggestions.map((suggestion) =>
      suggestion.snippet.replaceAll("?", "\\?")
    );
    let matchString = `(${snippets.join("|")})`;
    const REGEX = new RegExp(matchString, "i");
    const match = REGEX.exec(text);
    if (match === null) return null;
    return {
      index: match.index,
      length: match[0].length,
      text: match[0],
    };
  };

  editor.registerCommand(
    GENERATE_QUERIES_COMMAND,
    (payload: string) => {
      const text = $getRoot().getTextContent();
      // const suggestions = generateQueries(text);
      dispatch(createSuggestions(text));
      return true;
    },
    COMMAND_PRIORITY_LOW
  );

  function onChange(
    text: string | null,
    prevText: string | null
  ): ChangeHandler {
    return () => {
      // console.log(text, prevText);
    };
  }

  useEffect(() => {
    return mergeRegister(
      editor.registerNodeTransform(TextNode, (textNode: TextNode) => {
        const parent = textNode.getParentOrThrow();
        const previous = textNode.getPreviousSibling();

        if ($isSuggestionNode(parent)) {
          // handle suggestion edit
        } else if (!$isSuggestionNode(parent)) {
          if (
            textNode.isSimpleText() &&
            (startsWithSeparator(textNode.getTextContent()) ||
              !$isSuggestionNode(previous))
          ) {
            const textNodesToMatch = getNodesToMatch();
            handleSuggestionCreation(
              textNodesToMatch,
              [getTextMatch],
              onChange
            );
          }
        }
      })
    );
  }, [editor, suggestions]);
  return null;
}
