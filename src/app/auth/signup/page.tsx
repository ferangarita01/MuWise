'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Musical Profile' },
  { id: 3, title: 'Professional Details' },
];

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const progress = (step / STEPS.length) * 100;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Your Account</CardTitle>
        <CardDescription>
          Join Muwise to manage your music rights like a pro.
        </CardDescription>
         <div className="pt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{`Step ${step} of ${STEPS.length}: ${STEPS[step-1].title}`}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" placeholder="Alina Vera" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="alina@example.com" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                        <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the <Link href="#" className="underline">Terms & Conditions</Link>.
                    </Label>
                </div>
            </div>
        )}
        {step === 2 && (
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="artistName">Artist/Stage Name</Label>
                    <Input id="artistName" placeholder="e.g., AV Music" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="role">Primary Role</Label>
                    {/* This would be a Select component */}
                    <Input id="role" placeholder="Songwriter" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="genres">Music Genres</Label>
                    {/* This would be a multi-select component */}
                    <Input id="genres" placeholder="Pop, R&B" />
                </div>
            </div>
        )}
         {step === 3 && (
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="publisher">Publisher Name (optional)</Label>
                    <Input id="publisher" placeholder="Vera Music Publishing" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="pro">PRO Society (optional)</Label>
                    {/* This would be checkboxes */}
                    <Input id="pro" placeholder="ASCAP, BMI..." />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="ipi">IPI Number (optional)</Label>
                    <Input id="ipi" placeholder="000000000" />
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="flex w-full justify-between">
            {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>Back</Button>
            ) : <div></div>}
            {step < STEPS.length ? (
                <Button onClick={handleNext}>Next</Button>
            ) : (
                 <Button className="w-full" asChild><Link href="/dashboard">Create Account</Link></Button>
            )}
        </div>
        {step === STEPS.length && (
             <div className="w-full text-center">
                <Button variant="link" onClick={handleBack}>Go Back to Edit</Button>
             </div>
        )}
        <div className="text-sm text-center text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
