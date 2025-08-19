
import type { Agreement, Composer } from "@/lib/types"
import { FormattedDate } from "./formatted-date";

interface AgreementDocumentProps {
    agreement: Agreement;
}


export function AgreementDocument({ agreement }: AgreementDocumentProps) {
    const { songTitle, publicationDate, performerArtists, composers } = agreement;
    
    // In a real app, you would have more dynamic fields.
    // For now, we'll use some mock data for the DJ contract template.
    const djData = {
        date: <FormattedDate dateString={publicationDate} options={{ day: 'numeric', month: 'long', year: 'numeric' }} />,
        clientName: composers.find(s => s.role === 'Cliente')?.name || 'Cliente por definir',
        djName: composers.find(s => s.role === 'Proveedor')?.name || 'DJ por definir',
        eventType: 'Boda',
        eventDate: <FormattedDate dateString={publicationDate} options={{ day: 'numeric', month: 'long', year: 'numeric' }} />,
        eventTime: '20:00 - 04:00',
        eventLocation: 'Hacienda La Almendrilla, Madrid',
        totalFee: '€1,500',
        depositAmount: '€500'
    };

    return (
        <div className="leading-relaxed ring-1 ring-white/5 border rounded-lg p-5 bg-card border-border text-card-foreground">
            <div className="mx-auto max-w-3xl rounded-md bg-white text-slate-900 ring-1 ring-inset ring-slate-900/5 shadow-lg">
                <header className="border-b px-6 py-5" style={{ borderColor: 'rgb(226,232,240)' }}>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ backgroundColor: 'rgb(241,245,249)', color: 'rgb(71,85,105)' }}>DJ Contract</div>
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl" style={{ color: 'rgb(15,23,42)' }}>{songTitle} - Service Agreement</h2>
                    <p className="mt-1 text-sm" style={{ color: 'rgb(71,85,105)' }}>Un acuerdo profesional para la prestación de servicios de DJ en eventos.</p>
                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                        <div>
                            <div className="text-xs" style={{ color: 'rgb(100,116,139)' }}>Fecha efectiva</div>
                            <div className="font-medium" style={{ color: 'rgb(15,23,42)' }}>{djData.date}</div>
                        </div>
                        <div>
                            <div className="text-xs" style={{ color: 'rgb(100,116,139)' }}>Cliente</div>
                            <div className="font-medium" style={{ color: 'rgb(15,23,42)' }}>{djData.clientName}</div>
                        </div>
                        <div>
                            <div className="text-xs" style={{ color: 'rgb(100,116,139)' }}>Proveedor (DJ)</div>
                            <div className="font-medium" style={{ color: 'rgb(15,23,42)' }}>{djData.djName}</div>
                        </div>
                    </div>
                </header>
                <div className="space-y-6 px-6 py-6">
                    <p className="text-sm leading-6" style={{ color: 'rgb(71,85,105)' }}>This DJ Service Contract (the “Agreement”) is made effective as of {djData.date}, by and between {djData.clientName} (“Client”) and {djData.djName} (“DJ”).</p>
                    <section className="rounded-md border p-4" style={{ borderColor: 'rgb(226,232,240)', backgroundColor: 'rgb(248,250,252)' }}>
                        <h3 className="mb-3 text-base font-medium" style={{ color: 'rgb(15,23,42)' }}>Detalles del Evento</h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                            <div>
                                <div className="text-xs" style={{ color: 'rgb(100,116,139)' }}>Tipo de evento</div>
                                <div className="font-medium" style={{ color: 'rgb(30,41,59)' }}>{djData.eventType}</div>
                            </div>
                            <div>
                                <div className="text-xs" style={{ color: 'rgb(100,116,139)' }}>Fecha</div>
                                <div className="font-medium" style={{ color: 'rgb(30,41,59)' }}>{djData.eventDate}</div>
                            </div>
                            <div>
                                <div className="text-xs" style={{ color: 'rgb(100,116,139)' }}>Horario</div>
                                <div className="font-medium" style={{ color: 'rgb(30,41,59)' }}>{djData.eventTime}</div>
                            </div>
                            <div className="sm:col-span-2">
                                <div className="text-xs" style={{ color: 'rgb(100,116,139)' }}>Ubicación</div>
                                <div className="font-medium" style={{ color: 'rgb(30,41,59)' }}>{djData.eventLocation}</div>
                            </div>
                        </div>
                    </section>
                    <section>
                        <h3 className="mb-3 text-base font-medium" style={{ color: 'rgb(15,23,42)' }}>Términos y Condiciones</h3>
                        <ol className="list-decimal space-y-4 pl-5 text-sm">
                            <li><span className="font-medium" style={{ color: 'rgb(15,23,42)' }}>Services.</span> <span style={{ color: 'rgb(71,85,105)' }}>The DJ will provide music and entertainment services for the event described in “Detalles del Evento”.</span></li>
                            <li><span className="font-medium" style={{ color: 'rgb(15,23,42)' }}>Payment.</span> <span style={{ color: 'rgb(71,85,105)' }}>The Client agrees to pay the DJ a total fee of {djData.totalFee}. A non‑refundable deposit of {djData.depositAmount} is due upon signing this Agreement. The remaining balance is due on the day of the event.</span></li>
                            <li><span className="font-medium" style={{ color: 'rgb(15,23,42)' }}>Cancellation.</span> <span style={{ color: 'rgb(71,85,105)' }}>If the Client cancels the event less than 30 days prior, the full amount will be due. If the DJ cancels, the deposit will be fully refunded.</span></li>
                            <li><span className="font-medium" style={{ color: 'rgb(15,23,42)' }}>Equipment.</span> <span style={{ color: 'rgb(71,85,105)' }}>The DJ will provide all necessary equipment to perform the services. The Client must provide a safe location with adequate power.</span></li>
                            <li><span className="font-medium" style={{ color: 'rgb(15,23,42)' }}>Indemnification.</span> <span style={{ color: 'rgb(71,85,105)' }}>The Client agrees to indemnify and hold the DJ harmless from any liability, claims, or damages arising from the event, except for those caused by the DJ's gross negligence.</span></li>
                        </ol>
                    </section>
                    <div className="rounded-md p-4 text-xs leading-6 ring-1 ring-inset" style={{ backgroundColor: 'rgb(248,250,252)', color: 'rgb(71,85,105)', borderColor: 'rgb(226,232,240)' }}>
                        <p>Al firmar, confirmas que has leído y aceptas los términos de uso, política de privacidad y reconoces que tu firma electrónica es legalmente vinculante. Conserva una copia para tus registros.</p>
                    </div>
                    <section>
                        <h3 className="mb-3 text-base font-medium" style={{ color: 'rgb(15,23,42)' }}>Firmas</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {composers.map(signer => (
                                <div key={signer.id} className="rounded-lg border p-4" style={{ backgroundColor: 'rgb(255,255,255)', borderColor: 'rgb(226,232,240)' }}>
                                    <p className="mb-2 text-xs font-medium" style={{ color: 'rgb(100,116,139)' }}>Firma del {signer.role}</p>
                                    <div className="flex h-28 items-center justify-center rounded-md border-2 border-dashed" style={{ borderColor: 'rgb(226,232,240)', backgroundColor: '#f8fafc' }}>
                                        {signer.signature ? (
                                            <img src={signer.signature} alt={`Firma ${signer.name}`} className="max-h-24 object-contain invert-0" />
                                        ) : (
                                            <span className="text-xs" style={{ color: 'rgb(148,163,184)' }}>Pendiente de firma</span>
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-[11px]" style={{ color: 'rgb(100,116,139)' }}>
                                        <span className="font-medium" style={{color: 'rgb(30,41,59)'}}>{signer.name}</span>
                                        <span className="font-mono">{signer.signedAt ? <FormattedDate dateString={signer.signedAt} options={{dateStyle: 'short'}} /> : '...'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

    