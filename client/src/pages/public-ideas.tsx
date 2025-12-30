import { useParams, Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PublicIdeaCard from "@/components/PublicIdeaCard";
import { Idea } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Home, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PublicIdeas() {
  const { username } = useParams<{ username: string }>();
  const [sortBy, setSortBy] = useState<"recent" | "rank">("rank");

  // Fetch public ideas for this user
  const {
    data: ideas = [],
    isLoading,
    error,
  } = useQuery<Idea[]>({
    queryKey: [`/api/public/${username}`],
    retry: false,
  });

  // Sort ideas based on current sort option
  const sortedIdeas = [...ideas].sort((a, b) => {
    if (sortBy === "rank") {
      return b.rank - a.rank;
    } else {
      // "recent" - sort by most recently modified
      return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center py-12">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The user "{username}" doesn't exist or hasn't published any ideas.
        </p>
        <Link href="/">
          <Button className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Thought Percolator</h1>
          <p className="text-muted-foreground">Public ideas from {username}</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
      </header>

      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortBy("rank")}
            className={cn(
              "px-3 py-1 rounded text-sm font-medium",
              sortBy === "rank"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            )}
          >
            Highest Ranked
          </button>
          <button
            onClick={() => setSortBy("recent")}
            className={cn(
              "px-3 py-1 rounded text-sm font-medium",
              sortBy === "recent"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            )}
          >
            Most Recent
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedIdeas.map((idea) => (
          <PublicIdeaCard
            key={idea.id}
            idea={idea}
            username={username}
          />
        ))}
      </div>

      {sortedIdeas.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No published ideas</h2>
          <p className="text-muted-foreground mb-4">
            {username} hasn't published any ideas yet
          </p>
        </div>
      )}
    </div>
  );
}