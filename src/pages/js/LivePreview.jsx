// LivePreview.jsx - VERSI DIPERBAIKI (HANYA AI PHRASING & FORMATTING)
import React, { useState, useEffect } from 'react';

function LivePreview({ formData, template }) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);

  // Format IPK dengan benar
  const formatGPA = (gpa, gpaMax = "4.00") => {
    if (!gpa) return '';
    
    // Jika sudah mengandung "/", kembalikan aslinya
    if (gpa.includes('/')) {
      return gpa;
    }
    
    // Format menjadi: 3.50 / 4.00
    return `${parseFloat(gpa).toFixed(2)} / ${parseFloat(gpaMax).toFixed(2)}`;
  };

  // Format description dengan bullet points yang benar - VERSI PERBAIKAN
  const formatDescription = (description) => {
    if (!description) return '';
    
    // Split menjadi baris-baris
    const lines = description.split('\n');
    let formattedLines = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Hapus placeholder text
      const cleanLine = trimmedLine.replace(/adasasds|ddassd|\.\.\./gi, '').trim();
      if (!cleanLine) return;
      
      // Jika sudah ada bullet point, normalisasikan ke '•'
      if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
        const content = cleanLine.substring(1).trim();
        if (content) {
          // Split kalimat berdasarkan tanda baca akhir
          const sentences = content.split(/(?<=[.!?])\s+/);
          sentences.forEach(sentence => {
            const trimmedSentence = sentence.trim();
            if (trimmedSentence) {
              formattedLines.push(`• ${trimmedSentence}`);
            }
          });
        }
      } else {
        // Jika tidak ada bullet, tambahkan
        // Split kalimat berdasarkan tanda baca akhir
        const sentences = cleanLine.split(/(?<=[.!?])\s+/);
        sentences.forEach(sentence => {
          const trimmedSentence = sentence.trim();
          if (trimmedSentence) {
            formattedLines.push(`• ${trimmedSentence}`);
          }
        });
      }
    });
    
    // Konversi ke HTML dengan <ul> dan <li>
    if (formattedLines.length === 0) return '';
    
    const listItems = formattedLines
      .map(line => {
        // Hapus bullet di awal untuk dibuat sebagai <li>
        const content = line.startsWith('• ') ? line.substring(2) : line;
        return `<li>${content}</li>`;
      })
      .join('');
    
    return `<ul style="margin: 5px 0; padding-left: 20px;">${listItems}</ul>`;
  };

  // Generate preview HTML dari template asli - TANPA MENGUBAH STRUKTUR LAIN
  useEffect(() => {
    if (!formData || !template) return;

    const generatePreview = async () => {
      setLoading(true);
      try {
        // Gunakan template HTML yang sesuai - TIDAK MENGUBAH STRUKTUR ASLI
        let templateHtml = '';
        
        if (template === 'modern') {
          templateHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <title>CV</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; margin: 40px auto; max-width: 800px; color: #333; }
                    header { border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
                    h1 { margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; }
                    .contact { margin-top: 5px; color: #666; font-size: 0.9em; }
                    
                    .section { margin-bottom: 30px; }
                    .sec-head { 
                        display: flex; justify-content: space-between; align-items: center;
                        font-weight: 800; font-size: 14px; text-transform: uppercase; 
                        border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; 
                    }
                    .gpa { padding: 2px 6px; font-size: 14px; border-radius: 3px; }

                    .item { margin-bottom: 20px; }
                    .item-head { display: flex; justify-content: space-between; font-weight: 700; font-size: 16px; }
                    .item-sub { font-weight: 600; font-size: 14px; margin-bottom: 5px; }
                    
                    /* SKILL GRID */
                    .skill-list { list-style: none; padding: 0; }
                    .skill-row { margin-bottom: 10px; border-left: 3px solid #333; padding-left: 10px; }
                    .skill-n { font-weight: bold; display: block; }
                    .skill-d { font-size: 0.9em; color: #555; }
                    
                    /* BULLET POINTS - DIPERBAIKI */
                    ul { margin: 5px 0 15px 20px; padding: 0; }
                    li { margin-bottom: 6px; line-height: 1.4; list-style-type: disc; }
                </style>
            </head>
            <body>
                <header>
                    <h1>${formData.name || 'Your Name'}</h1>
                    <div class="contact">
                        ${formData.email || ''} | ${formData.phone || ''}
                        ${formData.linkedin ? ` | ${formData.linkedin}` : ''}
                        ${formData.portfolio ? ` | ${formData.portfolio}` : ''}
                    </div>
                </header>

                ${formData.summary ? `
                <div class="section">
                    <div class="sec-head">Summary</div>
                    ${formatDescription(formData.summary)}
                </div>
                ` : ''}

                ${formData.experience && formData.experience.length > 0 ? `
                <div class="section">
                    <div class="sec-head">Experience</div>
                    ${formData.experience.map(exp => `
                        <div class="item">
                            <div class="item-head">
                                <span>${exp.job_title || ''}</span>
                                <span style="font-weight: 400; font-size: 0.9em; color: #666;">${exp.start_date || ''} - ${exp.end_date || ''}</span>
                            </div>
                            <div class="item-sub">${exp.company_name || ''}</div>
                            ${formatDescription(exp.description)}
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${formData.education && formData.education.length > 0 ? `
                <div class="section">
                    <div class="sec-head">
                        Education
                        ${formData.education[0]?.gpa ? `<span class="gpa">GPA: ${formatGPA(formData.education[0].gpa, formData.education[0].gpa_max)}</span>` : ''}
                    </div>
                    ${formData.education.map(edu => `
                        <div class="item">
                            <div class="item-head">
                                <span>${edu.degree || ''}</span>
                                <span style="font-weight: 400;">${edu.graduation_year || ''}</span>
                            </div>
                            <div class="item-sub">${edu.university || ''}, ${edu.major || ''}</div>
                    `).join('')}
                </div>
                ` : ''}

                ${formData.skills && formData.skills.length > 0 ? `
                <div class="section">
                    <div class="sec-head">Skills</div>
                    <ul class="skill-list">
                        ${formData.skills.map(skill => `
                            <li class="skill-row">
                                <span class="skill-n">${skill.name || ''} ${skill.year ? `<span style="font-weight:400; color:#777;">(${skill.year})</span>` : ''}</span>
                                <span class="skill-d">${skill.elaboration || skill.description || ''}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
            </body>
            </html>
          `;
// --- 2. TEMPLATE CLASSIC ---
        } else if (template === 'classic') {
          templateHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <style>
                    body { font-family: 'Times New Roman', serif; line-height: 1.4; margin: 40px auto; max-width: 700px; color: #333; }
                    header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #333; padding-bottom: 20px; }
                    h1 { margin: 0; font-size: 28px; font-weight: normal; text-transform: uppercase; }
                    .contact-info { margin-top: 8px; color: #666; font-size: 0.9em; font-style: italic; }
                    .section { margin-top: 25px; }
                    .section-header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #ddd; margin-bottom: 12px; padding-bottom: 5px; }
                    h2 { font-size: 16px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
                    .gpa-header { font-size: 14px; font-weight: bold; }
                    .entry { margin-bottom: 15px; }
                    .entry-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; }
                    .entry-subheader { font-style: italic; margin-bottom: 4px; }
                    .date { font-weight: normal; color: #666; font-size: 0.9em; }
                    ul { margin: 5px 0 15px 20px; padding: 0; }
                    li { margin-bottom: 5px; line-height: 1.3; list-style-type: disc; }
                   /* FIXED SKILL STYLES UNTUK MENYAMAI PDF */
                    .skill-item { margin-bottom: 10px; }
                    .skill-title { font-weight: bold; font-size: 1.05em; }
                    .skill-desc { display: block; margin-top: 2px; color: #444; font-size: 0.95em; }
                </style>
            </head>
            <body>
                <header>
                    <h1>${formData.name || 'Your Name'}</h1>
                    <div class="contact-info">
                        ${formData.email || ''} | ${formData.phone || ''}
                        ${formData.linkedin ? ` | ${formData.linkedin}` : ''}
                        ${formData.portfolio ? ` | ${formData.portfolio}` : ''}
                    </div>
                </header>

                ${formData.summary ? `
                <div class="section">
                    <h2>Professional Summary</h2>
                    <div style="border-top: 1px solid #ddd; margin-top: 5px; margin-bottom: 10px;"></div>
                    ${formatDescription(formData.summary)}
                </div>` : ''}

                ${formData.experience && formData.experience.length > 0 ? `
                <div class="section">
                    <h2>Professional Experience</h2>
                    <div style="border-top: 1px solid #ddd; margin-top: 5px; margin-bottom: 10px;"></div>
                    ${formData.experience.map(exp => `
                        <div class="entry">
                            <div class="entry-header">
                                <span>${exp.job_title || ''}</span>
                                <span class="date">${exp.start_date || ''} – ${exp.end_date || ''}</span>
                            </div>
                            <div class="entry-subheader">${exp.company_name || ''}</div>
                            ${formatDescription(exp.description)}
                        </div>
                    `).join('')}
                </div>` : ''}

                ${formData.education && formData.education.length > 0 ? `
                <div class="section">
                    <div class="section-header">
                        <h2>Education</h2>
                        ${formData.education[0]?.gpa ? `<span class="gpa-header">GPA: ${formatGPA(formData.education[0].gpa, formData.education[0].gpa_max)}</span>` : ''}
                    </div>
                    ${formData.education.map(edu => `
                        <div class="entry">
                            <div class="entry-header">
                                <span>${edu.degree || ''}</span>
                                <span class="date">${edu.graduation_year || ''}</span>
                            </div>
                            <div class="entry-subheader">${edu.university || ''}, ${edu.major || ''}</div>
                        </div>
                    `).join('')}
                </div>` : ''}

               ${formData.skills && formData.skills.length > 0 ? `
                <div class="section">
                    <div class="section-header">
                        <h2>Skills</h2>
                    </div>
                    <div style="margin-top: 10px;">
                        ${formData.skills.map(skill => `
                            <div class="skill-item">
                                <div>
                                    <span class="skill-title">${skill.name || ''}</span>
                                    ${skill.year ? `<span>(${skill.year})</span>` : ''}
                                </div>
                                <div class="skill-desc">
                                    ${skill.elaboration ? `• ${skill.elaboration}` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}
            </body>
            </html>
          `;
        
        // --- 3. TEMPLATE MINIMALIST ---
        } else if (template === 'minimalist') {
          templateHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px auto; max-width: 800px; color: #333; }
                    header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 20px; margin-bottom: 30px; }
                    h1 { margin: 0; font-size: 26px; color: #2c3e50; }
                    .contact { color: #7f8c8d; font-size: 0.9em; margin-top: 5px; }
                    .section { margin-bottom: 25px; }
                    .section-title { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: bold; color: #2c3e50; text-transform: uppercase; border-bottom: 2px solid #2c3e50; padding-bottom: 5px; margin-bottom: 15px; }
                    .gpa { font-size: 14px; text-transform: none; font-weight: bold; }
                    .job { margin-bottom: 15px; }
                    .job-header { display: flex; justify-content: space-between; font-weight: bold; }
                    .job-sub { color: #000000; font-style: italic; margin-bottom: 5px; }
                    ul { margin: 5px 0 10px 20px; padding: 0; }
                    li { margin-bottom: 5px; line-height: 1.4; list-style-type: disc; }
                    /* Tambahan Style Skills Minimalist */
                    .mini-skill-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
                </style>
            </head>
            <body>
                <header>
                    <h1>${formData.name || 'Your Name'}</h1>
                    <div class="contact">
                        ${formData.email || ''} • ${formData.phone || ''}
                        ${formData.linkedin ? ` • ${formData.linkedin}` : ''}
                        ${formData.portfolio ? ` • ${formData.portfolio}` : ''}
                    </div>
                </header>

                ${formData.summary ? `
                <div class="section">
                    <div class="section-title">Professional Summary</div>
                    ${formatDescription(formData.summary)}
                </div>` : ''}

                ${formData.experience && formData.experience.length > 0 ? `
                <div class="section">
                    <div class="section-title">Experience</div>
                    ${formData.experience.map(exp => `
                        <div class="job">
                            <div class="job-header">
                                <span>${exp.job_title || ''}</span>
                                <span>${exp.start_date || ''} - ${exp.end_date || ''}</span>
                            </div>
                            <div class="job-sub">${exp.company_name || ''}</div>
                            ${formatDescription(exp.description)}
                        </div>
                    `).join('')}
                </div>` : ''}

                ${formData.education && formData.education.length > 0 ? `
                <div class="section">
                    <div class="section-title">
                        Education
                        ${formData.education[0]?.gpa ? `<span class="gpa">GPA: ${formatGPA(formData.education[0].gpa, formData.education[0].gpa_max)}</span>` : ''}
                    </div>
                    ${formData.education.map(edu => `
                        <div class="job">
                            <div class="job-header">
                                <span>${edu.degree || ''}</span>
                                <span>${edu.graduation_year || ''}</span>
                            </div>
                            <div class="job-sub">${edu.university || ''} - ${edu.major || ''}</div>
                        </div>
                    `).join('')}
                </div>` : ''}

                ${formData.skills && formData.skills.length > 0 ? `
                <div class="section">
                    <div class="section-title">Skills</div>
                    <div class="mini-skill-grid">
                        ${formData.skills.map(skill => `
                            <div class="mini-skill-item">
                                <div style="font-weight: bold; color: #2c3e50;">
                                    ${skill.name || ''} 
                                    <span style="font-weight: normal; font-size: 0.9em; color: #7f8c8d;">(${skill.year})</span>
                                </div>
                                <div style="font-size: 0.9em; margin-top: 4px; color: #444;">
                                    ${skill.elaboration ? `• ${skill.elaboration}` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}
            </body>
            </html>
          `;
        }

        setPreviewHtml(templateHtml);
      } catch (error) {
        console.error('Error generating preview:', error);
      } finally {
        setLoading(false);
      }
    };

    generatePreview();
  }, [formData, template]);

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header Info - TIDAK BERUBAH */}
      <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">Live Preview</h3>
          <div className="text-sm text-gray-500">
            Template: <span className="font-semibold capitalize">{template || 'Select Template'}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Real-time preview of your CV. Scroll to see more.
        </p>
        {loading && (
          <div className="mt-2 text-blue-600 text-sm flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Generating preview...</span>
          </div>
        )}
      </div>

      {/* Preview Content - TIDAK BERUBAH */}
      <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-gray-50">
        <div className="h-full overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          ) : previewHtml ? (
            <div 
              className="bg-white p-6 rounded-lg shadow-sm mx-auto"
              style={{ 
                maxWidth: '800px',
                minHeight: 'auto',
                width: '100%',
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-5xl mb-4">📄</div>
                <p>No data available for preview</p>
                <p className="text-sm mt-2">Fill in the form to see your CV preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LivePreview;