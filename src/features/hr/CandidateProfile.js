// src/features/hr/CandidateProfile.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Award,
  Calendar,
  FileText,
  Star,
  Download,
  Share2,
  Users
} from 'lucide-react';
import { candidateAPI } from '../../services/Api';

const CandidateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ambil token dari localStorage untuk pengecekan sederhana
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role') || 'hr'; // Default ke 'hr'

  const fetchCandidateData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in (sederhana)
      if (!token) {
        setError('Please login to view candidate profiles');
        setLoading(false);
        return;
      }
      
      console.log(`🔍 Fetching candidate data for ID: ${id}`);
      
      // Fetch candidate basic info
      const candidateData = await candidateAPI.getCandidateById(id);
      setCandidate(candidateData);

      // Fetch candidate skills
      const skillsData = await candidateAPI.getCandidateWithSkills(id);
      console.log('📊 Skills data received:', skillsData);
      setSkills(skillsData.skills || []);
      
    } catch (err) {
      console.error('❌ Error fetching candidate:', err);
      
      // Gunakan mock data untuk testing
      const mockCandidate = {
        id: id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+628123456789',
        match_score: 87.5,
        education: 'Bachelor of Computer Science, University of Indonesia (2020-2024)',
        experience: 'Backend Developer at ABC Corp (2023-2024)',
        status: 'passed_filter',
        original_filename: 'cv_john_doe.pdf',
        uploaded_at: '2024-01-15T10:30:00Z',
        job_id: 'job-001'
      };
      
      const mockSkills = [
        { id: '1', name: 'Python', category: 'Programming' },
        { id: '2', name: 'JavaScript', category: 'Programming' },
        { id: '3', name: 'React', category: 'Frontend' },
        { id: '4', name: 'Node.js', category: 'Backend' },
        { id: '5', name: 'PostgreSQL', category: 'Database' }
      ];
      
      setCandidate(mockCandidate);
      setSkills(mockSkills);
      
      // setError(err.message || 'Failed to fetch candidate data');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchCandidateData();
  }, [fetchCandidateData]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Coba navigasi ke halaman HR berdasarkan role
      if (userRole === 'hr') {
        navigate('/hr-screening');
      } else {
        navigate('/');
      }
    }
  };

  const handleContact = () => {
    const email = candidate.email;
    const name = candidate.name;
    
    // Encode semua bagian
    const encodedSubject = encodeURIComponent('Job Application Follow-up');
    const encodedBody = encodeURIComponent(
      `Dear ${name},\n\nWe would like to follow up on your application.\n\nBest regards,\nHR Team`
    );
    
    // Buat URL mailto
    const mailtoUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
    
    console.log('Mailto URL:', mailtoUrl);
    
    // Buka di window baru
    window.open(mailtoUrl, '_blank');
  };

  const handleDownloadCV = () => {
    if (candidate?.original_filename) {
      // Simulasi download (sesuaikan dengan endpoint backend Anda)
      alert(`Downloading CV: ${candidate.original_filename}`);
      // window.open(`${process.env.REACT_APP_API_URL}/api/candidates/${id}/download`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleGoBack}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            {!token && (
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-yellow-500 text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Candidate Not Found</h2>
          <p className="text-gray-600 mb-4">Candidate ID: {id}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  // Helper functions
  const getCurrentCompany = () => {
    if (!candidate.experience) return 'Not specified';
    const parts = candidate.experience.split(' at ');
    return parts.length > 1 ? parts[1].split(' (')[0] : 'Not specified';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Extract education institution
  const getEducationInstitution = () => {
    if (!candidate.education) return 'Education not specified';
    const parts = candidate.education.split(', ');
    return parts.length > 1 ? parts[1] : candidate.education;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Back</span>
              </button>
              
              <button
                onClick={() => navigate('/hr-screening')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Users size={16} />
                All Candidates
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                ID: {candidate.id?.substring(0, 8)}...
              </span>
              <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                {userRole.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              {/* Profile Header */}
              <div className="text-center mb-6">
                <img
                  src={`https://api.dicebear.com/8.x/initials/svg?seed=${candidate.name}&size=120`}
                  alt={candidate.name}
                  className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg"
                />
                <h1 className="text-2xl font-bold text-gray-800 mt-4">{candidate.name}</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {candidate.match_score || 0}% Match
                  </span>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    candidate.status === 'passed_filter' 
                      ? 'bg-green-100 text-green-800'
                      : candidate.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {candidate.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{candidate.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{candidate.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">Indonesia</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Uploaded</p>
                    <p className="font-medium">{formatDate(candidate.uploaded_at)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleDownloadCV}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Download size={18} />
                  Download CV
                </button>
                
                <button
                  onClick={handleContact}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <Mail size={18} />
                  Contact Candidate
                </button>
                
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-3">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm border border-blue-100"
                    >
                      {typeof skill === 'object' ? skill.name : skill}
                    </span>
                  ))
                ) : (
                  <div className="w-full text-center py-4">
                    <p className="text-gray-500 italic">No skills information available</p>
                    <p className="text-sm text-gray-400 mt-1">Skills will appear here once analyzed</p>
                  </div>
                )}
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap size={24} className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Education</h2>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-800">
                    {candidate.education || 'Education information not available'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {getEducationInstitution()}
                  </p>
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase size={24} className="text-green-600" />
                <h2 className="text-xl font-bold text-gray-800">Work Experience</h2>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-800">
                    {candidate.experience || 'Experience information not available'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Current company: <span className="font-medium">{getCurrentCompany()}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Additional Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award size={24} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Application Status</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Match Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full"
                          style={{ width: `${Math.min(candidate.match_score || 0, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-800">{candidate.match_score || 0}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      candidate.status === 'passed_filter' 
                        ? 'bg-green-100 text-green-800'
                        : candidate.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {candidate.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">CV File</p>
                      <p className="font-medium text-blue-600">
                        {candidate.original_filename || 'cv.pdf'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDate(candidate.uploaded_at)}</p>
                  </div>
                </div>
              </div>
            </div>

          
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;