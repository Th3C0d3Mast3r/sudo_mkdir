import Answers from "@/components/Answers";
import QuestionCard from "@/components/QuestionCard";
import axios from "axios";
import { Suspense } from "react";

export default async function AnswerPage({
  params,
}: {
  params: { qid: string };
}) {
  const qid = (await params).qid;
  try {
    const res = await axios.get(`http://localhost:3001/answers/${qid}`);

    return (
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <QuestionCard question={res.data.question} />
          <Answers answers={res.data.answers} qid={qid} />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error fetching answers:", error);
    return <div>Error fetching answers</div>;
  }
}
