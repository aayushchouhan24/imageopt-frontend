import { Bell, Search, Command } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Topbar() {
  const { user, logout } = useAuth();

  const initials = user?.email
    ?.split('@')[0]
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <header className="bg-card rounded-xl border h-14">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <button className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:bg-secondary transition-colors">
          <Search className="h-4 w-4" />
          <span className="text-sm">Search...</span>
          <kbd className="ml-8 flex items-center gap-1 text-xs bg-muted px-1.5 py-0.5 rounded">
            <Command className="h-3 w-3" />K
          </kbd>
        </button>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button 
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary"></span>
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-border hover:ring-primary/50 transition-all">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
