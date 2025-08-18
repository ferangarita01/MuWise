
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sparkles } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
            <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-accent/20 text-accent">
                    <Sparkles className="h-8 w-8" />
                </div>
            </div>
          <AlertDialogTitle className="text-center">Coming Soon!</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            This agreement type is currently under development. We're working hard to bring it to you soon. Stay tuned!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Got it!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
