import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, ChevronRight, Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { useIsAdmin } from "../../hooks/useQueries";

export function AdminLogin() {
  const navigate = useNavigate();
  const {
    login,
    isLoggingIn,
    isLoginError,
    loginError,
    identity,
    isInitializing,
  } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!checkingAdmin && isAdmin === true) {
      void navigate({ to: "/admin/dashboard" });
    } else if (!checkingAdmin && identity && isAdmin === false) {
      setAccessDenied(true);
    }
  }, [isAdmin, checkingAdmin, identity, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-border/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-red">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl gradient-text mb-1">
            Admin Portal
          </h1>
          <p className="text-muted-foreground text-sm font-heading">
            🍴🍽️🥄 VVWU-Bite Smart Canteen
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-7 shadow-card-glow">
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="font-heading font-semibold text-lg">
                Secure Sign In
              </h2>
              <p className="text-muted-foreground text-sm">
                Use Internet Identity to access the admin dashboard. Only
                authorized administrators can log in.
              </p>
            </div>

            {/* Access Denied */}
            {accessDenied && (
              <Alert className="border-destructive/40 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive text-sm font-heading">
                  Access Denied. Your account does not have admin privileges.
                  Please contact the canteen manager.
                </AlertDescription>
              </Alert>
            )}

            {/* Login Error */}
            {isLoginError && loginError && (
              <Alert className="border-destructive/40 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive text-sm font-heading">
                  {loginError.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Button */}
            <Button
              className="w-full bg-primary hover:bg-primary/90 h-12 font-heading font-bold gap-2 glow-red text-base"
              onClick={login}
              disabled={isLoggingIn || isInitializing || checkingAdmin}
            >
              {isLoggingIn || isInitializing || checkingAdmin ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {checkingAdmin
                    ? "Verifying access..."
                    : isInitializing
                      ? "Initializing..."
                      : "Connecting..."}
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Sign in with Internet Identity
                  <ChevronRight className="h-5 w-5 ml-auto" />
                </>
              )}
            </Button>

            <div className="text-center pt-1">
              <p className="text-xs text-muted-foreground">
                Protected by Internet Computer&apos;s decentralized identity
              </p>
            </div>
          </div>
        </div>

        {/* Back to site */}
        <div className="text-center mt-5">
          <button
            type="button"
            onClick={() => void navigate({ to: "/" })}
            className="text-sm text-muted-foreground hover:text-foreground font-heading transition-colors"
          >
            ← Back to VVWU-Bite
          </button>
        </div>
      </motion.div>
    </div>
  );
}
