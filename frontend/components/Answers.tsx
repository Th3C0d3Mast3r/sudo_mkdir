"use client";

import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { ArrowBigDownIcon, ArrowBigUpIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { FileUpload } from "./ui/file-upload";
import RichTextEditor from "./RichTextEditor";
import { useAuth, SignedIn, SignedOut } from "@clerk/nextjs";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { BACKEND_URL } from "@/config";

interface Answer {
  _id: string;
  answer: string;
  photo?: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date | string;
  user: {
    email: string;
    username: string;
    photo?: string;
  };
}

const answerSchema = z.object({
  description: z.string().min(1),
  photo: z.instanceof(File).optional(),
});
type AnswerType = z.infer<typeof answerSchema>;

export default function Answers({
  answers,
  qid,
}: {
  answers: Answer[];
  qid: string;
}) {
  const [loading, setLoading] = useState(false);
  const form = useForm<AnswerType>({
    resolver: zodResolver(answerSchema),
    defaultValues: { description: "", photo: undefined },
  });
  const { getToken } = useAuth();
  const [answern, setAnswer] = useState(answers);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(answern.length / pageSize));
  const paginatedAnswers = answern.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const onSubmit = async (values: AnswerType) => {
    setLoading(true);
    let photoUrl = "";
    if (values.photo) {
      const formData = new FormData();
      formData.append("photo", values.photo);
      const res = await axios.post(`${BACKEND_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      photoUrl = res.data.url;
    }
    const token = await getToken();
    const ans = await axios.post(
      `${BACKEND_URL}/answer/${qid}`,
      {
        answer: values.description,
        photo: photoUrl,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setLoading(false);
    form.reset();
    console.log(ans.data.answer);
    console.log(answern);
    setAnswer((prev) => [ans.data.answer, ...prev]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-4xl flex justify-center items-center p-3 border w-full mx-auto border-muted-foreground/20 rounded-lg m-5 bg-muted/50">
        Answers
      </div>
      <div className="grid grid-cols-1 gap-4">
        {paginatedAnswers.map((answer) => (
          <AnswerCard key={answer._id} answer={answer} />
        ))}
      </div>
      <Pagination className="my-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.max(1, p - 1));
              }}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <PaginationItem key={num}>
              <PaginationLink
                href="#"
                isActive={page === num}
                onClick={(e) => {
                  e.preventDefault();
                  setPage(num);
                }}
              >
                {num}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.min(totalPages, p + 1));
              }}
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="max-w-4xl w-full mx-auto mt-8 border rounded-lg p-6 bg-background">
        <SignedIn>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor {...field} />
                    </FormControl>
                    <FormDescription>Write your answer here</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUpload
                        onChange={(files) => {
                          field.onChange(files[0] ?? undefined);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a photo to accompany your answer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Post Answer"}
              </Button>
            </form>
          </Form>
        </SignedIn>
        <SignedOut>
          <div className="flex flex-col items-center justify-center gap-4">
            <Link href="/sign-in">
              <Button variant="default" size="default">
                Sign in to answer
              </Button>
            </Link>
            <div className="text-muted-foreground">
              Please sign in to post an answer
            </div>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}

const AnswerCard = ({ answer }: { answer: Answer }) => {
  const createdAt = new Date(answer.createdAt);
  const { getToken } = useAuth();
  const [answern, setAnswer] = useState(answer);
  // Format date as '15 June 2025'
  const formattedDate = createdAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <Card className="border shadow-sm rounded-lg overflow-hidden hover:shadow-md dark:shadow-primary/30 group/card max-w-4xl w-full mx-auto p-0">
      <CardContent className="p-6 flex flex-col gap-4 items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <div
            className="px-2 text-muted-foreground prose max-w-2xl overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: answern.answer }}
          />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div>{formattedDate}</div>
            by
            <div>{answern.user.username}</div>
            {answern.user.photo && (
              <Image
                className="rounded-full"
                src={answern.user.photo}
                alt="User photo"
                width={40}
                height={40}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between w-full">
          <div className="pl-20">
            {answern.photo && (
              <Image
                className="rounded-lg"
                src={answern.photo}
                alt="Question photo"
                width={125}
                height={125}
              />
            )}
          </div>
          <div className="flex items-center gap-2 border-1 border-muted rounded-lg p-2 w-fit">
            <ArrowBigUpIcon
              className="stroke-primary hover:fill-primary/80 cursor-pointer"
              size={"30px"}
              onClick={async () => {
                try {
                  const token = await getToken();
                  const uv = await axios.post(
                    `${BACKEND_URL}/vote/ans/${answern._id}`,
                    {
                      vote: "upvote",
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  setAnswer((prev) => ({
                    ...prev,
                    upvotes: uv.data.upvotes,
                  }));
                } catch (error) {
                  console.error("Error voting:", error);
                }
              }}
            />
            <div className="text-primary-foreground text-lg">
              {answern.upvotes - answern.downvotes}
            </div>
            <ArrowBigDownIcon
              className="stroke-primary/75 hover:fill-primary/75 cursor-pointer"
              size={"30px"}
              onClick={async () => {
                try {
                  const token = await getToken();
                  const dv = await axios.post(
                    `${BACKEND_URL}/vote/ans/${answern._id}`,
                    {
                      vote: "downvote",
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );
                  setAnswer((prev) => ({
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
      </CardContent>
    </Card>
  );
};
