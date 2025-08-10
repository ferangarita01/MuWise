import { ConflictDetectionForm } from '@/components/conflict-detection-form';

export default function ConflictDetectionPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rights Conflict Detection</h1>
        <p className="text-muted-foreground">
          Use our AI tool to analyze split sheets for potential rights conflicts.
        </p>
      </div>
      <ConflictDetectionForm />
    </div>
  );
}
