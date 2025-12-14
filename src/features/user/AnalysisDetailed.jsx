import React from 'react';

// --- Komponen Alert (Tetap Sama) ---
const CriticalGatekeeperAlert = ({ mandatoryChecks, currentScore }) => {
    const failedChecks = Object.keys(mandatoryChecks).filter(key => 
        mandatoryChecks[key].status === 'FAIL'
    );

    if (failedChecks.length === 0) return null;

    const checkTitles = {
        gpa: "GPA Requirement",
        major: "Field of Study",
        experience_years: "Experience Duration",
        education_level: "Education Level"
    };

    const showCappedMessage = currentScore >= 25;

    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-sm animate-fade-in-up">
            <h3 className="font-extrabold text-xl text-red-700 flex items-center gap-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                CRITICAL ALERT: BASIC QUALIFICATIONS MISMATCH
            </h3>
            
            {showCappedMessage && (
                <p className="text-red-600 mb-4 font-medium">
                    Your score has been capped at 25% because one or more mandatory requirements for this job were not met.
                </p>
            )}

            {!showCappedMessage && (
                <p className="text-red-600 mb-4 font-medium">
                    Your qualifications do not meet the mandatory requirements for this position.
                </p>
            )}

            <ul className="space-y-3 pl-0 border-t border-red-100 pt-4">
                {failedChecks.map(key => (
                    <li key={key} className="flex flex-col md:flex-row md:items-start text-sm text-red-800 bg-red-100 p-3 rounded-lg border-l-4 border-red-500">
                        <span className="font-bold w-40 flex-shrink-0 text-red-900 mb-1 md:mb-0">
                            {checkTitles[key] || key}:
                        </span> 
                        <span className="flex-grow leading-relaxed">
                            {mandatoryChecks[key].reason || "Requirement not met."}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

function AnalysisDetailed({ analysisData }) {
    if (!analysisData) return null;

    const { match_score, gemini_result, job_info, job_description } = analysisData;
    const aiAnalysis = gemini_result?.ai_analysis || {};
    const skills = aiAnalysis.skills_analysis || [];
    const suggestion = aiAnalysis.suggestion;
    const mandatoryChecks = aiAnalysis.mandatory_checks || {};

    const isGatekeeperFailed = Object.values(mandatoryChecks).some(check => check.status === 'FAIL');

    let displayTitle = "Target Position"; 
    if (job_info?.title && job_info.title !== 'General Job' && job_info.title !== 'Custom Job Position') {
        displayTitle = job_info.title;
    } else if (gemini_result?.job_info?.title) {
        displayTitle = gemini_result.job_info.title;
    } else if (job_description) {
        const firstLine = job_description.split('\n')[0].trim();
        if (firstLine && firstLine.length > 2 && firstLine.length < 80) {
            displayTitle = firstLine;
        }
    }

    // --- [FIX] Helper Warna Terpusat (Badge & Bar Sinkron) ---
    const getColorScheme = (level) => {
        const l = level?.toLowerCase() || '';
        if (l.includes('strong') || l.includes('expert')) return { color: 'green', label: 'STRONG EVIDENCE' };
        if (l.includes('moderate') || l.includes('competent')) return { color: 'blue', label: 'MODERATE EVIDENCE' };
        if (l.includes('standard') || l.includes('intermediate')) return { color: 'orange', label: 'STANDARD CONTEXT' };
        if (l.includes('listed') || l.includes('basic')) return { color: 'yellow', label: 'LISTED ONLY' };
        return { color: 'red', label: 'MISSING' };
    };

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex justify-between items-end pb-6 border-b border-gray-100">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">EVALUATION FOR POSITION</span>
                    <h2 className="text-2xl font-extrabold text-slate-800 mt-1">
                        {displayTitle}
                    </h2>
                </div>
                <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase font-bold">MATCH SCORE</span>
                    <div className="text-4xl font-extrabold text-[#94B0DA]">{match_score}%</div>
                </div>
            </div>

            {/* ALERT */}
            <CriticalGatekeeperAlert mandatoryChecks={mandatoryChecks} currentScore={match_score} />

            {/* SKILL AUDIT */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span>📋</span> Skill Quality Audit 
                    {isGatekeeperFailed && <span className="text-base font-medium text-red-500 ml-2">(Potential Reference Only)</span>}
                </h3>

                {skills.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-center">
                        No skill analysis data returned.
                    </div>
                ) : (
                    <div className={`space-y-5 ${isGatekeeperFailed ? 'opacity-50 grayscale-[0.3]' : ''}`}>
                        {skills.map((item, index) => {
                            // Ambil skema warna berdasarkan Level text
                            const scheme = getColorScheme(item.level); 
                            
                            // Mapping class tailwind dinamis tidak selalu jalan sempurna di production build tertentu
                            // Jadi kita mapping manual classnya biar aman
                            const badgeClass = {
                                green: "bg-green-100 text-green-700 border-green-200",
                                blue: "bg-blue-100 text-blue-700 border-blue-200",
                                orange: "bg-orange-100 text-orange-700 border-orange-200",
                                yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
                                red: "bg-red-100 text-red-700 border-red-200"
                            }[scheme.color];

                            const barClass = {
                                green: "bg-green-500",
                                blue: "bg-blue-500",
                                orange: "bg-orange-400", // Orange agak gelap biar kelihatan
                                yellow: "bg-yellow-400",
                                red: "bg-red-400"
                            }[scheme.color];

                            return (
                                <div key={index} className="flex flex-col md:flex-row gap-4 p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="md:w-1/3 flex-shrink-0">
                                        <h4 className="font-bold text-slate-700 mb-2">{item.skill}</h4>
                                        
                                        {/* BADGE */}
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-md border ${badgeClass}`}>
                                                {scheme.label}
                                            </span>
                                        </div>

                                        {/* PROGRESS BAR - Warna Sinkron dengan Badge */}
                                        <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 hidden md:block">
                                            <div 
                                                className={`h-1.5 rounded-full ${barClass}`} 
                                                style={{ width: `${Math.min(100, item.score * 10)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="md:w-2/3">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Optimization Advice</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">{item.reason}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* RECOMMENDATION */}
            {suggestion && (
                <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-xl p-6">
                    <h3 className="font-bold text-[#92400E] mb-2 flex items-center gap-2"><span>💡</span> Strategic Recommendation</h3>
                    <p className="text-slate-700 leading-relaxed">{suggestion}</p>
                </div>
            )}
        </div>
    );
}

export default AnalysisDetailed;