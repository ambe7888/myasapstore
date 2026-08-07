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
      <CardHeader className="pb-3 space-y-3">
        {action && (
          <div className="flex justify-end items-center">
            {action}
          </div>
        )}
        <div className="text-left">
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}