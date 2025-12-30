import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Share, User } from "lucide-react";
import { cn, formatDate, getMatureLabel } from "@/lib/utils";
import MarkdownDescription from "./MarkdownDescription";

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

interface PublicIdeaCardWithAuthorProps {
  idea: PublicIdeaWithAuthor;
}

export default function PublicIdeaCardWithAuthor({ idea }: PublicIdeaCardWithAuthorProps) {
  const cardClass = 
    idea.rank >= 8 ? "idea-card-mature" :
    idea.rank >= 5 ? "idea-card-developing" :
    "idea-card-emerging";

  const maturityBarClass = 
    idea.rank >= 8 ? "maturity-mature" :
    idea.rank >= 5 ? "maturity-developing" :
    "maturity-emerging";

  return (
    <Link href={`/public/${idea.username}/${idea.id}`} data-testid={`link-idea-${idea.id}`}>
      <Card 
        className={cn(
          "bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md",
          cardClass
        )}
        data-testid={`card-public-idea-${idea.id}`}
      >
        <div className="flex flex-col">
          <div className="p-5 flex-1">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
                <div className="flex items-center gap-2">
                  <span 
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <User className="h-3 w-3" />
                    {idea.username}
                  </span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Share className="mr-1 h-3 w-3" />
                    Published
                  </Badge>
                </div>
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
    </Link>
  );
}