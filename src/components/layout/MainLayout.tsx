import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function MainLayout() {
  return (
    <div className="flex h-screen bg-background p-4 gap-4">
      <Sidebar />
      <div className="flex-1 flex flex-col gap-4">
        <Topbar />
        <main className="flex-1 overflow-auto bg-card rounded-xl border p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
