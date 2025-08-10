"use client";

import { useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { Trash2, UserPlus, Languages, Save, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const composerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  share: z.coerce.number().min(0, 'Share must be non-negative').max(100),
  email: z.string().email('Invalid email address'),
  publisher: z.string().min(1, 'Publisher is required'),
});

const formSchema = z.object({
  songTitle: z.string().min(1, 'Song title is required'),
  composers: z.array(composerSchema).min(1, 'At least one composer is required'),
}).refine((data) => {
    const totalShare = data.composers.reduce((acc, composer) => acc + composer.share, 0);
    return Math.abs(totalShare - 100) < 0.001;
}, {
    message: "Total shares must add up to 100%",
    path: ["composers"],
});

type AgreementFormValues = z.infer<typeof formSchema>;

const labels = {
    en: {
        title: "Create Split Agreement",
        description: "Fill in the details to create a new songwriter split agreement.",
        songTitle: "Song Title",
        composers: "Composers",
        addComposer: "Add Composer",
        totalShares: "Total Shares",
        name: "Full Name",
        role: "Role (e.g., Composer, Lyricist)",
        share: "Share (%)",
        email: "Email Address",
        publisher: "Publisher",
        saveDraft: "Save Draft",
        sendForSignature: "Send for Signature",
        errorTotalShares: "Total shares must be 100%",
        successMessage: "Agreement saved successfully!",
        errorMessage: "Please correct the errors and try again.",
    },
    es: {
        title: "Crear Acuerdo de División",
        description: "Complete los detalles para crear un nuevo acuerdo de división de compositores.",
        songTitle: "Título de la Canción",
        composers: "Compositores",
        addComposer: "Añadir Compositor",
        totalShares: "Porcentaje Total",
        name: "Nombre Completo",
        role: "Rol (ej. Compositor, Letrista)",
        share: "Porcentaje (%)",
        email: "Correo Electrónico",
        publisher: "Editora",
        saveDraft: "Guardar Borrador",
        sendForSignature: "Enviar para Firmar",
        errorTotalShares: "El total de los porcentajes debe ser 100%",
        successMessage: "¡Acuerdo guardado exitosamente!",
        errorMessage: "Por favor, corrija los errores e intente de nuevo.",
    }
}

export function AgreementForm() {
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const t = labels[lang];
  const { toast } = useToast();

  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      songTitle: '',
      composers: [{ name: '', role: '', share: 100, email: '', publisher: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'composers',
  });
  
  const totalShare = useMemo(() => {
    return form.watch('composers').reduce((acc, composer) => acc + (Number(composer.share) || 0), 0);
  }, [form.watch('composers')]);

  const onSubmit = (data: AgreementFormValues) => {
    console.log(data);
    toast({
      title: "Success",
      description: t.successMessage,
    });
  };

  const onError = (errors: any) => {
    console.log(errors);
    toast({
      variant: "destructive",
      title: "Error",
      description: t.errorMessage,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">{t.title}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setLang(lang === 'en' ? 'es' : 'en')}>
                <Languages className="h-5 w-5" />
                <span className="sr-only">Toggle language</span>
            </Button>
        </div>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit, onError)}>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="songTitle">{t.songTitle}</Label>
            <Input id="songTitle" {...form.register('songTitle')} placeholder="e.g., Midnight Bloom" />
            {form.formState.errors.songTitle && <p className="text-sm text-destructive">{form.formState.errors.songTitle.message}</p>}
          </div>

          <Separator />
          
          <div>
            <h3 className="text-lg font-medium">{t.composers}</h3>
            <div className="space-y-6 mt-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg relative space-y-4 bg-background/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor={`composers.${index}.name`}>{t.name}</Label>
                        <Input id={`composers.${index}.name`} {...form.register(`composers.${index}.name`)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`composers.${index}.role`}>{t.role}</Label>
                        <Input id={`composers.${index}.role`} {...form.register(`composers.${index}.role`)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`composers.${index}.share`}>{t.share}</Label>
                        <Input id={`composers.${index}.share`} type="number" {...form.register(`composers.${index}.share`)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`composers.${index}.email`}>{t.email}</Label>
                        <Input id={`composers.${index}.email`} type="email" {...form.register(`composers.${index}.email`)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`composers.${index}.publisher`}>{t.publisher}</Label>
                        <Input id={`composers.${index}.publisher`} {...form.register(`composers.${index}.publisher`)} />
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
             <Button type="button" variant="outline" className="mt-4" onClick={() => append({ name: '', role: '', share: 0, email: '', publisher: '' })}>
                <UserPlus className="mr-2 h-4 w-4" />
                {t.addComposer}
            </Button>
          </div>
          
          <Separator />

          <div>
            <Label>{t.totalShares}</Label>
            <div className="flex items-center gap-4 mt-2">
              <Progress value={totalShare} className={cn(totalShare > 100 && "accent-destructive")} />
              <span className={cn("font-bold text-lg", totalShare !== 100 && "text-destructive")}>{totalShare.toFixed(2)}%</span>
            </div>
             {form.formState.errors.composers?.message && <p className="text-sm text-destructive mt-2">{t.errorTotalShares}</p>}
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            <Save className="mr-2 h-4 w-4" />
            {t.saveDraft}
          </Button>
          <Button type="submit">
            <Send className="mr-2 h-4 w-4" />
            {t.sendForSignature}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
