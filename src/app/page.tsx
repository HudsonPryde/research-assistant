"use client";
import TextEditor from "@/components/text-editor/TextEditor";
import References from "@/components/reference/Refrences";
import Citations from "@/components/citations/Citations";
import store from "@/redux/store";
import { Provider } from "react-redux";
import SuggestionTooltip from "@/components/text-editor/SuggestionTooltip";
import TopTabs from "@/components/TopTabs";

export default function Home() {
  return (
    <Provider store={store}>
      <main
        className="flex h-screen flex-row justify-center bg-[#EFEEF6] overflow-hidden"
        // style={{
        //   backgroundImage: "url(./bg-dots.png)",
        // }}
      >
        <TopTabs />
        <div className="flex flex-1 h-full flex-col p-12 overflow-y-scroll">
          <TextEditor />
          <SuggestionTooltip />
        </div>
      </main>
    </Provider>
  );
}
