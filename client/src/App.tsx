import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import UserDashboard from "@/pages/user-dashboard";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  return (
    <Switch>
      {/* Redirect from root to auth page if not logged in, or to user dashboard if logged in */}
      <Route path="/">
        {() => {
          if (user) {
            navigate(`/${user.username}`);
          } else {
            navigate("/auth");
          }
          return <div>Redirecting...</div>;
        }}
      </Route>
      
      {/* Authentication page */}
      <Route path="/auth" component={AuthPage} />
      
      {/* User-specific dashboard with username in URL */}
      <ProtectedRoute path="/:username">
        <UserDashboard />
      </ProtectedRoute>
      
      {/* 404 page */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
