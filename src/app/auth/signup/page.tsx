'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { signUpWithEmail } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FirebaseError } from 'firebase/app';


const STEPS = [
  { id: 1, title: 'Basic Information', fields: ['fullName', 'email', 'password', 'terms'] },
  { id: 2, title: 'Musical Profile', fields: ['artistName', 'primaryRole', 'genres'] },
  { id: 3, title: 'Professional Details', fields: ['publisher', 'proSociety', 'ipiNumber'] },
];

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  artistName: z.string().optional(),
  primaryRole: z.string().optional(),
  genres: z.string().optional(),
  publisher: z.string().optional(),
  proSociety: z.string().optional(),
  ipiNumber: z.string().optional(),
});

type SignUpFormValues = z.infer<typeof formSchema>;

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  const { handleSubmit, trigger } = methods;

  const progress = (step / STEPS.length) * 100;

  const handleNext = async () => {
    const fields = STEPS[step - 1].fields;
    const output = await trigger(fields as (keyof SignUpFormValues)[]);

    if (!output) return;

    if (step < STEPS.length) {
      setStep((prev) => prev + 1);
    }
  };
  
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      const user = await signUpWithEmail(data);
      if (user) {
        toast({
          title: 'Account created!',
          description: 'Welcome to Muwise! Redirecting you to the dashboard...',
        });
        router.push('/dashboard');
      }
    } catch (error) {
       if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
         toast({
            variant: 'destructive',
            title: 'Email Already Registered',
            description: (
              <>
                An account with this email already exists.{' '}
                <Link href="/auth/signin" className="underline font-bold">
                  Sign in instead
                </Link>
                .
              </>
            ),
         });
       } else {
          toast({
            variant: 'destructive',
            title: 'Sign up failed.',
            description: 'An unexpected error occurred. Please try again.',
          });
       }
      console.error('Sign up error:', error);
    }
  };
  
  const handleFormSubmit = (data: SignUpFormValues) => {
     if (step < STEPS.length) {
      handleNext();
    } else {
      onSubmit(data);
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Your Account</CardTitle>
        <CardDescription>
          Join Muwise to manage your music rights like a pro.
        </CardDescription>
        <div className="pt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{`Step ${step} of ${STEPS.length}: ${STEPS[step - 1].title}`}</p>
        </div>
      </CardHeader>
      <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={methods.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Alina Vera" {...field} autoComplete="name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="alina@example.com" {...field} autoComplete="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                           <FormControl>
                                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} autoComplete="new-password" />
                            </FormControl>
                            <Button variant="ghost" size="icon" type="button" className="absolute top-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                  )}
                />
               
                 <FormField
                    control={methods.control}
                    name="terms"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md pt-2">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel className="font-normal">
                             I agree to the <Link href="#" className="underline">Terms & Conditions</Link>.
                            </FormLabel>
                             <FormMessage />
                        </div>
                        </FormItem>
                    )}
                />
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="artistName">Artist/Stage Name</Label>
                  <Input id="artistName" placeholder="e.g., AV Music" {...methods.register('artistName')} autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryRole">Primary Role</Label>
                  <Input id="primaryRole" placeholder="Songwriter" {...methods.register('primaryRole')} autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genres">Music Genres</Label>
                  <Input id="genres" placeholder="Pop, R&B" {...methods.register('genres')} autoComplete="off" />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher Name (optional)</Label>
                  <Input id="publisher" placeholder="Vera Music Publishing" {...methods.register('publisher')} autoComplete="organization" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proSociety">PRO Society (optional)</Label>
                  <Input id="proSociety" placeholder="ASCAP, BMI..." {...methods.register('proSociety')} autoComplete="off" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ipiNumber">IPI Number (optional)</Label>
                  <Input id="ipiNumber" placeholder="000000000" {...methods.register('ipiNumber')} autoComplete="off" />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <div className="flex w-full justify-between">
              {step > 1 ? (
                <Button variant="outline" type="button" onClick={handleBack}>Back</Button>
              ) : <div />}
              {step < STEPS.length ? (
                <Button type="button" onClick={handleNext}>Next</Button>
              ) : (
                <Button type="submit">Create Account</Button>
              )}
            </div>
             {step === STEPS.length && (
                <div className="w-full text-center">
                    <Button variant="link" type="button" onClick={handleBack}>Go Back to Edit</Button>
                </div>
            )}
            <div className="text-sm text-center text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
        </Form>
      </FormProvider>
    </Card>
  );
}
