import { Home, MessageCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/chat-history", label: "Chat History", icon: MessageCircle },
  ];

  return (
    <nav className="navbar-gradient h-16 px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Logo/Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Emudhra Analytics Dashboard
        </h1>
      </div>

      {/* Navigation Items */}
      <div className="flex items-center space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300",
                "hover:bg-accent/50 hover:text-accent-foreground",
                isActive &&
                  "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
