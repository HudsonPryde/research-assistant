"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectSuggestions,
  setSelectedSuggestion,
  findSources,
} from "@/redux/slice";

export default function SuggestionTooltip() {
  const dispatch = useAppDispatch();
  const suggestions = useAppSelector(selectSuggestions);
  const [cursorX, setCursorX] = useState(undefined);
  const [cursorY, setCursorY] = useState(undefined);
  const [showTooltip, setShowTooltip] = useState(false);
  const [suggestionText, setSuggestionText] = useState<string | undefined>(
    undefined
  );
  useEffect(() => {
    document.addEventListener("suggestionHover", (e: any) => {
      if (e.detail?.y && e.detail?.x) {
        setCursorX(e.detail.x);
        setCursorY(e.detail.y);
        setSuggestionText(e.detail.text);
      }
      setShowTooltip(e.detail.visible);
    });
  }, []);
  if (!cursorX || !cursorY) return null;
  return (
    <div
      style={{
        top: cursorY - 32,
        left: cursorX - 80.5,
      }}
      className={`absolute bg-zinc-100 rounded-full  ${
        showTooltip ? "opacity-100 " : "opacity-0"
      } transition-all duration-300 ease-in-out animate-fade-in hover:opacity-100 shadow-md flex flex-row`}
    >
      <div
        className="w-32 h-8 hover:underline text-zinc-900 flex justify-center items-center border-r-[1px] border-zinc-300 cursor-pointer"
        onClick={(e) => {
          if (!suggestionText) return;
          const suggestion = suggestions.find(
            (suggestion) =>
              suggestion.snippet.toLowerCase() === suggestionText.toLowerCase()
          );
          if (!suggestion) return;
          dispatch(setSelectedSuggestion(suggestion));
          dispatch(findSources(suggestion.terms));
        }}
      >
        Find support
      </div>
      <Image
        width={28}
        height={28}
        className="pr-1 cursor-pointer rounded-r-full hover:bg-zinc-300 transition-colors duration-150 ease-in-out"
        src="/close.svg"
        alt="dismiss"
      />
    </div>
  );
}
