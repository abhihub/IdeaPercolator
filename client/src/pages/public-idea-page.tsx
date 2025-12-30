import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share, Home, ArrowLeft, Loader2, Calendar, TrendingUp, History, ChevronRight } from "lucide-react";
import { cn, formatDate, getMatureLabel } from "@/lib/utils";
import MarkdownDescription from "@/components/MarkdownDescription";
import { Idea, IdeaVersion } from "@shared/schema";

interface PublicIdeaWithUsername extends Idea {
  username: string;
}

function VersionTimeline({ versions, currentRank }: { versions: IdeaVersion[]; currentRank: number }) {
  if (!versions || versions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-2 mb-4 text-gray-600">
        <History className="h-4 w-4" />
        <h3 className="text-sm font-medium">Evolution Timeline</h3>
      </div>
      
      <div className="space-y-3">
        {/* Current version indicator */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-green-200"></div>
            <div className="w-0.5 h-full bg-gray-200 min-h-[20px]"></div>
          </div>
          <div className="flex-1 pb-2">
            <p className="text-xs font-medium text-green-700">Current</p>
            <p className="text-xs text-gray-500">Rank {currentRank}/10</p>
          </div>
        </div>
        
        {/* Previous versions */}
        {versions.slice(0, 5).map((version, index) => (
          <div key={version.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              {index < Math.min(versions.length - 1, 4) && (
                <div className="w-0.5 h-full bg-gray-200 min-h-[20px]"></div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <p className="text-xs text-gray-600 line-clamp-1" title={version.title}>
                v{version.versionNumber}: {version.title}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(version.createdAt)} · Rank {version.rank}
              </p>
            </div>
          </div>
        ))}
        
        {versions.length > 5 && (
          <p className="text-xs text-gray-400 pl-5">
            +{versions.length - 5} more version{versions.length - 5 > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PublicIdeaPage() {
  const { username, ideaId } = useParams<{ username: string; ideaId: string }>();

  const { data: idea, isLoading, error } = useQuery<PublicIdeaWithUsername>({
    queryKey: [`/api/public/${username}/${ideaId}`],
    retry: false,
  });

  const { data: versions = [] } = useQuery<IdeaVersion[]>({
    queryKey: [`/api/public/${username}/${ideaId}/versions`],
    enabled: !!idea,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="container mx-auto p-6 text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Idea Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This idea doesn't exist, hasn't been published, or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href={`/public/${username}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to {username}'s Ideas
            </Button>
          </Link>
          <Link href="/public">
            <Button className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              All Public Ideas
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const cardClass = 
    idea.rank >= 8 ? "idea-card-mature" :
    idea.rank >= 5 ? "idea-card-developing" :
    "idea-card-emerging";

  const maturityBarClass = 
    idea.rank >= 8 ? "maturity-mature" :
    idea.rank >= 5 ? "maturity-developing" :
    "maturity-emerging";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">Thought Percolator</h1>
            <p className="text-muted-foreground">Idea by {username}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/public/${username}`}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                All Ideas
              </Button>
            </Link>
            <Link href="/public">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-6">
          {/* Main content */}
          <Card className={cn("bg-white rounded-lg shadow-md overflow-hidden", cardClass)} data-testid="card-public-idea">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{idea.title}</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <Share className="mr-1 h-3 w-3" />
                  Published
                </Badge>
              </div>
              
              <div className="prose prose-lg max-w-none mb-6">
                <MarkdownDescription content={idea.description} />
              </div>
              
              <div className="border-t pt-6 mt-6">
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Maturity: <strong>{idea.rank}/10</strong> - {getMatureLabel(idea.rank)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDate(idea.dateCreated)}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="maturity-indicator w-full h-3 rounded-full bg-gray-100">
                    <div
                      className={cn("maturity-bar h-3 rounded-full", maturityBarClass)}
                      style={{ width: `${idea.rank * 10}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Sidebar with version history */}
          <div className="space-y-4">
            <VersionTimeline versions={versions} currentRank={idea.rank} />
            
            <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
              <p className="text-xs text-muted-foreground mb-3">
                Want to share your own ideas?
              </p>
              <Link href="/auth">
                <Button size="sm" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
