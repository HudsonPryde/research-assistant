import { useState } from "react";
import References from "./reference/Refrences";
import Citations from "./citations/Citations";

export default function TopTabs() {
  const [tab, setTab] = useState(0);
  return (
    <div className="flex flex-1 flex-col items-center max-w-xl">
      <div className="flex flex-row justify-center space-x-6 mt-8 p-1 transition-all max-w-xl w-full">
        <div
          className={`${
            tab === 0
              ? "text-blue-400 underline underline-offset-8"
              : "text-zinc-400 hover:text-zinc-600"
          } h-6 justify-center items-center hover:cursor-pointer px-2 transition-all`}
          onClick={() => setTab(0)}
        >
          <p className={`font-medium text-[16px]`}>Articles</p>
        </div>

        <div
          className={`${
            tab === 1
              ? "text-blue-400 underline underline-offset-8"
              : "text-zinc-400 hover:text-zinc-600"
          } h-6 rounded-full justify-center items-center hover:cursor-pointer px-2 transition-all`}
          onClick={() => setTab(1)}
        >
          <p className={`font-medium text-[16px]`}>Citations</p>
        </div>
      </div>
      {tab === 0 ? <References /> : <Citations />}
    </div>
  );
}
