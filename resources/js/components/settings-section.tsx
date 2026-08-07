import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function SettingsSection({ title, description, children, action }: SettingsSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg font-medium">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1 text-xs sm:text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          {action && (
            <div className="shrink-0 flex items-center gap-2">
              {action}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}