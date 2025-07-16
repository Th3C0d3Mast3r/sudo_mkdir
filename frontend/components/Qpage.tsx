"use client";
import { useEffect, useState } from "react";
import QuestionCard, { Question } from "./QuestionCard";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { XIcon } from "lucide-react";
import SearchBar from "./SearchBar";
import axios from "axios";
import { LoaderOne } from "./ui/loader";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BACKEND_URL } from "@/config";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Qpage({ questions }: { questions: Question[] }) {
  const [filteredQuestions, setFilteredQuestions] = useState(questions);
  const [filters, setFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const getSearchResults = async (query: string) => {
    const res = await axios.get(`${BACKEND_URL}/questions/${query}`);
    const questions: Question[] = res.data.questions ?? [];
    return questions;
  };

  const fetchQuestions = async (page: number) => {
    setLoading(true);
    const res = await axios.get(
      `${BACKEND_URL}/questions?page=${page}&limit=${limit}`
    );
    setFilteredQuestions(res.data.questions);
    setTotalPages(Math.max(1, Math.ceil((res.data.total || 0) / limit)));
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    getSearchResults(debouncedSearch).then((questions) => {
      setFilteredQuestions(questions);
      setLoading(false);
    });
  }, [debouncedSearch]);

  useEffect(() => {
    fetchQuestions(page);
  }, [page]);

  const handleFiltering = (filter: string) => {
    if (filter === "Newest") {
      filteredQuestions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (filter === "Unanswered") {
      filteredQuestions.sort((a, b) => b.numberOfAnswer - a.numberOfAnswer);
    } else if (filter === "Most Upvoted") {
      filteredQuestions.sort(
        (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
      );
    } else if (filter === "Oldest") {
      filteredQuestions.sort(
        (b, a) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  };

  // Pagination numbers logic
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div>
      <div className="border-1 border-muted-foreground/20 rounded-lg p-4 flex gap-10 justify-between items-center mb-6 max-w-6xl mx-auto">
        <Link href="/questions/ask">
          <Button variant="default" size="lg">
            Ask New Question
          </Button>
        </Link>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex justify-end gap-2">
          <div className="flex flex-wrap gap-2 items-center w-[fit]">
            {filters.map((filter) => (
              <div
                key={filter}
                className="flex w-fit gap-1 items-center border border-muted-foreground/20 rounded-lg p-2 text-sm"
              >
                <div>{filter}</div>
                <XIcon
                  className="stroke-muted-foreground cursor-pointer"
                  onClick={() =>
                    setFilters(filters.filter((f) => f !== filter))
                  }
                />
              </div>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} size={"lg"}>
                Add Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setFilters((p) =>
                    p.includes("Newest") ? [...p] : [...p, "Newest"]
                  );
                  handleFiltering("Newest");
                }}
              >
                Newest
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setFilters((p) =>
                    p.includes("Oldest") ? [...p] : [...p, "Oldest"]
                  );
                  handleFiltering("Oldest");
                }}
              >
                Oldest
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setFilters((p) =>
                    p.includes("Unanswered") ? [...p] : [...p, "Unanswered"]
                  );
                  handleFiltering("Unanswered");
                }}
              >
                Unanswered
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setFilters((p) =>
                    p.includes("Most Upvoted") ? [...p] : [...p, "Most Upvoted"]
                  );
                  handleFiltering("Most Upvoted");
                }}
              >
                Most Upvoted
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {loading && (
        <div className="flex justify-center items-center text-muted-foreground mt-50">
          <LoaderOne />
        </div>
      )}
      {!loading && filteredQuestions.length === 0 && (
        <div className="flex flex-col justify-center items-center text-muted-foreground mt-50">
          <p>No questions found</p>
          <p>Try changing the filters</p>
        </div>
      )}
      {!loading && filteredQuestions.length != 0 && (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question._id} question={question} />
          ))}
        </div>
      )}
      <Pagination className="my-8">
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
          {getPageNumbers().map((num, idx) =>
            num === "..." ? (
              <PaginationItem key={idx}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={num}>
                <PaginationLink
                  href="#"
                  isActive={page === num}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(num as number);
                  }}
                >
                  {num}
                </PaginationLink>
              </PaginationItem>
            )
          )}
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
    </div>
  );
}
