import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        <p className="text-zinc-400 mt-1">Feature in development</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="py-16">
          <div className="text-center">
            <Construction className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
            <p className="text-zinc-400">
              This feature is currently under development and will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
