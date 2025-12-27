import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Image,
  BarChart3,
  Settings,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Image, label: 'Media Library', path: '/media' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Sparkles, label: 'Transformations', path: '/transformations' },
  { icon: LinkIcon, label: 'URL Builder', path: '/url-builder' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 bg-card rounded-xl border flex flex-col">
      {/* Logo/Brand Dropdown */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Image className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium flex-1 text-left">ImageOpt</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
