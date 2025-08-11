
export function LegalTerms() {
    return (
      <div className="max-w-none text-gray-700 mt-8" style={{fontFamily: "'Times New Roman', Times, serif"}}>
        <h2 className="text-sm font-bold uppercase text-navy-700 tracking-wider" style={{fontFamily: "Arial, sans-serif"}}>
            TERMS AND CONDITIONS
        </h2>
        <div className="w-full border-b border-gray-400 my-2"></div>
        <p className="font-bold">By signing below, each party acknowledges and agrees to the following:</p>
        <ol className="list-decimal list-inside space-y-2">
            <li>
                <strong>OWNERSHIP:</strong> The percentage splits indicated above represent each writer's 
                ownership interest in both the musical composition and lyrics.
            </li>
            <li>
                <strong>PUBLISHING:</strong> Each writer retains the right to designate their own music 
                publisher for their respective share.
            </li>
            <li>
                <strong>MECHANICAL RIGHTS:</strong> All mechanical royalties shall be distributed according 
                to the percentages specified above.
            </li>
            <li>
                <strong>PERFORMANCE RIGHTS:</strong> Each writer shall register their share with their 
                respective Performing Rights Organization (PRO).
            </li>
            <li>
                <strong>SYNCHRONIZATION:</strong> Any sync licensing requires consent from all writers.
            </li>
            <li>
                <strong>MODIFICATIONS:</strong> This agreement can only be modified in writing with 
                signatures from all parties.
            </li>
            <li>
                <strong>GOVERNING LAW:</strong> This agreement shall be governed by [jurisdiction] law.
            </li>
        </ol>
      </div>
    );
  }
