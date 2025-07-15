import { Input } from "./ui/input";
import { SearchIcon, XIcon } from "lucide-react";

export default function SearchBar({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  return (
    <div className="relative w-full max-w-xs flex items-center">
      <Input
        type="text"
        placeholder="Search questions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pr-10 pl-4 py-6 rounded-lg bg-muted/10 border-none focus:ring-2 focus:ring-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500 text-base"
        aria-label="Search questions"
      />
      {searchQuery ? (
        <button
          className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          type="button"
        >
          <XIcon className="w-5 h-5" />
        </button>
      ) : null}
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <SearchIcon className="w-5 h-5" />
      </span>
    </div>
  );
}
