
'use server';

import { adminDb, adminStorage } from './firebase-server';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';
import { cookies } from 'next/headers';

interface ActionResult {
    status: 'success' | 'error';
    message: string;
    data?: any;
}

export async function uploadProfilePhotoAction(formData: FormData): Promise<ActionResult> {
    const file = formData.get('profilePhoto') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
        return { status: 'error', message: 'No file or user ID provided.' };
    }

    try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const bucket = adminStorage.bucket();
        const filePath = `profile-photos/${userId}/${file.name}`;
        const fileUpload = bucket.file(filePath);

        await fileUpload.save(fileBuffer, {
            metadata: {
                contentType: file.type,
            },
        });
        
        await fileUpload.makePublic();
        const downloadURL = fileUpload.publicUrl();

        revalidatePath('/dashboard/profile');

        return { 
            status: 'success', 
            message: 'Photo uploaded successfully.',
            data: { downloadURL } 
        };
    } catch (error: any) {
        console.error('Upload failed:', error);
        return { status: 'error', message: `Upload failed: ${error.message}` };
    }
}

export async function sendSignatureRequestEmail(formData: FormData): Promise<ActionResult> {
    const email = formData.get('email') as string;
    const agreementId = formData.get('agreementId') as string;
    const agreementTitle = formData.get('agreementTitle') as string;
    const requesterName = formData.get('requesterName') as string;

    if (!email || !agreementId || !agreementTitle || !requesterName) {
        return { status: 'error', message: 'Missing required fields for sending email.' };
    }
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        const errorMessage = 'Email service is not configured. Please set SMTP variables in your .env file.';
        console.error(errorMessage);
        return {
            status: 'error',
            message: errorMessage,
        };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const signatureUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/agreements/${agreementId}`;

    const mailOptions = {
        from: `"${requesterName} via Muwise" <${process.env.EMAIL_FROM || 'no-reply@muwise.com'}>`,
        to: email,
        subject: `Signature Request: ${agreementTitle}`,
        html: `
            <h1>Signature Request</h1>
            <p>${requesterName} has requested your signature on the agreement: "${agreementTitle}".</p>
            <p>Please review and sign the document by clicking the link below:</p>
            <a href="${signatureUrl}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Review & Sign Agreement
            </a>
            <p>If you have any questions, please contact ${requesterName} directly.</p>
            <br>
            <p>Thank you,</p>
            <p>The Muwise Team</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return {
            status: 'success',
            message: `Signature request sent to ${email}.`,
        };
    } catch (error: any) {
        console.error('Failed to send email:', error);
        return { status: 'error', message: `Failed to send email: ${error.message}` };
    }
}

export async function updateSignerSignatureAction({ agreementId, signerId, signatureDataUrl }: { agreementId: string; signerId: string; signatureDataUrl: string; }): Promise<ActionResult> {
    if (!agreementId || !signerId || !signatureDataUrl) {
        return { status: 'error', message: 'Missing required fields for updating signature.' };
    }

    try {
        const agreementRef = adminDb.collection('agreements').doc(agreementId);
        const agreementDoc = await agreementRef.get();

        if (!agreementDoc.exists) {
            return { status: 'error', message: 'Agreement not found.' };
        }

        const agreementData = agreementDoc.data();
        const signers = agreementData?.signers || [];
        
        const signerIndex = signers.findIndex((s: any) => s.id === signerId);

        if (signerIndex === -1) {
            return { status: 'error', message: 'Signer not found in this agreement.' };
        }

        signers[signerIndex].signed = true;
        signers[signerIndex].signedAt = new Date().toISOString();
        signers[signerIndex].signature = signatureDataUrl;

        await agreementRef.update({ 
            signers,
            lastModified: new Date().toISOString(),
        });
        
        revalidatePath(`/dashboard/agreements/${agreementId}`);
        revalidatePath('/dashboard/agreements');

        return {
            status: 'success',
            message: 'Signature updated successfully.',
            data: { signedAt: signers[signerIndex].signedAt }
        };
    } catch (error: any) {
        console.error('Failed to update signature:', error);
        return { status: 'error', message: `Failed to update signature: ${error.message}` };
    }
}

export async function updateAgreementStatusAction(agreementId: string, status: string): Promise<ActionResult> {
    if (!agreementId || !status) {
        return { status: 'error', message: 'Missing agreement ID or status.' };
    }

    try {
        const agreementRef = adminDb.collection('agreements').doc(agreementId);
        const agreementDoc = await agreementRef.get();

        if (!agreementDoc.exists) {
            return { status: 'error', message: 'Agreement not found.' };
        }

        let pdfUrl = null;
        if (status === 'Completado') {
             // Generate PDF and upload to Storage
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                executablePath: '/usr/bin/google-chrome-stable',
             });

            const page = await browser.newPage();
            
            // Set session cookie for authentication
            const cookieStore = await cookies();
            const sessionCookie = cookieStore.get('session');
            if (sessionCookie) {
                await page.setCookie({
                    name: 'session',
                    value: sessionCookie.value,
                    domain: new URL(process.env.NEXT_PUBLIC_BASE_URL!).hostname, // Use your app's domain
                    path: '/',
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                });
            } else {
                 return { status: 'error', message: 'Authentication session not found for PDF generation.' };
            }

            const documentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/agreements/${agreementId}/document`;
            await page.goto(documentUrl, { waitUntil: 'networkidle0' });
            
            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
            await browser.close();

            const bucket = adminStorage.bucket();
            const filePath = `agreements-pdf/${agreementId}-${Date.now()}.pdf`;
            const file = bucket.file(filePath);

            await file.save(pdfBuffer, {
                metadata: { contentType: 'application/pdf' },
            });
            await file.makePublic();
            pdfUrl = file.publicUrl();
        }
        
        await agreementRef.update({
            status: status,
            pdfUrl: pdfUrl, // Save the PDF URL
            lastModified: new Date().toISOString(),
        });

        revalidatePath(`/dashboard/agreements/${agreementId}`);
        revalidatePath('/dashboard/agreements');

        return {
            status: 'success',
            message: 'Agreement status updated successfully.',
            data: { pdfUrl },
        };
    } catch (error: any) {
        console.error('Failed to update agreement status:', error);
        return { status: 'error', message: `Failed to update status: ${error.message}` };
    }
}
