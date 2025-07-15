"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { XIcon } from "lucide-react";
import { useRef } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";

const askQuestionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()),
  photo: z.instanceof(File).optional(),
});

type AskQuestionType = z.infer<typeof askQuestionSchema>;

export default function AskPage() {
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AskQuestionType>({
    resolver: zodResolver(askQuestionSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      photo: undefined,
    },
  });

  const router = useRouter();
  const { getToken } = useAuth(); // <-- move this here, at the top level

  const onSubmit = useCallback(
    async (values: AskQuestionType) => {
      setLoading(true);
      toast.loading("Creating question...", { id: "create-question" });
      const formData = new FormData();
      let photoUrl = "";
      if (values.photo) {
        formData.append("photo", values.photo);
        const res = await axios.post("http://localhost:3001/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        photoUrl = res.data.url;
      }
      const token = await getToken();
      const ress = await axios.post(
        "http://localhost:3001/question",
        {
          title: values.title,
          description: values.description,
          tags: values.tags,
          photo: photoUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);
      toast.success("Question created", { id: "create-question" });
      router.push(`/questions/${ress.data.question.id}`);
    },
    [getToken, router]
  );

  // Add tag to form
  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean) return;
    if (form.getValues("tags").includes(clean)) return;
    form.setValue("tags", [...form.getValues("tags"), clean]);
    setTagInput("");
  };

  // Remove tag from form
  const removeTag = (tag: string) => {
    form.setValue(
      "tags",
      form.getValues("tags").filter((t) => t !== tag)
    );
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  return (
    <div>
      <SignedIn>
        <div className="border-1 border-muted-foreground/20 rounded-lg p-4 flex gap-10 justify-between items-center mb-6 max-w-4xl mx-auto">
          <Form {...form}>
            <form
              className="space-y-8 w-full"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1 items-center">
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormDescription>Title for your question</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1 items-center">
                      Description
                    </FormLabel>
                    <FormControl>
                      <RichTextEditor {...field} />
                    </FormControl>
                    <FormDescription>
                      Explain your question in detail
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Tags field */}
              <FormField
                control={form.control}
                name="tags"
                render={() => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    {/* Show tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.getValues("tags").map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center bg-muted px-2 py-1 rounded text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            className="ml-1 text-muted-foreground hover:text-destructive"
                            onClick={() => removeTag(tag)}
                            aria-label="Remove tag"
                          >
                            <XIcon className="w-3 h-3 cursor-pointer" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <FormControl>
                      <input
                        ref={tagInputRef}
                        type="text"
                        className="border rounded px-3 py-2 w-full text-sm"
                        placeholder="Add a tag and press Enter or comma"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInput}
                      />
                    </FormControl>
                    <FormDescription>
                      Add tags to help categorize your question
                    </FormDescription>
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
                      Upload a photo to accompany your question
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading}
              >
                {!loading && "Post Question"}
                {loading && <Loader2 className="animate-spin" />}
              </Button>
            </form>
          </Form>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center gap-4 mt-50">
          <Link href="/sign-in">
            <Button variant="default" size="default">
              Sign in
            </Button>
          </Link>
          <div className="text-muted-foreground">
            Please signin to ask a question
          </div>
        </div>
      </SignedOut>
    </div>
  );
}
