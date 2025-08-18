
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Trash2, UserPlus, Save, ChevronRight, ChevronLeft, Eye, Scale, RefreshCcw, AlertTriangle, Calendar, UserRoundPlus, VenetianMask, FilePenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { Agreement, Composer as ComposerType, User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { mapUserToComposer } from '@/lib/utils/userDataMapper';
import { AutofillUserData } from './AutofillUserData';
import { Skeleton } from './ui/skeleton';
import { useAgreements } from '@/hooks/useAgreements';
import { useRouter } from 'next/navigation';

const societySchema = z.object({
  ascap: z.boolean().default(false),
  sesac: z.boolean().default(false),
  bmi: z.boolean().default(false),
  other: z.string().optional(),
});

const composerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  documentId: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  publisher: z.string().optional(),
  societies: societySchema.optional(),
  ipiNumber: z.string().optional(),
  share: z.coerce.number().min(0, 'Share must be >= 0').max(100, 'Share must be <= 100'),
  role: z.string().optional(),
});

const formSchema = z.object({
  songTitle: z.string().min(1, 'Song title is required'),
  publicationDate: z.date({ required_error: "Publication date is required." }),
  performerArtists: z.string().optional(),
  duration: z.string().regex(/^([0-5]?[0-9]):([0-5]?[0-9])$/, 'Invalid format MM:SS').optional(),
  language: z.enum(['en', 'es']).default('en'),
  composers: z.array(composerSchema).min(1, 'At least one composer is required'),
}).refine((data) => {
    const totalShare = data.composers.reduce((acc, composer) => acc + composer.share, 0);
    return Math.abs(totalShare - 100) < 0.001;
}, {
    message: "Total shares must add up to 100%",
    path: ["composers"],
}).refine((data) => {
    const emails = data.composers.map(c => c.email);
    return new Set(emails).size === emails.length;
}, {
    message: "Composer emails must be unique.",
    path: ["composers"],
});


type AgreementFormValues = z.infer<typeof formSchema>;
type OnSaveType = (data: Omit<Agreement, 'id' | 'createdAt' | 'userId' | 'status'>, andSign?: boolean) => Promise<{id?: string} | void>;


