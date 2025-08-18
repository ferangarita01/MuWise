
import type { Composer } from '@/lib/types';

export function ComposerTable({ composers }: { composers: Composer[] }) {
    const totalShare = composers.reduce((acc, c) => acc + c.share, 0);

    return (
        <div className="overflow-x-auto rounded-lg border ring-1 ring-white/5 bg-background/50 border-border">
            <h2 className="text-lg font-semibold tracking-tight text-foreground p-4 border-b border-border">
                Detalles del Acuerdo
            </h2>
            <table className="min-w-full text-sm">
                <thead className="text-left text-muted-foreground">
                    <tr>
                        <th className="p-3 font-medium">Composer Name</th>
                        <th className="p-3 font-medium">Email</th>
                        <th className="p-3 font-medium text-right">Contribution</th>
                        <th className="p-3 font-medium">Publisher</th>
                    </tr>
                </thead>
                <tbody className="text-foreground">
                    {composers.map((composer) => (
                        <tr key={composer.id} className="border-t border-border">
                            <td className="p-3 font-medium">{composer.name}</td>
                            <td className="p-3">{composer.email}</td>
                            <td className="p-3 font-medium text-right">{composer.share.toFixed(1)}%</td>
                            <td className="p-3">{composer.publisher}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="font-bold border-t border-border">
                    <tr>
                        <td className="p-3">TOTAL</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right">{totalShare.toFixed(1)}%</td>
                        <td className="p-3"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}
