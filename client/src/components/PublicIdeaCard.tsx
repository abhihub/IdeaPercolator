import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share } from "lucide-react";
import { cn, formatDate, getMatureLabel } from "@/lib/utils";
import { Idea } from "@shared/schema";
import MarkdownDescription from "./MarkdownDescription";

interface PublicIdeaCardProps {
  idea: Idea;
  username?: string;
}

export default function PublicIdeaCard({ idea, username }: PublicIdeaCardProps) {
  // Determine card styling based on rank
  const cardClass = 
    idea.rank >= 8 ? "idea-card-mature" :
    idea.rank >= 5 ? "idea-card-developing" :
    "idea-card-emerging";

  // Determine maturity bar styling based on rank
  const maturityBarClass = 
    idea.rank >= 8 ? "maturity-mature" :
    idea.rank >= 5 ? "maturity-developing" :
    "maturity-emerging";

  const cardContent = (
    <Card 
      className={cn(
        "bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200",
        cardClass,
        username && "cursor-pointer hover:shadow-md"
      )}
      data-testid={`card-public-idea-${idea.id}`}
    >
      <div className="flex flex-col">
        <div className="p-5 flex-1">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                <Share className="mr-1 h-3 w-3" />
                Published
              </Badge>
            </div>
          </div>
          
          <MarkdownDescription content={idea.description} className="mb-3 line-clamp-3" />
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center">
              <div className="maturity-indicator w-24">
                <div
                  className={cn("maturity-bar", maturityBarClass)}
                  style={{ width: `${idea.rank * 10}%` }}
                ></div>
              </div>
              <span className="ml-2">{getMatureLabel(idea.rank)}</span>
            </div>
            <span className="text-gray-400">{formatDate(idea.dateCreated)}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  if (username) {
    return (
      <Link href={`/public/${username}/${idea.id}`} data-testid={`link-idea-${idea.id}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}