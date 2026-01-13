
import { Search, Bell, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileDialog } from "@/components/profile/ProfileDialog";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 sticky top-0 z-40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/20">
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
          <Input
            placeholder="Buscar..."
            className="pl-9 w-64 bg-secondary/50 border-transparent focus:border-primary/30 focus:bg-secondary/80 transition-all duration-300 rounded-full"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full hover:bg-secondary/80 transition-all duration-300 relative group overflow-hidden"
          title={resolvedTheme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 hover:rotate-90 transition-all duration-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500 hover:text-indigo-600 hover:-rotate-12 transition-all duration-500" />
          )}
        </button>

        <button className="p-2.5 rounded-full hover:bg-secondary/80 transition-all duration-300 relative group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-500/50" />
        </button>

        <div className="pl-2 border-l border-border/40">
          <ProfileDialog />
        </div>
      </div>
    </header>
  );
}
