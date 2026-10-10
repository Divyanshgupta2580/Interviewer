import { Badge } from '@/components/ui/badge';
import { FlaskConical } from 'lucide-react';

export function DemoLabel() {
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground border-border">
      <FlaskConical className="h-3 w-3" />
      Demonstration
    </Badge>
  );
}
