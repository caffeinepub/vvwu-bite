import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import { Menu, Moon, ShoppingCart, Sun, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

export function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { total, itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/menu", label: "MENU" },
    { to: "/ratings", label: "REVIEWS" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[oklch(0.08_0_0)] border-b border-[oklch(0.25_0.04_27)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="text-xl leading-none">🍴🍽️🥄</span>
            <span className="font-heading font-black text-lg tracking-tight">
              <span className="text-white">VVWU</span>
              <span className="text-accent">-Bite</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 font-heading font-semibold text-xs tracking-widest transition-colors ${
                  currentPath === link.to
                    ? "text-accent"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full text-white/70 hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-accent" />
              ) : (
                <Moon className="h-4 w-4 text-white/70" />
              )}
            </button>

            {/* Cart Button */}
            <Link to="/cart">
              <button
                type="button"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-accent/60 text-accent hover:bg-accent/10 transition-all font-heading font-semibold text-xs tracking-wide"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart (₹{total})
                {itemCount > 0 && (
                  <span className="bg-accent text-[oklch(0.1_0_0)] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Mobile Cart Icon */}
            <Link to="/cart" className="sm:hidden relative">
              <button
                type="button"
                className="p-2 rounded-full text-accent hover:bg-accent/10 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-[oklch(0.1_0_0)] text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none">
                    {itemCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Admin Button */}
            <Link to="/admin">
              <button
                type="button"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-accent/60 text-accent hover:bg-accent/10 transition-all font-heading font-semibold text-xs tracking-widest"
              >
                ADMIN
              </button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[oklch(0.25_0.04_27)] bg-[oklch(0.1_0_0)]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block py-2.5 px-3 rounded-lg font-heading font-semibold text-sm tracking-wide transition-colors ${
                  currentPath === link.to
                    ? "text-accent bg-accent/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/admin"
              className="block py-2.5 px-3 rounded-lg font-heading font-semibold text-sm tracking-wide text-accent hover:bg-accent/10 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              ADMIN PANEL
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
