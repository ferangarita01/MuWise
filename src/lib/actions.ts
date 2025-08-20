
'use server';

import { adminStorage } from './firebase-server';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

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

    // Nodemailer transport configuration.
    // IMPORTANT: Replace with your actual email service credentials.
    // It's highly recommended to use environment variables for this.
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // e.g., 'smtp.sendgrid.net'
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
            user: process.env.SMTP_USER, // e.g., 'apikey' for SendGrid
            pass: process.env.SMTP_PASS, // Your SendGrid API key or other password
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
