
'use client';

import { useForm } from 'react-hook-form';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { FilePenLine, X, Globe } from 'lucide-react';
import { Separator } from './ui/separator';

const profileFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  artistName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  locationCountry: z.string().optional(),
  locationState: z.string().optional(),
  locationCity: z.string().optional(),
  primaryRole: z.string().min(1, 'Primary role is required'),
  musicGenres: z.array(z.string()).min(1, 'Select at least one genre'),
  experienceLevel: z.enum(['beginner', 'intermediate', 'professional']),
  bio: z.string().optional(),
  publisher: z.string().optional(),
  proSociety: z.enum(['none', 'ascap', 'bmi', 'sesac', 'other']).optional(),
  website: z.string().url('Invalid URL').optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const defaultValues: Partial<ProfileFormValues> = {
  fullName: '',
  artistName: '',
  email: '',
  phone: '',
  locationCountry: '',
  locationState: '',
  locationCity: '',
  primaryRole: '',
  musicGenres: [],
  experienceLevel: 'intermediate',
  bio: '',
  publisher: '',
  proSociety: 'none',
  website: '',
};

const musicGenreOptions = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'R&B',
  'Electronic',
  'Country',
  'Jazz',
  'Classical',
  'Other',
];

export function ProfileForm() {
  const { toast } = useToast();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    });
  }

  function onCancel() {
    form.reset(defaultValues);
    toast({
      title: 'Changes Discarded',
      description: 'Your changes have been reset.',
      variant: 'destructive',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Manage your personal and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your legal name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="artistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist/Stage Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your professional name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="locationCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="au">Australia</SelectItem>
                            <SelectItem value="mx">Mexico</SelectItem>
                            <SelectItem value="es">Spain</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                     </Select>
                     <Input placeholder="State / Province" {...form.register('locationState')} />
                     <Input placeholder="City" {...form.register('locationCity')} />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Musical Profile</CardTitle>
            <CardDescription>
              Describe your musical background and expertise.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="primaryRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your main role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="songwriter">Songwriter</SelectItem>
                        <SelectItem value="producer">Producer</SelectItem>
                        <SelectItem value="vocalist">Vocalist</SelectItem>
                        <SelectItem value="musician">Musician</SelectItem>
                        <SelectItem value="audio-engineer">Audio Engineer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="musicGenres"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Music Genres *</FormLabel>
                        <Select onValueChange={(value) => field.onChange([...field.value, value])} >
                             <FormControl>
                                <SelectTrigger>
                                     <SelectValue placeholder="Select genres" />
                                 </SelectTrigger>
                             </FormControl>
                             <SelectContent>
                                {musicGenreOptions.map(genre => (
                                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                                ))}
                             </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {field.value.map((genre) => (
                                <div key={genre} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs">
                                    {genre}
                                    <button onClick={() => field.onChange(field.value.filter(v => v !== genre))}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Experience Level</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="beginner" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Beginner (0-2 years)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="intermediate" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Intermediate (3-5 years)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="professional" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Professional (5+ years)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio / Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your musical background, style, and accomplishments."
                        className="resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>Optional details about your professional setup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="publisher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Vera Music Publishing or Independent" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="proSociety"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>PRO Society</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="none" /></FormControl><FormLabel className="font-normal">None</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="ascap" /></FormControl><FormLabel className="font-normal">ASCAP</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="bmi" /></FormControl><FormLabel className="font-normal">BMI</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="sesac" /></FormControl><FormLabel className="font-normal">SESAC</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website/Social Media</FormLabel>
                     <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="url" placeholder="https://your-portfolio.com" className="pl-10" {...field} />
                        </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </CardContent>
           <CardFooter className="flex justify-end gap-4 p-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
            </Button>
            <Button type="submit">
                <FilePenLine className="mr-2 h-4 w-4" />
                Save Profile
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