export function AgreementForm({ 
  existingAgreement, 
  onSave,
  onFormChange 
}: { 
  existingAgreement?: Agreement, 
  onSave: OnSaveType,
  onFormChange?: (data: Partial<Agreement>) => void;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userProfile, loading: profileLoading } = useUserProfile();
  
  const isEditMode = !!existingAgreement;

  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode && existingAgreement ? {
        ...existingAgreement,
        publicationDate: new Date(existingAgreement.publicationDate),
        composers: existingAgreement.composers.map(c => ({
          ...c, 
          share: Number(c.share) || 0,
          societies: (c as any).societies || {ascap: false, bmi: false, sesac: false, other: ''}
        }))
    } : {
        songTitle: '',
        performerArtists: '',
        duration: '',
        language: 'en',
        composers: [],
        publicationDate: new Date(),
    },
  });
  
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (onFormChange) {
        onFormChange(value as Partial<Agreement>);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onFormChange]);

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'composers',
  });
  
  // Auto-fill form on initial load if creating a new agreement
  useEffect(() => {
    if (userProfile && !isEditMode && fields.length === 0) {
        const composerData = mapUserToComposer(userProfile as User);
        append({
            ...composerData,
            share: 100, // Default to 100 for the first user
        });
    }
  }, [userProfile, isEditMode, fields.length, append]);


  useEffect(() => {
    if (isEditMode && existingAgreement) {
      form.reset({
        ...existingAgreement,
        language: (existingAgreement.language as 'en' | 'es') || 'en',
        publicationDate: existingAgreement.publicationDate ? new Date(existingAgreement.publicationDate) : new Date(),
        composers: existingAgreement.composers.map(c => ({
          ...c, 
          share: Number(c.share) || 0,
          societies: (c as any).societies || {ascap: false, bmi: false, sesac: false, other: ''}
        }))
      });
    }
  }, [isEditMode, existingAgreement, form.reset]);

  const totalShare = useMemo(() => {
    const composers = form.watch('composers');
    if (!composers) return 0;
    return composers.reduce((acc, composer) => acc + (Number(composer.share) || 0), 0);
  }, [form.watch('composers')]);


  const onSubmit = async (data: AgreementFormValues, andSign = false) => {
    const agreementData = {
        ...data,
        publicationDate: data.publicationDate.toISOString(),
        composers: data.composers.map(c => ({
            id: c.id || crypto.randomUUID(), 
            name: c.name,
            email: c.email,
            share: c.share,
            role: 'Composer', // default role
            publisher: c.publisher || '',
        }))
    };
    await onSave(agreementData, andSign);
  };
  
  const handleDistributeEqually = () => {
      const composerCount = fields.length;
      if (composerCount === 0) return;
      
      const equalShare = 100 / composerCount;
      const roundedShare = Math.floor(equalShare * 10) / 10;
      
      let distributedTotal = 0;
      fields.forEach((field, index) => {
          const share = index < composerCount - 1 ? roundedShare : 100 - distributedTotal;
          update(index, { ...field, share: share });
          distributedTotal += share;
      });
      form.setValue('composers', form.getValues('composers').map((c, i) => {
          const newShare = i < composerCount - 1 ? roundedShare : 100 - (roundedShare * (composerCount - 1));
          return {...c, share: parseFloat(newShare.toFixed(1))};
      }), { shouldValidate: true });

      toast({
          title: "Shares Distributed",
          description: `Each composer now has approximately ${equalShare.toFixed(1)}% share.`
      });
  }
  
  const handleAddMe = () => {
      if (!userProfile) return;
      
      const composerData = mapUserToComposer(userProfile as User);
      append({
          ...composerData,
          share: 0,
      });
      toast({ title: "You've been added", description: "Your profile information has been filled in."})
  }

  const isUserAlreadyAdded = useMemo(() => {
    if (!user) return true;
    return fields.some(field => field.email === user.email);
  }, [user, fields]);

  return (
    <Card className="w-full">
        <form>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">
                        {isEditMode ? 'Editar Acuerdo' : 'Crear Acuerdo'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => form.reset()}>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reiniciar
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-4">
                <div className="space-y-4 p-1">
                    <h3 className="text-base font-semibold">Información de la Canción</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                            <Label htmlFor="songTitle">Título de la Canción *</Label>
                            <Input id="songTitle" {...form.register('songTitle')} placeholder="e.g., Midnight Bloom" autoComplete="off" />
                            {form.formState.errors.songTitle && <p className="text-sm text-destructive">{form.formState.errors.songTitle.message}</p>}
                        </div>
                         <div className="space-y-1">
                            <Label htmlFor="publicationDate">Fecha de Publicación *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !form.watch('publicationDate') && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {form.watch('publicationDate') ? format(form.watch('publicationDate')!, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <CalendarIcon
                                    mode="single"
                                    selected={form.watch('publicationDate')}
                                    onSelect={(date) => form.setValue('publicationDate', date!, { shouldValidate: true })}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                             {form.formState.errors.publicationDate && <p className="text-sm text-destructive">{form.formState.errors.publicationDate.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="duration">Duración (MM:SS)</Label>
                            <Input id="duration" {...form.register('duration')} placeholder="03:45" autoComplete="off" />
                            {form.formState.errors.duration && <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>}
                        </div>
                    </div>
                </div>
                <Separator/>
                <div className="space-y-4 p-1">
                    <div className="flex justify-between items-center">
                        <h3 className="text-base font-semibold">Compositores y Porcentajes</h3>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={handleDistributeEqually}>
                                <Scale className="mr-2 h-4 w-4" />
                                Distribuir
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddMe} disabled={isUserAlreadyAdded}>
                                <UserRoundPlus className="mr-2 h-4 w-4" />
                                Añadirme
                            </Button>
                        </div>
                    </div>
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-3 border rounded-lg relative space-y-3 bg-muted/30">
                             <div className="flex items-center justify-between">
                                <Label className="text-foreground font-semibold">Compositor #{index + 1}</Label>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-6 gap-3">
                                <div className="space-y-1 col-span-3">
                                    <Label htmlFor={`composers.${index}.name`}>Nombre *</Label>
                                    <Input id={`composers.${index}.name`} {...form.register(`composers.${index}.name`)} autoComplete="name" />
                                </div>
                                <div className="space-y-1 col-span-3">
                                    <Label htmlFor={`composers.${index}.email`}>Email *</Label>
                                    <Input id={`composers.${index}.email`} type="email" {...form.register(`composers.${index}.email`)} autoComplete="email" />
                                </div>
                                <div className="space-y-1 col-span-4">
                                    <Label htmlFor={`composers.${index}.publisher`}>Editora</Label>
                                    <Input id={`composers.${index}.publisher`} {...form.register(`composers.${index}.publisher`)} autoComplete="organization" />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label htmlFor={`composers.${index}.share`}>Porcentaje (%) *</Label>
                                    <Input id={`composers.${index}.share`} type="number" step="0.1" {...form.register(`composers.${index}.share`)} autoComplete="off" />
                                </div>
                            </div>
                             {form.formState.errors.composers?.[index]?.share && <p className="text-sm text-destructive">{form.formState.errors.composers?.[index]?.share?.message}</p>}
                             {form.formState.errors.composers?.[index]?.name && <p className="text-sm text-destructive">{form.formState.errors.composers?.[index]?.name?.message}</p>}
                             {form.formState.errors.composers?.[index]?.email && <p className="text-sm text-destructive">{form.formState.errors.composers?.[index]?.email?.message}</p>}
                        </div>
                    ))}
                     <Button type="button" variant="secondary" className="w-full" onClick={() => append({ id: crypto.randomUUID(), name: '', email: '', share: 0, publisher: '' })}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Añadir otro compositor
                    </Button>
                    <div className="pt-2">
                        <Label>Porcentaje Total</Label>
                        <div className="flex items-center gap-4 mt-1">
                            <Progress value={totalShare} className={cn(totalShare > 100 && "accent-destructive")} />
                            <span className={cn("font-bold text-lg", totalShare !== 100 && "text-destructive", totalShare === 100 && "text-green-500")}>
                                {totalShare.toFixed(1)}%
                            </span>
                        </div>
                        {form.formState.errors.composers?.root?.message && <p className="text-sm text-destructive mt-2">{form.formState.errors.composers?.root.message}</p>}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end p-4 border-t border-border">
                <Button type="button" size="lg" onClick={form.handleSubmit(d => onSubmit(d, false))}>
                    <FilePenLine className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Actualizar Acuerdo' : 'Guardar y Continuar'}
                </Button>
            </CardFooter>
        </form>
    </Card>
  );
}
