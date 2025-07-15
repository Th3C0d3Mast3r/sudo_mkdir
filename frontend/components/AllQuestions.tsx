import axios from "axios";
import { Question } from "./QuestionCard";
import { CircleQuestionMarkIcon } from "lucide-react";
import Qpage from "./Qpage";
import { BACKEND_URL } from "@/config";

const AllQuestions = async () => {
  //await waitfFor(5000);
  try {
    const res = await axios.get(`${BACKEND_URL}/questions`);
    const questions: Question[] = res.data.questions;
    if (questions.length === 0) {
      return (
        <div className="flex flex-col gap-4 h-full items-center justify-center">
          <div className="rounded-full bg-accent w-20 h-20 flex items-center justify-center">
            <CircleQuestionMarkIcon size={40} className="stroke-primary" />
          </div>
          <div className="flex flex-col gap-1 text-center">
            <p className="font-bold">No questions found</p>
            <p className="text-sm text-muted-foreground">
              You can ask a question by clicking the button below
            </p>
          </div>
          {/* <CreateWorkflowDialog triggerText="Create your first workflow" /> */}
        </div>
      );
    }

    return <Qpage questions={questions} />;
  } catch (error) {
    console.error("Error fetching questions:", error);
    return <div>Error fetching questions</div>;
  }
};

const waitfFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default AllQuestions;
