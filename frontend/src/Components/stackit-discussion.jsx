"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
  Bell,
  User,
  Eye,
  Edit,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Markdown renderer component
const MarkdownPreview = ({ content }) => {
  const renderMarkdown = (text) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/`(.*?)`/g, '<code class="bg-[#19376D] px-2 py-1 rounded text-[#A5D7E8]">$1</code>')
      .replace(/\[([^\]]+)\]$$([^)]+)$$/g, '<a href="$2" class="text-[#A5D7E8] underline hover:text-white">$1</a>')
      .replace(
        /^> (.+)$/gm,
        '<blockquote class="border-l-4 border-[#A5D7E8] pl-4 italic text-gray-300">$1</blockquote>',
      )
      .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n/g, "<br>")

    return html
  }

  return (
    <div
      className="prose prose-invert max-w-none text-[#A5D7E8]/90"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      style={{ fontFamily: "Noto Sans, sans-serif" }}
    />
  )
}

export default function StackItDiscussion({ questionId }) {
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [newAnswer, setNewAnswer] = useState("")
  const [answerMode, setAnswerMode] = useState("edit")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const textareaRef = useRef(null)

  // Fetch question and answers data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch question details
        const questionResponse = await fetch(`/api/questions/${questionId}`)
        if (questionResponse.ok) {
          const questionData = await questionResponse.json()
          setQuestion(questionData)
        }

        // Fetch answers
        const answersResponse = await fetch(`/api/questions/${questionId}/answers`)
        if (answersResponse.ok) {
          const answersData = await answersResponse.json()
          setAnswers(answersData)
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load discussion data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [questionId])

  // Markdown formatting functions
  const insertMarkdown = (before, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = newAnswer.substring(start, end)
    const newText = newAnswer.substring(0, start) + before + selectedText + after + newAnswer.substring(end)

    setNewAnswer(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const formatBold = () => insertMarkdown("**", "**")
  const formatItalic = () => insertMarkdown("*", "*")
  const formatStrikethrough = () => insertMarkdown("~~", "~~")
  const formatCode = () => insertMarkdown("`", "`")
  const formatQuote = () => insertMarkdown("> ")
  const formatUnorderedList = () => insertMarkdown("- ")
  const formatOrderedList = () => insertMarkdown("1. ")
  const formatLink = () => insertMarkdown("[", "](url)")

  // Submit new answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault()

    if (!newAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please write an answer before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newAnswer,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit answer")
      }

      const newAnswerData = await response.json()
      setAnswers([...answers, newAnswerData])
      setNewAnswer("")
      setAnswerMode("edit")

      toast({
        title: "Success!",
        description: "Your answer has been submitted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your answer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle vote on answer
  const handleVote = async (answerId, voteType) => {
    try {
      const response = await fetch(`/api/answers/${answerId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
      })

      if (response.ok) {
        const updatedAnswer = await response.json()
        setAnswers(answers.map((answer) => (answer.id === answerId ? updatedAnswer : answer)))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote on answer",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#091D39] text-white flex items-center justify-center">
        <div className="text-[#A5D7E8]" style={{ fontFamily: "Noto Sans, sans-serif" }}>
          Loading discussion...
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-[#091D39] text-white flex items-center justify-center">
        <div className="text-[#A5D7E8]" style={{ fontFamily: "Noto Sans, sans-serif" }}>
          Question not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#091D39] text-white">
      {/* Header */}
      <header className="bg-[#19376D] px-6 py-4 flex items-center justify-between border-b border-[#A5D7E8]/20">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "Bowlby One, cursive" }}>
          StackIt
        </h1>
        <div className="flex items-center gap-4">
          <Bell className="w-6 h-6 text-[#A5D7E8] hover:text-white cursor-pointer transition-colors" />
          <div className="w-10 h-10 bg-gradient-to-r from-[#A5D7E8] to-[#19376D] rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-[#091D39]" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Question Section */}
        <div className="space-y-6">
          {/* Question Title and Tags */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "Bowlby One, cursive" }}>
              {question.title}
            </h2>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <Badge
                  key={tag}
                  className="bg-[#A5D7E8] text-[#091D39] hover:bg-[#A5D7E8]/80"
                  style={{ fontFamily: "Noto Sans, sans-serif" }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Question Description */}
          <Card className="bg-[#19376D] border-[#A5D7E8]/30">
            <CardContent className="p-6">
              <MarkdownPreview content={question.description} />

              {/* Question Author Info */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#A5D7E8]/20">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={question.userAvatar || "/placeholder.svg"} alt={question.userName} />
                  <AvatarFallback className="bg-[#A5D7E8] text-[#091D39]">
                    {question.userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[#A5D7E8] font-medium" style={{ fontFamily: "Noto Sans, sans-serif" }}>
                    {question.userName}
                  </p>
                  <p className="text-[#A5D7E8]/70 text-sm" style={{ fontFamily: "Noto Sans, sans-serif" }}>
                    {new Date(question.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Answers Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "Bowlby One, cursive" }}>
            Answers
          </h2>

          {/* Existing Answers */}
          <div className="space-y-6">
            {answers.map((answer) => (
              <Card key={answer.id} className="bg-[#19376D] border-[#A5D7E8]/30">
                <CardContent className="p-6">
                  {/* Answer Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={answer.userAvatar || "/placeholder.svg"} alt={answer.userName} />
                      <AvatarFallback className="bg-[#A5D7E8] text-[#091D39]">
                        {answer.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-[#A5D7E8] font-medium" style={{ fontFamily: "Noto Sans, sans-serif" }}>
                        {answer.userName}
                      </p>
                      <p className="text-[#A5D7E8]/70 text-sm" style={{ fontFamily: "Noto Sans, sans-serif" }}>
                        {new Date(answer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Answer Content */}
                  <MarkdownPreview content={answer.content} />

                  {/* Answer Actions */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#A5D7E8]/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(answer.id, "like")}
                      className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {answer.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(answer.id, "dislike")}
                      className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {answer.dislikes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                  </div>

                  {/* Replies */}
                  {answer.replies.length > 0 && (
                    <div className="ml-8 mt-4 space-y-3 border-l-2 border-[#A5D7E8]/30 pl-4">
                      {answer.replies.map((reply) => (
                        <div key={reply.id} className="bg-[#091D39] p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={reply.userAvatar || "/placeholder.svg"} alt={reply.userName} />
                              <AvatarFallback className="bg-[#A5D7E8] text-[#091D39] text-xs">
                                {reply.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <p
                              className="text-[#A5D7E8] text-sm font-medium"
                              style={{ fontFamily: "Noto Sans, sans-serif" }}
                            >
                              {reply.userName}
                            </p>
                            <p className="text-[#A5D7E8]/70 text-xs" style={{ fontFamily: "Noto Sans, sans-serif" }}>
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <MarkdownPreview content={reply.content} />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Answer */}
          <Card className="bg-[#19376D] border-[#A5D7E8]/30">
            <CardContent className="p-6">
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <Tabs value={answerMode} onValueChange={(value) => setAnswerMode(value)}>
                  <TabsList className="bg-[#091D39] border border-[#A5D7E8]/30">
                    <TabsTrigger
                      value="edit"
                      className="data-[state=active]:bg-[#A5D7E8] data-[state=active]:text-[#091D39] text-[#A5D7E8]"
                      style={{ fontFamily: "Noto Sans, sans-serif" }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Write Answer
                    </TabsTrigger>
                    <TabsTrigger
                      value="preview"
                      className="data-[state=active]:bg-[#A5D7E8] data-[state=active]:text-[#091D39] text-[#A5D7E8]"
                      style={{ fontFamily: "Noto Sans, sans-serif" }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="space-y-0">
                    {/* Markdown Toolbar */}
                    <div className="bg-[#091D39] p-3 rounded-t-lg border border-[#A5D7E8]/30 border-b-0 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={formatBold}
                        className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={formatItalic}
                        className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={formatStrikethrough}
                        className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={formatUnorderedList}
                        className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={formatOrderedList}
                        className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={formatLink}
                        className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                        title="Link"
                      >
                        <Link className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={formatCode}
                        className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                        title="Code"
                      >
                        <Code className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={formatQuote}
                        className="text-[#A5D7E8] hover:bg-[#A5D7E8] hover:text-[#091D39] transition-colors"
                        title="Quote"
                      >
                        <Quote className="w-4 h-4" />
                      </Button>
                    </div>

                    <Textarea
                      ref={textareaRef}
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="bg-[#091D39] border-[#A5D7E8]/30 text-white min-h-[150px] rounded-t-none border-t-0 focus:border-[#A5D7E8] focus:ring-[#A5D7E8] resize-none placeholder:text-[#A5D7E8]/60"
                      placeholder="Start a conversation..."
                      style={{ fontFamily: "Noto Sans, sans-serif" }}
                      required
                    />
                  </TabsContent>

                  <TabsContent value="preview">
                    <div className="min-h-[150px] p-4 bg-[#091D39] border border-[#A5D7E8]/30 rounded-lg">
                      <MarkdownPreview
                        content={newAnswer || "Nothing to preview yet. Switch to Write Answer mode to add content."}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#A5D7E8] hover:bg-[#A5D7E8]/90 text-[#091D39] font-bold px-6 py-2 transition-colors"
                    style={{ fontFamily: "Bowlby One, cursive" }}
                  >
                    {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}