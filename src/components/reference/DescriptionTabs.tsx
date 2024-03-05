import { useState } from "react";
import { Source } from "@/types";
import { Playfair_Display } from "next/font/google";
const playfair = Playfair_Display({ subsets: ["latin"] });

export default function DescriptionTabs({ source }: { source: Source }) {
  const [tab, setTab] = useState(0);
  const [showFullText, setshowFullText] = useState(false);
  return (
    <>
      {source.tldr && (
        <div className="flex flex-row flex-none space-x-2 mt-4 rounded-full bg-zinc-950 p-1 max-w-fit transition-all">
          <div
            className={`${
              tab === 0
                ? "bg-white"
                : "bg-zinc-950 hover:bg-zinc-600 text-white"
            } h-6 rounded-full justify-center items-center hover:cursor-pointer px-2 transition-all`}
            onClick={() => setTab(0)}
          >
            <p className={`font-medium text-[16px]`}>Abstract</p>
          </div>

          <div
            className={`${
              tab === 1
                ? "bg-white"
                : "bg-zinc-950 hover:bg-zinc-600 text-white"
            } h-6 rounded-full justify-center items-center hover:cursor-pointer px-2 transition-all`}
            onClick={() => setTab(1)}
          >
            <p className={`font-medium text-[16px]`}>Summary</p>
          </div>
        </div>
      )}
      <p
        className={`${
          playfair.className
        }  text-zinc-950 flex font-medium text-[16px] mt-2 ${
          showFullText ? "" : "h-20"
        }  overflow-hidden transition-all`}
      >
        {tab === 0 ? source.abstract : source?.tldr?.text}
      </p>
      <div
        className={`flex flex-1 ${
          !showFullText ? "shadow-upper-blur" : ""
        } justify-center items-center`}
      >
        <div
          className="flex self-center h-6 justify-start items-center mt-2 hover:cursor-pointer"
          onClick={() => setshowFullText(!showFullText)}
        >
          <p
            className={` text-zinc-600 font-semibold text-[16px] hover:text-zinc-950`}
          >
            {showFullText ? "Show less" : "Show more"}
          </p>
        </div>
      </div>
    </>
  );
}
