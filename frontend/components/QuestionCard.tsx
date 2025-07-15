"use client";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowBigDownIcon, ArrowBigUpIcon } from "lucide-react";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

export interface Question {
  _id: string;
  user: {
    email: string;
    username: string;
    photo?: string;
  };
  title: string;
  description: string;
  tags: Tag[];
  photo?: string;
  numberOfAnswer: number;
  upvotes: number;
  downvotes: number;
  createdAt: Date | string;
}

interface Tag {
  _id: string;
  name: string;
}

export default function QuestionCard({ question }: { question: Question }) {
  const createdAt = new Date(question.createdAt);
  // Format date as '15 June 2025'
  const formattedDate = createdAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [questionn, setQuestion] = useState(question);

  const router = useRouter();
  const { getToken } = useAuth();

  return (
    <Card className="border shadow-sm rounded-lg overflow-hidden hover:shadow-md dark:shadow-primary/30 group/card max-w-4xl w-full mx-auto p-0">
      <CardContent className="p-6 flex flex-col gap-4 items-center justify-between">
        <div
          className="flex items-center justify-between w-full cursor-pointer"
          onClick={() => {
            router.push(`/questions/${questionn._id}`);
          }}
        >
          <div className="text-4xl font-semibold">{question.title}</div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div>{formattedDate}</div>
            by
            <div>{questionn.user.username}</div>
            {questionn.user.photo && (
              <Image
                className="rounded-full"
                src={questionn.user.photo}
                alt="User photo"
                width={40}
                height={40}
              />
            )}
          </div>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between w-full">
          <div
            className="px-2 text-muted-foreground prose max-w-2xl overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: questionn.description }}
          />

          <div className="pr-20">
            {questionn.photo && (
              <Image
                className="rounded-lg"
                src={questionn.photo}
                alt="Question photo"
                width={300}
                height={200}
              />
            )}
          </div>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between w-full">
          <div className="p-3 w-full rounded-lg flex flex-wrap h-fit gap-3">
            {questionn.tags.map((tag) => (
              <div
                key={tag._id}
                className="text-sm rounded-md p-2 bg-muted text-muted-foreground"
              >
                {tag.name}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 justify-end">
            <div className="flex justify-end">
              <div className="flex flex-col items-end gap-2  bg-muted/10 border-1 border-muted rounded-lg p-3 w-fit]">
                <span className="text-sm text-muted-foreground flex items-center justify-center">
                  <span>{questionn.numberOfAnswer}</span>
                  <span className="ml-1">
                    Answer{questionn.numberOfAnswer !== 1 ? "s" : ""}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex gap-2 text-muted-foreground items-center">
              <Button variant="default" size="lg">
                Answer
              </Button>
              <div className="flex items-center gap-2 border-1 border-muted rounded-lg p-3 w-fit">
                <ArrowBigUpIcon
                  className="stroke-primary hover:fill-primary/80 cursor-pointer"
                  size={"35px"}
                  onClick={async () => {
                    try {
                      const token = await getToken();
                      const uv = await axios.post(
                        `http://localhost:3001/vote/ques/${questionn._id}`,
                        {
                          vote: "upvote",
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                      setQuestion((prev) => ({
                        ...prev,
                        upvotes: uv.data.upvotes,
                      }));
                    } catch (error) {
                      console.error("Error voting:", error);
                    }
                  }}
                />
                <div className="text-primary-foreground text-xl">
                  {questionn.upvotes - questionn.downvotes}
                </div>
                <ArrowBigDownIcon
                  className="stroke-primary/75 hover:fill-primary/75 cursor-pointer"
                  size={"35px"}
                  onClick={async () => {
                    const token = await getToken();
                    try {
                      const dv = await axios.post(
                        `http://localhost:3001/vote/ques/${questionn._id}`,
                        {
                          vote: "downvote",
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                      setQuestion((prev) => ({
                        ...prev,
                        downvotes: dv.data.downvotes,
                      }));
                    } catch (error) {
                      console.error("Error voting:", error);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
