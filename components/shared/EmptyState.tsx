import { FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Get started by creating something new.',
  action,
  className,
  icon,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 px-6 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        {icon ?? <FolderOpen className="w-8 h-8 text-muted-foreground" />}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">{description}</p>
      {action && (
        <Link href={action.href} className="btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}
