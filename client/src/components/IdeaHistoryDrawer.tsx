import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, getMatureLabel } from "@/lib/utils";
import MarkdownDescription from "./MarkdownDescription";
import type { IdeaVersion } from "@shared/schema";

interface IdeaHistoryDrawerProps {
  ideaId: number;
  ideaTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IdeaHistoryDrawer({ ideaId, ideaTitle, open, onOpenChange }: IdeaHistoryDrawerProps) {
  const { data: versions, isLoading, error } = useQuery<IdeaVersion[]>({
    queryKey: [`/api/ideas/${ideaId}/versions`],
    enabled: open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg" data-testid="drawer-idea-history">
        <SheetHeader>
          <SheetTitle className="text-left">Version History</SheetTitle>
          <p className="text-sm text-gray-500 text-left">See how "{ideaTitle}" has evolved over time</p>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-20 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : versions && versions.length > 0 ? (
            <div className="space-y-6">
              {versions.map((version, index) => (
                <div key={version.id} data-testid={`version-item-${version.versionNumber}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      Version {version.versionNumber}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDate(version.createdAt)}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-2">{version.title}</h4>
                    <MarkdownDescription content={version.description} className="text-sm" />
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <span>Maturity: {version.rank}/10 - {getMatureLabel(version.rank)}</span>
                    </div>
                  </div>
                  
                  {index < versions.length - 1 && (
                    <div className="flex items-center justify-center my-4">
                      <div className="flex-1 border-t border-dashed border-gray-200"></div>
                      <span className="px-3 text-xs text-gray-400">earlier version</span>
                      <div className="flex-1 border-t border-dashed border-gray-200"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No version history yet</p>
              <p className="text-gray-400 text-xs mt-1">
                History will appear after you update this idea
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
