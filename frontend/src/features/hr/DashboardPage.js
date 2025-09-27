import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css'; // File CSS untuk styling
import BulkUploadForm from './BulkUploadForm';

//================================================================
// Komponen untuk Menampilkan Daftar Peringkat Kandidat
//================================================================


function CandidateRankingList({ candidates, onViewProfile }) {
    return (
        <div className="ranking-list-container">
            <h2>Peringkat Kandidat untuk "Senior Software Engineer"</h2>
            <p>Ditemukan {candidates.length} kandidat yang cocok.</p>
            <table>
                <thead>
                    <tr>
                        <th>Peringkat</th>
                        <th>Nama Kandidat</th>
                        <th>Skor Kecocokan</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Urutkan kandidat berdasarkan skor tertinggi */}
                    {candidates
                        .sort((a, b) => b.match_score - a.match_score)
                        .map((candidate, index) => (
                            <tr key={candidate.id}>
                                <td>{index + 1}</td>
                                <td>{candidate.extracted_name}</td>
                                <td>
                                    <span className="score-badge">{candidate.match_score}%</span>
                                </td>
                                <td>
                                    <button onClick={() => onViewProfile(candidate.id)}>
                                        Lihat Profil
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

//================================================================
// Komponen untuk Menampilkan Profil Detail dalam Modal (Popup)
//================================================================
function CandidateProfileModal({ candidate, onClose }) {
    // Jika tidak ada kandidat yang dipilih, jangan render apa-apa
    if (!candidate) return null;

    // Parsing data JSON dari database
    const profile = typeof candidate.structured_profile_json === 'string'
        ? JSON.parse(candidate.structured_profile_json)
        : candidate.structured_profile_json;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Profil Kandidat Terstruktur</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    <h4>{candidate.extracted_name}</h4>
                    <p><strong>Email:</strong> {candidate.extracted_email || 'N/A'}</p>
                    <p><strong>Skor:</strong> {candidate.match_score}%</p>
                    <hr />
                    <h5>Keterampilan (Skills)</h5>
                    <div className="skills-container">
                        {profile?.skills?.length > 0 ? (
                            profile.skills.map(skill => <span key={skill} className="skill-tag">{skill}</span>)
                        ) : <p>Tidak ada data skill.</p>}
                    </div>
                    <h5>Pengalaman Kerja</h5>
                    <ul>
                        {profile?.experience?.length > 0 ? (
                            profile.experience.map(exp => (
                                <li key={exp.title}>{exp.title} di {exp.company} ({exp.years} tahun)</li>
                            ))
                        ) : <li>Tidak ada data pengalaman.</li>}
                    </ul>
                    <h5>Pendidikan</h5>
                    <p>{profile?.education || 'Tidak ada data pendidikan.'}</p>
                </div>
            </div>
        </div>
    );
}


//================================================================
// Komponen Utama Halaman Dasbor HR
//================================================================
function HRDashboardPage() {
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL;

    const fetchCandidates = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/hr/jobs/501/candidates`);
            setCandidates(response.data);
            setError(null); // Bersihkan error jika fetch berhasil
        } catch (err) {
            setError("Gagal memuat data kandidat. Pastikan server backend sudah berjalan.");
            console.error("Error fetching candidates:", err);
        } finally {
            setIsLoading(false);
        }
    }, [API_URL]);


    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    // Fungsi ini akan dipanggil oleh BulkUploadForm setelah upload berhasil
    const handleUploadSuccess = () => {
        console.log("Upload berhasil! Me-refresh daftar kandidat...");
        // Ambil ulang data kandidat terbaru dari server
        fetchCandidates();
    };

    const handleViewProfile = (candidateId) => {
        const candidateToShow = candidates.find(c => c.id === candidateId);
        setSelectedCandidate(candidateToShow);
    };

    const handleCloseModal = () => {
        setSelectedCandidate(null);
    };




    if (isLoading) {
        return <div className="hr-dashboard-centered"><h2>Loading candidates from database...</h2></div>;
    }

    if (error) {
        return <div className="hr-dashboard-centered error-message"><h2>Error</h2><p>{error}</p></div>;
    }

    return (
        <div className="hr-dashboard">
            {/* Panggil Komponen Form di sini */}
            <BulkUploadForm onUploadSuccess={handleUploadSuccess} />

            {/* Tampilkan error jika ada */}
            {error && <p className="error-message">{error}</p>}

            {/* Tampilkan loading atau daftar ranking */}
            {isLoading ? (
                <div className="hr-dashboard-centered"><h2>Loading...</h2></div>
            ) : (
                <CandidateRankingList candidates={candidates} onViewProfile={handleViewProfile} />
            )}

            <CandidateProfileModal candidate={selectedCandidate} onClose={handleCloseModal} />

            {/* <CandidateRankingList candidates={candidates} onViewProfile={handleViewProfile} />
      <CandidateProfileModal candidate={selectedCandidate} onClose={handleCloseModal} /> */}
        </div>
    );
}

export default HRDashboardPage;