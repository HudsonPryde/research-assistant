import { useState, useEffect } from "react";
import ReferenceContainer from "./ReferenceContainer";
import { sampleSources } from "@/data/sampleSources";
import Image from "next/image";
import { isPending } from "@reduxjs/toolkit";
import { useAppSelector } from "@/redux/hooks";
import {
  selectSources,
  selectSelectedSuggestion,
  selectPendingTasks,
  findSources,
} from "@/redux/slice";
import { useGetTasksQuery } from "@/redux/services/tasks";

const References = () => {
  const sources = useAppSelector(selectSources);
  const selectedSuggestion = useAppSelector(selectSelectedSuggestion);
  const pendingTasks = useAppSelector(selectPendingTasks);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, status, error, refetch } = useGetTasksQuery(pendingTasks, {
    pollingInterval: 15000,
    skip: pendingTasks.length === 0,
  });

  useEffect(() => {
    setSearchQuery(selectedSuggestion?.terms || "");
  }, [selectedSuggestion]);

  const isFindingSources = isPending(findSources);

  useEffect(() => {
    isFindingSources;
  });

  return (
    <div
      style={{ scrollbarGutter: "stable", scrollbarWidth: "thin" }}
      className={`flex flex-1 max-h-svh max-w-2xl w-full rounded-md transition-all overflow-hidden duration-300 ease-in-out flex-col items-center hover:overflow-y-scroll`}
    >
      {/* search bar */}
      <div className="w-3/4 h-10 bg-white mt-12 rounded-full shadow-md flex flex-row flex-shrink-0">
        <Image
          src="/search.svg"
          width={24}
          height={24}
          className="ml-2"
          alt="search"
        />
        <input
          type="text"
          className="w-full h-full rounded-full outline-none pl-2"
          placeholder="Search articles"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Image
          src="/close.svg"
          width={42}
          height={24}
          className="px-2 border-l-[1px] border-zinc-300 cursor-pointer hover:bg-zinc-100 transition-colors duration-150 ease-in-out rounded-r-full"
          alt="close"
          onClick={() => setSearchQuery("")}
        />
      </div>
      {/* selected suggestion */}
      {selectedSuggestion && (
        <div className="flex flex-1 flex-row max-w-max max-h-8 border-l-4 border-blue-400 justify-center items-center space-x-2 m-8 pl-2">
          <h3 className="text-zinc-900 font-medium text-[18px]">
            {selectedSuggestion.snippet}
          </h3>
        </div>
      )}
      <div className="flex flex-col w-full items-center justify-start px-14 gap-y-6 pb-8">
        {sources ? (
          sources.map((source, index) => (
            <ReferenceContainer key={index} source={source} />
          ))
        ) : (
          <div className="flex flex-row w-full items-center justify-center gap-x-2">
            <div className="w-6 h-6 bg-zinc-400 rounded-full animate-loadingBounce" />
            <div
              style={{ animationDelay: "200ms" }}
              className="w-6 h-6 bg-zinc-400 rounded-full animate-loadingBounce"
            />
            <div
              style={{ animationDelay: "300ms" }}
              className="w-6 h-6 bg-zinc-400 rounded-full animate-loadingBounce"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default References;
