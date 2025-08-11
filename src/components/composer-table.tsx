
import type { Composer } from '@/lib/types';

export function ComposerTable({ composers }: { composers: Composer[] }) {
    const totalShare = composers.reduce((acc, c) => acc + c.share, 0);

    return (
        <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-2 text-left font-semibold" style={{fontFamily: "Arial, sans-serif"}}>Composer Name</th>
                        <th scope="col" className="px-4 py-2 text-left font-semibold" style={{fontFamily: "Arial, sans-serif"}}>Email Contact</th>
                        <th scope="col" className="px-4 py-2 text-left font-semibold" style={{fontFamily: "Arial, sans-serif"}}>Publisher</th>
                        <th scope="col" className="px-4 py-2 text-right font-semibold" style={{fontFamily: "Arial, sans-serif"}}>Share %</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {composers.map((composer) => (
                        <tr key={composer.id}>
                            <td className="px-4 py-2 font-medium">{composer.name}</td>
                            <td className="px-4 py-2 text-gray-600">{composer.email}</td>
                            <td className="px-4 py-2 text-gray-600">{composer.publisher}</td>
                            <td className="px-4 py-2 text-right font-medium">{composer.share.toFixed(1)}%</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-50">
                    <tr>
                        <td colSpan={3} className="px-4 py-2 text-right font-bold" style={{fontFamily: "Arial, sans-serif"}}>
                            Total Percentage
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-lg">
                           {totalShare.toFixed(1)}% {totalShare === 100 && '✓'}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}

    