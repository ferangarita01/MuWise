
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
import { Trash2, UserPlus, Save, ChevronRight, ChevronLeft, Eye, Scale, RefreshCcw, AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import type { Agreement } from '@/lib/types';
import { useRouter } from 'next/navigation';

const societySchema = z.object({
  ascap: z.boolean().default(false),
  sesac: z.boolean().default(false),
  bmi: z.boolean().default(false),
  other: z.string().optional(),
});

const composerSchema = z.object({
  id: z.string().optional(), // Keep track of existing composers
  name: z.string().min(1, 'Name is required'),
  documentId: z.string().min(1, 'ID/Document is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  publisher: z.string().optional(),
  societies: societySchema.optional(),
  ipiNumber: z.string().optional(),
  share: z.coerce.number().min(0, 'Share must be >= 0').max(100, 'Share must be <= 100'),
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

const labels = {
    en: {
        title: "Create Split Agreement",
        editTitle: "Edit Split Agreement",
        description: "Fill in the details to create a new songwriter split agreement.",
        editDescription: "Update the details of the agreement.",
        songInformation: "Song Information",
        songTitle: "Song Title *",
        publicationDate: "Publication Date *",
        performerArtists: "Performer Artists",
        duration: "Duration (MM:SS)",
        language: "Language",
        composersManagement: "Composers Management",
        composers: "Composers",
        addComposer: "Add Composer",
        totalShares: "Total Shares",
        name: "Full Name *",
        documentId: "ID/Document *",
        email: "Email Address *",
        phone: "Phone",
        address: "Address",
        publisher: "Publisher",
        share: "Share (%) *",
        ipiNumber: "IPI Number",
        performingRightsSociety: "Performing Rights Society",
        saveDraft: "Save Draft",
        updateAgreement: "Update Agreement",
        previewAgreement: "Preview Agreement",
        backToEdit: "Back to Edit",
        errorTotalShares: "Total shares must be 100%",
        errorUniqueEmails: "Composer emails must be unique.",
        successMessage: "Agreement saved successfully!",
        updateSuccessMessage: "Agreement updated successfully!",
        errorMessage: "Please correct the errors and try again.",
        formStep: (step: number) => `Step ${step} of 2`,
        next: "Next",
        previous: "Previous",
        agreementPreview: "Agreement Preview",
        other: "Other",
        distributeEqually: "Distribute Equally",
        resetForm: "Reset Form",
        shareWarning: "A share >50% might be unusual. Please double check.",
    },
    es: {
        title: "Crear Acuerdo de División",
        editTitle: "Editar Acuerdo de División",
        description: "Complete los detalles para crear un nuevo acuerdo de división de compositores.",
        editDescription: "Actualice los detalles del acuerdo.",
        songInformation: "Información de la Canción",
        songTitle: "Título de la Canción *",
        publicationDate: "Fecha de Publicación *",
        performerArtists: "Artistas Intérpretes",
        duration: "Duración (MM:SS)",
        language: "Idioma",
        composersManagement: "Gestión de Compositores",
        composers: "Compositores",
        addComposer: "Añadir Compositor",
        totalShares: "Porcentaje Total",
        name: "Nombre Completo *",
        documentId: "ID/Documento *",
        email: "Correo Electrónico *",
        phone: "Teléfono",
        address: "Dirección",
        publisher: "Editora",
        share: "Porcentaje (%) *",
        ipiNumber: "Número IPI",
        performingRightsSociety: "Sociedad de Derechos de Ejecución",
        saveDraft: "Guardar Borrador",
        updateAgreement: "Actualizar Acuerdo",
        previewAgreement: "Previsualizar Acuerdo",
        backToEdit: "Volver a Editar",
        errorTotalShares: "El total de los porcentajes debe ser 100%",
        errorUniqueEmails: "Los correos de los compositores deben ser únicos.",
        successMessage: "¡Acuerdo guardado exitosamente!",
        updateSuccessMessage: "¡Acuerdo actualizado exitosamente!",
        errorMessage: "Por favor, corrija los errores e intente de nuevo.",
        formStep: (step: number) => `Paso ${step} de 2`,
        next: "Siguiente",
        previous: "Anterior",
        agreementPreview: "Previsualización del Acuerdo",
        other: "Otro",
        distributeEqually: "Distribuir Equitativamente",
        resetForm: "Reiniciar Formulario",
        shareWarning: "Una participación >50% puede ser inusual. Por favor, verifique.",
    }
}

function getAgreementPreviewText(data: AgreementFormValues, t: typeof labels.en) {
    let text = `${t.songInformation}\n`;
    text += `-----------------\n`;
    text += `${t.songTitle}: ${data.songTitle}\n`;
    if(data.publicationDate) text += `${t.publicationDate}: ${format(data.publicationDate, 'PPP')}\n`;
    if(data.performerArtists) text += `${t.performerArtists}: ${data.performerArtists}\n`;
    if(data.duration) text += `${t.duration}: ${data.duration}\n\n`;

    text += `${t.composers}\n`;
    text += `-----------\n`;
    data.composers.forEach((c, i) => {
        text += `Compositor ${i+1}:\n`;
        text += `  ${t.name}: ${c.name}\n`;
        text += `  ${t.email}: ${c.email}\n`;
        text += `  ${t.share}: ${c.share}%\n`;
        if(c.documentId) text += `  ${t.documentId}: ${c.documentId}\n`;
        if(c.phone) text += `  ${t.phone}: ${c.phone}\n`;
        if(c.address) text += `  ${t.address}: ${c.address}\n`;
        if(c.publisher) text += `  ${t.publisher}: ${c.publisher}\n`;
        if(c.ipiNumber) text += `  ${t.ipiNumber}: ${c.ipiNumber}\n`;
        const societies = Object.entries(c.societies || {}).map(([key, value]) => {
            if (key === 'other' && typeof value === 'string' && value) return value;
            if (value === true) return key.toUpperCase();
            return null;
        }).filter(Boolean);
        if(societies.length > 0) text += `  ${t.performingRightsSociety}: ${societies.join(', ')}\n`;
        text += '\n';
    });

    return text;
}

const defaultValues: AgreementFormValues = {
  songTitle: '',
  performerArtists: '',
  duration: '',
  language: 'en',
  composers: [{ name: '', documentId: '', email: '', share: 100, phone: '', address: '', publisher: '', ipiNumber: '', societies: {ascap: false, bmi: false, sesac: false, other: ''} }],
  publicationDate: new Date(),
};


export function AgreementForm({ existingAgreement, onSave }: { existingAgreement?: Agreement, onSave: (data: Agreement) => void }) {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const isEditMode = !!existingAgreement;

  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });
  
  useEffect(() => {
    if (isEditMode && existingAgreement) {
      form.reset({
        ...existingAgreement,
        language: existingAgreement.language || 'en',
        publicationDate: existingAgreement.publicationDate ? new Date(existingAgreement.publicationDate) : new Date(),
        composers: existingAgreement.composers.map(c => ({...c, documentId: c.id, societies: {ascap: false, bmi: false, sesac: false, other: ''}})) // Adapt mock data
      });
    }
  }, [isEditMode, existingAgreement, form]);

  const t = labels[form.watch('language')];

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'composers',
  });
  
  const totalShare = useMemo(() => {
    const composers = form.watch('composers');
    if (!composers) return 0;
    return composers.reduce((acc, composer) => acc + (Number(composer.share) || 0), 0);
  }, [form.watch('composers')]);


  const onSubmit = (data: AgreementFormValues) => {
    const newAgreement: Agreement = {
      id: existingAgreement?.id || `AGR-${Date.now()}`,
      status: existingAgreement?.status || 'Draft',
      createdAt: existingAgreement?.createdAt || new Date().toISOString(),
      ...data,
      composers: data.composers.map(c => ({
        id: c.documentId || crypto.randomUUID(),
        name: c.name,
        email: c.email,
        share: c.share,
        role: 'Composer', // default role
        publisher: c.publisher || '',
      }))
    };
    onSave(newAgreement);

    toast({
      title: "Success",
      description: isEditMode ? t.updateSuccessMessage : t.successMessage,
    });
    router.push('/dashboard');
  };

  const onError = (errors: any) => {
    console.log(errors);
    
    let description = t.errorMessage;
    if (errors.composers?.root?.message?.includes('100')) {
        description = t.errorTotalShares;
    } else if (errors.composers?.root?.message?.includes('unique')) {
        description = t.errorUniqueEmails;
    }

    toast({
      variant: "destructive",
      title: "Error",
      description: description,
    });
    
    const step1Fields: (keyof AgreementFormValues)[] = ['songTitle', 'publicationDate', 'duration', 'performerArtists'];
    if (step1Fields.some(field => errors[field])) {
      setStep(1);
    }
  };

  const handleNextStep = async () => {
    const songInfoFields: (keyof AgreementFormValues)[] = ['songTitle', 'publicationDate', 'performerArtists', 'duration'];
    const result = await form.trigger(songInfoFields);
    if(result) {
      setStep(2);
    }
  }
  
  const handleDistributeEqually = () => {
      const composerCount = fields.length;
      if (composerCount === 0) return;
      
      const equalShare = 100 / composerCount;
      const roundedShare = Math.floor(equalShare * 10) / 10; // round to 1 decimal place
      
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

  const handlePreviousStep = () => {
    setStep(1);
  }

  if (preview) {
      return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>{t.agreementPreview}</CardTitle>
                <CardDescription>{isEditMode ? t.editDescription : t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    readOnly
                    value={getAgreementPreviewText(form.getValues(), t)}
                    className="min-h-[400px] text-base bg-secondary whitespace-pre-wrap"
                    aria-label="Agreement Preview"
                />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setPreview(false)}><ChevronLeft className="mr-2 h-4 w-4" />{t.backToEdit}</Button>
                <Button onClick={form.handleSubmit(onSubmit, onError)}><Save className="mr-2 h-4 w-4" />{isEditMode ? t.updateAgreement : t.saveDraft}</Button>
            </CardFooter>
        </Card>
      )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">{isEditMode ? t.editTitle : t.title}</CardTitle>
                <CardDescription>{isEditMode ? t.editDescription : t.description}</CardDescription>
            </div>
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => form.reset(defaultValues)}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    {t.resetForm}
                </Button>
                <span className="text-sm font-semibold text-muted-foreground">{t.formStep(step)}</span>
            </div>
        </div>
      </CardHeader>
      <form>
        <CardContent className="space-y-8">
            {step === 1 && (
                <div className="space-y-6">
                    <h3 className="text-lg font-medium">{t.songInformation}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="songTitle">{t.songTitle}</Label>
                            <Input id="songTitle" {...form.register('songTitle')} placeholder="e.g., Midnight Bloom" />
                            {form.formState.errors.songTitle && <p className="text-sm text-destructive">{form.formState.errors.songTitle.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="publicationDate">{t.publicationDate}</Label>
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
                        <div className="space-y-2">
                            <Label htmlFor="duration">{t.duration}</Label>
                            <Input id="duration" {...form.register('duration')} placeholder="03:45" />
                            {form.formState.errors.duration && <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>}
                        </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="performerArtists">{t.performerArtists}</Label>
                            <Textarea id="performerArtists" {...form.register('performerArtists')} placeholder="Artist names performing this song" />
                        </div>
                         <div className="space-y-2">
                            <Label>{t.language}</Label>
                            <RadioGroup
                                value={form.watch('language')}
                                className="flex items-center gap-4"
                                onValueChange={(value: 'en' | 'es') => form.setValue('language', value)}
                            >
                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value="en" id="lang-en" />
                                <Label htmlFor="lang-en">English</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value="es" id="lang-es" />
                                <Label htmlFor="lang-es">Español</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </div>
            )}
            
            {step === 2 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">{t.composersManagement}</h3>
                        <Button type="button" variant="outline" size="sm" onClick={handleDistributeEqually}>
                            <Scale className="mr-2 h-4 w-4" />
                            {t.distributeEqually}
                        </Button>
                    </div>
                    <div className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg relative space-y-4 bg-background/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`composers.${index}.name`}>{t.name}</Label>
                                <Input id={`composers.${index}.name`} {...form.register(`composers.${index}.name`)} />
                                {form.formState.errors.composers?.[index]?.name && <p className="text-sm text-destructive">{form.formState.errors.composers?.[index]?.name?.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`composers.${index}.documentId`}>{t.documentId}</Label>
                                <Input id={`composers.${index}.documentId`} {...form.register(`composers.${index}.documentId`)} />
                                {form.formState.errors.composers?.[index]?.documentId && <p className="text-sm text-destructive">{form.formState.errors.composers?.[index]?.documentId?.message}</p>}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`composers.${index}.email`}>{t.email}</Label>
                                <Input id={`composers.${index}.email`} type="email" {...form.register(`composers.${index}.email`)} />
                                {form.formState.errors.composers?.[index]?.email && <p className="text-sm text-destructive">{form.formState.errors.composers?.[index]?.email?.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`composers.${index}.phone`}>{t.phone}</Label>
                                <Input id={`composers.${index}.phone`} {...form.register(`composers.${index}.phone`)} type="tel" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`composers.${index}.publisher`}>{t.publisher}</Label>
                                <Input id={`composers.${index}.publisher`} {...form.register(`composers.${index}.publisher`)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor={`composers.${index}.address`}>{t.address}</Label>
                                <Textarea id={`composers.${index}.address`} {...form.register(`composers.${index}.address`)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`composers.${index}.ipiNumber`}>{t.ipiNumber}</Label>
                                <Input id={`composers.${index}.ipiNumber`} {...form.register(`composers.${index}.ipiNumber`)} placeholder="000000000"/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor={`composers.${index}.share`}>{t.share}</Label>
                                <Input id={`composers.${index}.share`} type="number" step="0.1" {...form.register(`composers.${index}.share`)} />
                                {form.watch(`composers.${index}.share`) > 50 && <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1"><AlertTriangle className="h-3 w-3" />{t.shareWarning}</p>}
                                {form.formState.errors.composers?.[index]?.share && <p className="text-sm text-destructive">{form.formState.errors.composers?.[index]?.share?.message}</p>}
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>{t.performingRightsSociety}</Label>
                                <div className="flex flex-wrap items-center gap-4 pt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id={`composers.${index}.societies.ascap`} {...form.register(`composers.${index}.societies.ascap`)} />
                                        <Label htmlFor={`composers.${index}.societies.ascap`}>ASCAP</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id={`composers.${index}.societies.bmi`} {...form.register(`composers.${index}.societies.bmi`)} />
                                        <Label htmlFor={`composers.${index}.societies.bmi`}>BMI</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id={`composers.${index}.societies.sesac`} {...form.register(`composers.${index}.societies.sesac`)} />
                                        <Label htmlFor={`composers.${index}.societies.sesac`}>SESAC</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id={`composers.${index}.societies.otherCheckbox`} />
                                        <Input 
                                          placeholder={t.other} 
                                          className="h-8" 
                                          {...form.register(`composers.${index}.societies.other`)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {fields.length > 1 && (
                            <Button variant="destructive" size="icon" className="absolute -top-3 -right-3" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove composer</span>
                            </Button>
                        )}
                        </div>
                    ))}
                    </div>
                    <Button type="button" variant="outline" className="mt-4" onClick={() => append({ documentId: crypto.randomUUID(), name: '', email: '', share: 0, phone: '', address: '', publisher: '', ipiNumber: '', societies: {ascap: false, bmi: false, sesac: false, other: ''} })}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {t.addComposer}
                    </Button>
                    <Separator className="my-8" />
                    <div>
                        <Label>{t.totalShares}</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <Progress value={totalShare} className={cn(totalShare > 100 && "accent-destructive")} />
                            <span className={cn("font-bold text-lg", totalShare !== 100 && "text-destructive", totalShare === 100 && "text-green-500")}>
                                {totalShare.toFixed(1)}% / 100%
                            </span>
                        </div>
                        {form.formState.errors.composers?.root?.message && <p className="text-sm text-destructive mt-2">{form.formState.errors.composers?.root.message.includes('unique') ? t.errorUniqueEmails : t.errorTotalShares}</p>}
                    </div>
                </div>
            )}
        </CardContent>
        <CardFooter className="flex justify-between">
            {step === 1 ? (
                <div></div>
            ) : (
                <Button type="button" variant="outline" onClick={handlePreviousStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t.previous}
                </Button>
            )}

            {step === 1 ? (
                 <Button type="button" onClick={handleNextStep}>
                    {t.next}
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <div className="flex gap-4">
                    <Button type="button" variant="secondary" onClick={() => setPreview(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t.previewAgreement}
                    </Button>
                    <Button type="button" onClick={form.handleSubmit(onSubmit, onError)}>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode ? t.updateAgreement : t.saveDraft}
                    </Button>
                </div>
            )}
        </CardFooter>
      </form>
    </Card>
  );
}

    