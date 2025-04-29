import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import IdeaForm from "@/components/IdeaForm";
import IdeaCard from "@/components/IdeaCard";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { useIdeas } from "@/hooks/useIdeas";
import { Idea } from "@shared/schema";

export default function Home() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const { 
    ideas, 
    createIdea, 
    updateIdea, 
    deleteIdea, 
    updateIdeaRank, 
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    sort,
    currentSort,
    sortOptions
  } = useIdeas();

  const handleOpenEditForm = (idea: Idea) => {
    setEditingIdea(idea);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingIdea(null);
  };

  const handleDeleteConfirm = (id: number) => {
    setIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteIdea = async () => {
    if (idToDelete) {
      await deleteIdea(idToDelete);
      setDeleteDialogOpen(false);
      setIdToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight mb-2 sm:mb-0">
            Thought Percolator
          </h1>
          <div className="flex space-x-2">
            <Button 
              onClick={() => {
                setEditingIdea(null);
                setShowAddForm(true);
              }}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Add New Idea
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  Sort
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => (
                  <DropdownMenuItem 
                    key={option.value}
                    onClick={() => sort(option.value)}
                    className={currentSort === option.value ? "bg-accent" : ""}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-gray-600 text-sm sm:text-base">
          Collect, mature, and rank your ideas as they develop over time
        </p>
      </header>

      {/* Add/Edit Idea Form */}
      {showAddForm && (
        <IdeaForm 
          idea={editingIdea} 
          onSubmit={editingIdea ? updateIdea : createIdea}
          onCancel={handleCloseForm}
          isSubmitting={isCreating || isUpdating}
        />
      )}

      {/* Ideas List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No ideas yet</h3>
            <p className="text-gray-500">Start by adding your first idea</p>
          </div>
        ) : (
          ideas.map((idea) => (
            <IdeaCard 
              key={idea.id} 
              idea={idea}
              onEdit={() => handleOpenEditForm(idea)}
              onDelete={() => handleDeleteConfirm(idea.id)}
              onRankChange={updateIdeaRank}
              isUpdating={isUpdating}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteIdea}
        isDeleting={isDeleting}
      />
    </div>
  );
}
