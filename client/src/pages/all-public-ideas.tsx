import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PublicIdeaCardWithAuthor from "@/components/PublicIdeaCardWithAuthor";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Extended idea type with username
interface PublicIdeaWithAuthor {
  id: number;
  title: string;
  description: string;
  rank: number;
  dateCreated: string;
  dateModified: string;
  userId: number;
  published: boolean;
  username: string;
}

export default function AllPublicIdeas() {
  const [sortBy, setSortBy] = useState<"recent" | "rank">("recent");

  // Fetch all public ideas
  const {
    data: ideas = [],
    isLoading,
    error,
  } = useQuery<PublicIdeaWithAuthor[]>({
    queryKey: ["/api/public"],
    retry: false,
  });

  // Group ideas by username
  const ideasByUser = ideas.reduce((acc, idea) => {
    if (!acc[idea.username]) {
      acc[idea.username] = [];
    }
    acc[idea.username].push(idea);
    return acc;
  }, {} as Record<string, PublicIdeaWithAuthor[]>);

  // Sort ideas within each user group
  Object.keys(ideasByUser).forEach(username => {
    ideasByUser[username].sort((a, b) => {
      if (sortBy === "rank") {
        return b.rank - a.rank;
      } else {
        // "recent" - sort by most recently modified
        return new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime();
      }
    });
  });

  // Sort the usernames based on the highest ranked or most recent idea from each user
  const sortedUsernames = Object.keys(ideasByUser).sort((a, b) => {
    const aIdeas = ideasByUser[a];
    const bIdeas = ideasByUser[b];
    
    if (sortBy === "rank") {
      // Sort by highest ranked idea from each user
      const maxRankA = Math.max(...aIdeas.map(idea => idea.rank));
      const maxRankB = Math.max(...bIdeas.map(idea => idea.rank));
      return maxRankB - maxRankA;
    } else {
      // Sort by most recent idea from each user
      const latestA = Math.max(...aIdeas.map(idea => new Date(idea.dateModified).getTime()));
      const latestB = Math.max(...bIdeas.map(idea => new Date(idea.dateModified).getTime()));
      return latestB - latestA;
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
        <h2 className="text-2xl font-bold mb-4">Error Loading Ideas</h2>
        <p className="text-muted-foreground mb-6">
          There was a problem loading the public ideas. Please try again later.
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
          <p className="text-muted-foreground">Discover published ideas from all users</p>
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

      {sortedUsernames.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No published ideas yet</h2>
          <p className="text-muted-foreground mb-4">
            Be the first to publish your ideas for others to see!
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedUsernames.map(username => (
            <div key={username} className="border rounded-lg p-6 bg-card shadow-sm">
              <div className="flex items-center mb-4">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{username}</h2>
                  <Link href={`/public/${username}`} className="text-sm text-primary hover:underline">
                    View all ideas from {username}
                  </Link>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ideasByUser[username].map(idea => (
                  <PublicIdeaCardWithAuthor 
                    key={idea.id} 
                    idea={idea} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}