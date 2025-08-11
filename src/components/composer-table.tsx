
import type { Composer } from '@/lib/types';

export function ComposerTable({ composers }: { composers: Composer[] }) {
    const totalShare = composers.reduce((acc, c) => acc + c.share, 0);

    return (
        <div className="overflow-x-auto">
            <h2 className="text-sm font-bold uppercase text-navy-700 tracking-wider mb-2" style={{fontFamily: "Arial, sans-serif"}}>SONGWRITER CREDITS & PUBLISHING INFORMATION</h2>
            <table className="min-w-full text-sm border-collapse border border-gray-300">
                <thead className="bg-gray-50 text-left" style={{fontFamily: "Arial, sans-serif"}}>
                    <tr>
                        <th className="p-2 border border-gray-300">Composer Name</th>
                        <th className="p-2 border border-gray-300">Email</th>
                        <th className="p-2 border border-gray-300">Contribution</th>
                        <th className="p-2 border border-gray-300">Publisher</th>
                        <th className="p-2 border border-gray-300">PRO Society</th>
                    </tr>
                </thead>
                <tbody style={{fontFamily: "'Times New Roman', Times, serif"}} className="text-gray-800">
                    {composers.map((composer) => (
                        <tr key={composer.id} className="border-t border-gray-300">
                            <td className="p-2 border-r border-gray-300 font-medium">{composer.name}</td>
                            <td className="p-2 border-r border-gray-300">{composer.email}</td>
                            <td className="p-2 border-r border-gray-300 font-medium">{composer.share.toFixed(1)}%</td>
                            <td className="p-2 border-r border-gray-300">{composer.publisher}</td>
                            <td className="p-2">{/* PRO Society data needed */}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold" style={{fontFamily: "Arial, sans-serif"}}>
                    <tr>
                        <td className="p-2 border border-gray-300">TOTAL</td>
                        <td className="p-2 border border-gray-300"></td>
                        <td className="p-2 border border-gray-300">{totalShare.toFixed(1)}%</td>
                        <td className="p-2 border border-gray-300"></td>
                        <td className="p-2 border border-gray-300"></td>
                    </tr>
                </tfoot>
            </table>
             <div className="mt-4 text-sm text-gray-800" style={{fontFamily: "'Times New Roman', Times, serif"}}>
                <h3 className="font-bold text-xs uppercase">IPI NUMBERS & ADDITIONAL INFO:</h3>
                <ul className="list-disc list-inside">
                {composers.map(composer => (
                    <li key={composer.id}>{composer.name} - IPI: [number] - Tel: [phone] - Address: [address]</li>
                ))}
                </ul>
            </div>
        </div>
    )
}
