import { useAppSelector } from "@/redux/hooks";
import { selectSupport } from "@/redux/slice";
import { useCallback } from "react";

export default function Citations() {
  const support = useAppSelector(selectSupport);

  const supportCards = useCallback(
    () =>
      support.map((sup, index) => {
        return (
          <div
            className="p-6 bg-white shadow-lg rounded-lg text-lg"
            key={index}
          >
            <p className="">{sup.response}</p>
          </div>
        );
      }),
    [support]
  );

  return (
    <div
      style={{ scrollbarGutter: "stable", scrollbarWidth: "thin" }}
      className="p-6 flex flex-col gap-y-4 h-svh max-w-2xl transition-all overflow-hidden duration-300 ease-in-out items-center hover:overflow-y-scroll"
    >
      {supportCards()}
    </div>
  );
}
