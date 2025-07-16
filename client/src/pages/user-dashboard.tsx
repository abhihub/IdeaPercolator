import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIdeas } from "@/hooks/useIdeas";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import IdeaForm from "@/components/IdeaForm";
import IdeaCard from "@/components/IdeaCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortOptionType } from "@/hooks/useIdeas";
import { Idea } from "@shared/schema";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, LogOut, ExternalLink, Share } from "lucide-react";

export default function UserDashboard() {
  const { username } = useParams<{ username: string }>();
  const [_, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Redirect if the URL username doesn't match the logged-in user
  useEffect(() => {
    if (user && user.username !== username) {
      navigate(`/${user.username}`);
    }
  }, [user, username, navigate]);
  
  const { ideas, isLoading, sortOptions, createIdea, updateIdea, deleteIdea, updateIdeaRank, publishIdea, publishToTwitter, sort, isPublishing, isPublishingToTwitter } = useIdeas();
  
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingIdeaId, setDeletingIdeaId] = useState<number | null>(null);
  
  const handleOpenNewForm = () => {
    setEditingIdea(null);
    setShowForm(true);
  };
  
  const handleOpenEditForm = (idea: Idea) => {
    setEditingIdea(idea);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIdea(null);
  };
  
  const handleCreateOrUpdateIdea = async (formData: any) => {
    if (editingIdea) {
      await updateIdea({...formData, id: editingIdea.id});
    } else {
      await createIdea(formData);
    }
    handleCloseForm();
  };
  
  const handleOpenDeleteConfirm = (id: number) => {
    setDeletingIdeaId(id);
  };
  
  const handleCloseDeleteConfirm = () => {
    setDeletingIdeaId(null);
  };
  
  const handleConfirmDelete = async () => {
    if (deletingIdeaId !== null) {
      await deleteIdea(deletingIdeaId);
      setDeletingIdeaId(null);
    }
  };
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/auth');
      }
    });
  };
  
  const handlePublishIdea = async (id: number) => {
    await publishIdea(id);
  };

  const handleTwitterPublish = async (id: number) => {
    await publishToTwitter(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error handling moved to loading state for simplicity

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Thought Percolator</h1>
          <p className="text-muted-foreground">Welcome, {username}!</p>
        </div>
        <div className="flex gap-2">
          <Link href="/public">
            <Button variant="outline" className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              All Public Ideas
            </Button>
          </Link>
          <Link href={`/public/${username}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              My Public Ideas
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleOpenNewForm}>Add New Idea</Button>

        <div className="flex items-center">
          <span className="mr-2 text-sm">Sort by:</span>
          <Select
            onValueChange={(value) => sort(value as SortOptionType['value'])}
            defaultValue="rank-desc"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <IdeaForm
            idea={editingIdea}
            onSubmit={handleCreateOrUpdateIdea}
            onCancel={handleCloseForm}
            isSubmitting={false}
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onEdit={() => handleOpenEditForm(idea)}
            onDelete={() => handleOpenDeleteConfirm(idea.id)}
            onRankChange={updateIdeaRank}
            onPublish={handlePublishIdea}
            onTwitterPublish={handleTwitterPublish}
            isUpdating={isPublishing || isPublishingToTwitter}
          />
        ))}
      </div>

      {ideas.length === 0 && !showForm && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">No ideas yet</h2>
          <p className="text-muted-foreground mb-4">
            Start by adding your first idea using the button above
          </p>
        </div>
      )}

      <DeleteConfirmDialog
        open={deletingIdeaId !== null}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        isDeleting={false}
      />

      <Toaster />
    </div>
  );
}