import { topicColours } from "@/lib/topicColours";

export default function TopicChip({ topic }: { topic: string }) {
  return (
    <div
      style={{
        backgroundColor: topicColours[topic] + "8F",
      }}
      className={`flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium text-black`}
    >
      {topic}
    </div>
  );
}
