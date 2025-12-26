import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { ChevronUp, ChevronDown, MoreVertical, Share } from "lucide-react";
import { FaTwitter } from "react-icons/fa";
import { cn, formatDate, getMatureLabel } from "@/lib/utils";
import { Idea } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MarkdownDescription from "./MarkdownDescription";

interface IdeaCardProps {
  idea: Idea;
  onEdit: () => void;
  onDelete: () => void;
  onRankChange: (id: number, rank: number) => void;
  onPublish?: (id: number) => void;
  onTwitterPublish?: (id: number) => void;
  isUpdating: boolean;
}

export default function IdeaCard({ idea, onEdit, onDelete, onRankChange, onPublish, onTwitterPublish, isUpdating }: IdeaCardProps) {
  const [isRankUpdating, setIsRankUpdating] = useState(false);
  
  const handleRankChange = async (change: number) => {
    const newRank = idea.rank + change;
    if (newRank >= 1 && newRank <= 10) {
      setIsRankUpdating(true);
      await onRankChange(idea.id, newRank);
      setIsRankUpdating(false);
    }
  };

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

  return (
    <Card className={cn("bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md", cardClass)}>
      <div className="flex flex-col sm:flex-row">
        {/* Ranking Controls */}
        <div className="flex sm:flex-col justify-center items-center p-4 bg-gray-50 order-2 sm:order-1">
          <Button
            variant="ghost"
            size="sm"
            className="rank-control"
            disabled={idea.rank >= 10 || isRankUpdating || isUpdating}
            onClick={() => handleRankChange(1)}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
          
          <div className="mx-4 sm:my-3 sm:mx-0 font-semibold text-lg">
            {isRankUpdating ? (
              <span className="inline-block h-6 w-6 animate-pulse rounded-full bg-gray-200"></span>
            ) : (
              idea.rank
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="rank-control"
            disabled={idea.rank <= 1 || isRankUpdating || isUpdating}
            onClick={() => handleRankChange(-1)}
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-5 flex-1 order-1 sm:order-2">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
              {idea.published && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <Share className="mr-1 h-3 w-3" />
                  Published
                </Badge>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  Edit Idea
                </DropdownMenuItem>
                {onPublish && !idea.published && (
                  <>
                    <DropdownMenuItem onClick={() => onPublish(idea.id)} className="text-blue-600">
                      <Share className="mr-2 h-4 w-4" />
                      Publish Idea
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {onTwitterPublish && (
                  <>
                    <DropdownMenuItem onClick={() => onTwitterPublish(idea.id)} className="text-blue-500">
                      <FaTwitter className="mr-2 h-4 w-4" />
                      Share on Twitter
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  Delete Idea
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <MarkdownDescription content={idea.description} className="mb-3" />
          
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
}
