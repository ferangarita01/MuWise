"use client";

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { detectRightsConflictAction, type ActionState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const initialState: ActionState = {
  status: 'idle',
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <UploadCloud className="mr-2 h-4 w-4" />
          Analyze Split Sheet
        </>
      )}
    </Button>
  );
}

export function ConflictDetectionForm() {
  const [state, formAction] = useFormState(detectRightsConflictAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'error') {
      toast({
        variant: 'destructive',
        title: 'Analysis Error',
        description: state.message,
      });
    }
    if (state.status === 'success') {
      toast({
        title: 'Analysis Complete',
        description: state.message,
      });
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Card>
        <form action={formAction} ref={formRef}>
          <CardHeader>
            <CardTitle>Upload Split Sheet</CardTitle>
            <CardDescription>
              Upload a split sheet document (e.g., PDF, DOCX) to check for potential rights conflicts. Your data is not stored.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="splitSheet">Split Sheet File</Label>
              <Input id="splitSheet" name="splitSheet" type="file" accept=".pdf,.doc,.docx,.txt" required />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.status === 'success' && state.data && (
        <Card className="border-green-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Analysis Result
            </CardTitle>
            <CardDescription>
              The AI has analyzed the document for potential conflicts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={state.data.conflictAnalysis}
              className="min-h-[200px] text-base bg-secondary"
              aria-label="Conflict Analysis Result"
            />
          </CardContent>
        </Card>
      )}
      
      {state.status === 'error' && state.message && (
         <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Analysis Failed
            </CardTitle>
            <CardDescription>
              {state.message}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
