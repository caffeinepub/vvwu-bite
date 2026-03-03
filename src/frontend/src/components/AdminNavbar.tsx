import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export function AdminNavbar() {
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/menu", label: "Menu" },
    { to: "/admin/queue", label: "Queue" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/history", label: "History" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    void router.navigate({ to: "/admin" });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="font-heading font-bold text-base">
              <span className="gradient-text">VVWU-Bite</span>
              <span className="text-muted-foreground ml-2 text-sm font-normal">
                Admin
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {adminLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md font-heading font-medium text-sm transition-colors ${
                  currentPath === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-muted"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-accent" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 text-muted-foreground hover:text-destructive font-heading text-xs"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {adminLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 px-3 rounded-lg font-heading font-medium text-sm hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full text-left py-2 px-3 rounded-lg font-heading font-medium text-sm text-destructive hover:bg-muted transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
