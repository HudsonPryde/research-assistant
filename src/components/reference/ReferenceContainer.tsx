import { useState, useCallback } from "react";
import { Source } from "@/types";
import { Playfair_Display } from "next/font/google";
import Image from "next/image";
import DescriptionTabs from "./DescriptionTabs";
import TopicChip from "./TopicChip";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectSelectedSuggestion,
  addTask,
  selectPendingTasks,
} from "@/redux/slice";
const playfair = Playfair_Display({ subsets: ["latin"] });
type ReferenceContainerProps = {
  title: string;
  url: string;
};

const ReferenceContainer = ({ source }: { source: Source }) => {
  const [taskId, setTaskId] = useState<string>("");
  const dispatch = useAppDispatch();
  const selectedSuggestion = useAppSelector(selectSelectedSuggestion);
  const pendingTasks = useAppSelector(selectPendingTasks);

  const handleCreateTask = async () => {
    const response = await fetch("/api/support-claim", {
      method: "POST",
      body: JSON.stringify({
        snippet: selectedSuggestion?.snippet,
        source: source,
      }),
      headers: { "Content-Type": "application/json" },
    }).then((data) => data.json());
    setTaskId(response["result_id"]);
    dispatch(addTask(response["result_id"] as string));
  };

  const taskPending = useCallback(
    () => pendingTasks.includes(taskId),
    [pendingTasks, taskId]
  );

  return (
    <div className="flex w-full max-w-xl bg-white rounded-xl shadow-xl">
      <div className="flex flex-col w-full h-full p-4">
        {/* topic list and details button */}
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-row space-x-2 flex-wrap">
            {/* list of topic chips */}
            {source.fieldsOfStudy?.map((topic, index) => {
              return <TopicChip key={index} topic={topic} />;
            })}
          </div>
          {/* url link */}
          <div
            className="w-8 h-8 rounded-lg p-1 hover:shadow-md hover:cursor-pointer"
            onClick={() => window?.open(source.url, "_noopener")}
          >
            {/* link svg */}
            <Image
              src={"./open_in_new.svg"}
              alt="open in new tab"
              height={32}
              width={32}
            />
          </div>
        </div>

        <div className="flex flex-row w-full justify-between items-center border-l-[3px] pl-2  border-zinc-800 mt-2">
          {/* title */}
          <h3
            className={`${playfair.className} text-zinc-950 font-medium text-[18px]`}
          >
            {source.title}
          </h3>
          {/* article year */}
          <div className="bg-zinc-300 rounded-full px-2 self-start">
            {source.year}
          </div>
        </div>

        {/* authors */}
        <div className="flex flex-row w-full h-6 justify-start items-center space-x-2 mt-2 ">
          <Image src={"./authors.svg"} alt="authors" height={24} width={24} />
          {source?.authors && (
            <p
              className={`${playfair.className} text-zinc-950 font-medium text-[16px] truncate`}
            >
              {source.authors.map((author) => author.name).join(", ")}
            </p>
          )}
        </div>

        {/* article details */}
        {
          <div className="flex flex-1 flex-row w-full h-6 justify-start items-center space-x-6 mt-2 ">
            <p className={`text-zinc-950 font-medium`}>
              Cited By: {source.citationCount}
            </p>
          </div>
        }
        {/* abstract/tldr */}
        {source.abstract && <DescriptionTabs source={source} />}
        {!taskPending() ? (
          <div
            className="flex justify-center items-center w-fit-content px-2 self-end gap-x-2 hover:cursor-pointer"
            onClick={() => {
              if (!selectedSuggestion) return;
              handleCreateTask();
            }}
          >
            <p>Find citations</p>
            <Image
              src={"./quick_reference.svg"}
              alt="find citations"
              width={24}
              height={24}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center w-fit-content px-2 self-end gap-x-2 hover:cursor-pointer">
            <p>Finding citations...</p>
            <Image
              src={"./hourglass.svg"}
              alt="finding citations"
              width={24}
              height={24}
              className="animate-spin duration-1000"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferenceContainer;
