import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Key, LogOut, Shield, Bell, Palette, Copy, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  const mockApiKey = 'your-api-key-will-appear-here';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const menuItems = [
    { icon: User, label: 'Profile', active: true },
    { icon: Key, label: 'API Keys', active: false },
    { icon: Shield, label: 'Security', active: false },
    { icon: Bell, label: 'Notifications', active: false },
    { icon: Palette, label: 'Appearance', active: false },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Menu */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  item.active
                    ? 'bg-zinc-800/40 text-white'
                    : 'text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl">
          {/* Profile Section */}
          <div className="rounded-xl bg-zinc-900/20 border border-zinc-800/30 mb-6">
            <div className="p-4 border-b border-zinc-800/30">
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-medium">
                  {user?.email?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-medium text-white">{user?.email?.split('@')[0]}</p>
                  <p className="text-sm text-zinc-500">{user?.email}</p>
                  <Badge className="mt-1 bg-emerald-500/10 text-emerald-500 border-0 text-xs">
                    Active
                  </Badge>
                </div>
              </div>

              <Separator className="bg-zinc-800/30" />

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Email Address</Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-zinc-900/20 border-zinc-800/30 text-white h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">User ID</Label>
                  <div className="flex gap-2">
                    <Input
                      value={user?._id || ''}
                      disabled
                      className="bg-zinc-900/20 border-zinc-800/30 text-zinc-500 h-10 font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(user?._id || '')}
                      className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white h-10 w-10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Member Since</Label>
                  <Input
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : ''}
                    disabled
                    className="bg-zinc-900/20 border-zinc-800/30 text-zinc-500 h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="rounded-xl bg-zinc-900/20 border border-zinc-800/30 mb-6">
            <div className="p-4 border-b border-zinc-800/30">
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Keys
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/20 border border-zinc-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Production Key</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                        {showApiKey ? mockApiKey : '•'.repeat(32)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="h-8 w-8 text-zinc-500 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(mockApiKey)}
                      className="h-8 w-8 text-zinc-500 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-zinc-500">
                  Use this key to authenticate API requests. Keep it secret and never expose it in client-side code.
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl bg-zinc-900/20 border border-red-500/20">
            <div className="p-4 border-b border-zinc-800/30">
              <h2 className="text-base font-medium text-red-400 flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Danger Zone
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Sign out</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
