import React from 'react';

// --- Komponen Alert (Tetap Sama) ---
const CriticalGatekeeperAlert = ({ mandatoryChecks }) => {
    const failedChecks = Object.keys(mandatoryChecks).filter(key => 
        mandatoryChecks[key].status === 'FAIL'
    );

    if (failedChecks.length === 0) return null;

    const checkTitles = {
        gpa: "GPA Requirement",
        major: "Major/Field of Study Relevance",
        experience_years: "Relevant Experience Duration",
        education_level: "Education Level/Degree Status"
    };

    return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 shadow-sm animate-fade-in-up">
            <h3 className="font-extrabold text-xl text-red-700 flex items-center gap-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                CRITICAL ALERT: BASIC QUALIFICATIONS MISMATCH
            </h3>
            <p className="text-red-600 mb-4 font-medium">
                Your score has been capped at 25% because one or more mandatory requirements for this job were not met.
            </p>
            <ul className="space-y-3 pl-0 border-t border-red-100 pt-4">
                {failedChecks.map(key => (
                    <li key={key} className="flex items-start text-sm text-red-800 bg-red-100 p-3 rounded-lg border-l-4 border-red-500">
                        <span className="font-bold w-40 flex-shrink-0 text-red-900">{checkTitles[key]}:</span> 
                        <span className="ml-2 flex-grow">{mandatoryChecks[key].reason || "Reason not provided by AI."}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

function AnalysisDetailed({ analysisData }) {
    if (!analysisData) return null;

    // Destructure job_description juga (PENTING untuk History)
    const { match_score, gemini_result, job_info, job_description } = analysisData;
    const aiAnalysis = gemini_result?.ai_analysis || {};
    const skills = aiAnalysis.skills_analysis || [];
    const suggestion = aiAnalysis.suggestion;
    const mandatoryChecks = aiAnalysis.mandatory_checks || {};

    const isGatekeeperFailed = Object.values(mandatoryChecks).some(check => check.status === 'FAIL');

    // --- [FIX LOGIC] SMART TITLE EXTRACTION ---
    // Logika: Cek title langsung -> Cek Gemini -> Cek Baris Pertama Teks Deskripsi (Database)
    let displayTitle = "Target Position"; 

    if (job_info?.title && job_info.title !== 'General Job' && job_info.title !== 'Custom Job Position') {
        // 1. Jika data baru diupload (Biasanya ada di job_info)
        displayTitle = job_info.title;
    } else if (gemini_result?.job_info?.title) {
        // 2. Jika ada di dalam object gemini
        displayTitle = gemini_result.job_info.title;
    } else if (job_description) {
        // 3. [SOLUSI UTAMA] Jika data dari database (History), title ada di baris pertama text
        const firstLine = job_description.split('\n')[0].trim();
        // Validasi: Pastikan baris pertama bukan paragraf panjang (kurang dari 80 karakter)
        if (firstLine && firstLine.length > 2 && firstLine.length < 80) {
            displayTitle = firstLine;
        }
    }
    // ------------------------------------------

    // Helper Badge
    const getLevelBadge = (level) => {
        const l = level?.toLowerCase() || '';
        if (l.includes('strong') || l.includes('expert')) return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md border border-green-200">STRONG EVIDENCE</span>;
        if (l.includes('standard') || l.includes('intermediate') || l.includes('good')) return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md border border-blue-200">STANDARD CONTEXT</span>;
        if (l.includes('listed') || l.includes('mentioned') || l.includes('beginner')) return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-md border border-yellow-200">LISTED ONLY</span>;
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md border border-red-200">MISSING</span>;
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

            {/* Alert (Jika Ada) */}
            <CriticalGatekeeperAlert mandatoryChecks={mandatoryChecks} />

            {/* Skill Breakdown */}
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
                        {skills.map((item, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 p-5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                                <div className="md:w-1/3 flex-shrink-0">
                                    <h4 className="font-bold text-slate-700 mb-2">{item.skill}</h4>
                                    <div className="flex items-center gap-3">{getLevelBadge(item.level)}</div>
                                    <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 hidden md:block">
                                        <div className={`h-1.5 rounded-full ${item.score >= 7.5 ? 'bg-green-400' : item.score >= 5 ? 'bg-blue-400' : item.score >= 2.5 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${Math.min(100, item.score * 10)}%` }}></div>
                                    </div>
                                </div>
                                <div className="md:w-2/3">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Optimization Advice</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">{item.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recommendation */}
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