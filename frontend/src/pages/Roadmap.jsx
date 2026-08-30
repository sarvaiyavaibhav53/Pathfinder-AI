import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';
import { fetchApi } from '../api/apiClient';
import { useDomain } from '../context/DomainContext';
import { useAuth } from '../context/AuthContext';
import ChatWidget from '../components/ChatWidget';

const Roadmap = () => {
  const navigate = useNavigate();
  const { domain } = useDomain();
  const { user } = useAuth();
  
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const targetDomain = domain || user?.profile?.preferred_field;

  const generateRoadmap = async () => {
    setIsLoading(true);
    setError('');
    try {
      const userSkills =
        user?.profile?.skills && user.profile.skills.length > 0
          ? user.profile.skills
          : (() => {
              try {
                const stored = localStorage.getItem('extractedResume');
                return stored ? JSON.parse(stored).skills || [] : [];
              } catch {
                return [];
              }
            })();

      if (!userSkills || userSkills.length === 0) {
        setRoadmap(null);
        setIsLoading(false);
        return;
      }

      if (!userSkills || userSkills.length === 0) {
        setError('No skills found in your profile. Please upload a resume or complete your profile to generate a roadmap.');
        setRoadmap(null);
        setIsLoading(false);
        return;
      }

      if (!targetDomain) {
        setError('No career domain specified. Please select a preferred field in your profile.');
        setRoadmap(null);
        setIsLoading(false);
        return;
      }

      const uniqueSkills = [...new Set(userSkills.map((s) => s.toLowerCase()))];

      const response = await fetchApi('/recommendation', {
        method: 'POST',
        body: JSON.stringify({
          target_domain: targetDomain,
          resume_skills: uniqueSkills,
        }),
      });
      setRoadmap(response);
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateRoadmap();
  }, [domain, user?.profile?.skills, user?.profile?.preferred_field]);

  const contourLineStyle = {
    backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10px, #c7c4d7 10px, #c7c4d7 20px)`,
    backgroundSize: '20px 2px',
    backgroundRepeat: 'repeat-x'
  };
  
  const contourLineActiveStyle = {
    backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 10px, #4648d4 10px, #4648d4 20px)`,
    backgroundSize: '20px 2px',
    backgroundRepeat: 'repeat-x'
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar showNavLinks={false} />
      <SideNavBar />

      <main className="flex-1 lg:ml-64 pt-24 px-margin-mobile md:px-margin-desktop pb-24 max-w-container-max mx-auto w-full relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-2">Career Trajectory</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Navigating towards your target in {targetDomain || 'your chosen domain'}
            </p>
          </div>
          <button 
            onClick={generateRoadmap}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-surface-bright border border-outline-variant rounded-full font-data-sm text-data-sm text-primary hover:bg-primary-container hover:text-on-primary-container transition-all shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_5px_rgba(163,177,198,0.4)] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">{isLoading ? 'hourglass_empty' : 'refresh'}</span>
            {isLoading ? 'Generating...' : 'Regenerate Roadmap'}
          </button>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-error/20 elevation-1">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-error">warning</span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold">Domain Unrecognized</h3>
                <p className="font-body-md text-body-md mt-1">
                  We couldn't generate a roadmap for this domain. Please check your profile's preferred field.
                </p>
              </div>
            </div>
            <Link
              to="/profile/edit"
              className="bg-error text-on-error px-5 py-2.5 rounded-lg font-data-sm text-data-sm hover:brightness-110 transition-all flex items-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile Domain
            </Link>
          </div>
        )}

        <div className="bg-surface rounded-2xl p-8 relative shadow-[4px_4px_10px_rgba(163,177,198,0.5),-4px_-4px_10px_rgba(255,255,255,0.8)] mb-12 overflow-x-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-surface-bright to-surface opacity-50"></div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-secondary">
               <span className="material-symbols-outlined animate-spin text-4xl mr-4">sync</span>
               Analyzing market topology and skill gaps...
            </div>
          ) : roadmap ? (
            <div className="relative z-10 py-6 px-4 sm:px-8">
              {/* Connecting Progress Bar */}
              <div className="relative w-full mb-8">
                <div className="w-full bg-surface-container-highest h-2 rounded-full"></div>
                <div 
                  className="bg-gradient-to-r from-primary via-waypoint to-tertiary h-2 rounded-full absolute top-0 left-0 transition-all duration-700 ease-out" 
                  style={{ width: `${Math.min(100, Math.max(10, Math.round(roadmap.match_score)))}%` }}
                ></div>
              </div>

              {/* 4 Node Stepper Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Node 1: Basecamp */}
                <div className="flex flex-col items-center text-center group cursor-pointer" onClick={() => navigate('/profile')}>
                  <div className="w-10 h-10 rounded-full bg-surface border-4 border-primary elevation-1 flex items-center justify-center mb-2 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                  <span className="font-bold text-on-surface text-body-md">Basecamp</span>
                  <span className="text-data-sm font-bold text-primary mt-0.5">
                    {roadmap.recognized_skills?.length || 0} active skills
                  </span>
                  <span className="text-xs text-success font-bold mt-0.5">
                    Match: {Math.round(roadmap.match_score)}%
                  </span>
                </div>

                {/* Node 2 & 3: Milestones */}
                {roadmap.missing_skills?.slice(0, 2).map((skill, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center text-center group cursor-pointer" 
                    onClick={() => navigate(`/skill-insight?skill=${encodeURIComponent(skill.skill)}`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-surface border-4 border-waypoint elevation-1 flex items-center justify-center mb-2 shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-waypoint"></div>
                    </div>
                    <span className="font-bold text-on-surface text-body-md truncate max-w-full">
                      {skill.skill}
                    </span>
                    <span className="text-data-sm font-semibold text-secondary mt-0.5">
                      ROI: {Math.round(skill.roi_score)}
                    </span>
                    <span className="text-xs text-secondary mt-0.5">Est. {skill.estimated_learning_weeks} wks</span>
                  </div>
                ))}

                {/* Node 4: Destination */}
                <div className="flex flex-col items-center text-center group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center mb-2 shadow-md">
                    <span className="material-symbols-outlined text-[20px]">flag</span>
                  </div>
                  <span className="font-bold text-on-surface text-body-md truncate max-w-full">
                    Target Destination
                  </span>
                  <span className="text-data-sm font-bold text-tertiary mt-0.5">
                    Domain Expert
                  </span>
                  <span className="text-xs text-secondary mt-0.5">{roadmap.estimated_learning_weeks} Wks Total</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-secondary">
              <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">route</span>
              <h3 className="text-headline-md font-headline-md text-on-surface mb-2">No Career Roadmap Generated Yet</h3>
              <p className="text-body-sm max-w-md mx-auto mb-6 text-on-surface-variant">
                Complete your profile or upload your resume to generate an AI-guided skill milestone trajectory.
              </p>
              <Link to="/profile/edit" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-data-sm text-data-sm hover:bg-surface-tint transition-all inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">edit</span> Complete Profile
              </Link>
            </div>
          )}
          
          {roadmap && roadmap.roadmap_narrative && (
             <div className="mt-8 p-6 bg-surface-bright rounded-xl elevation-2 border-l-4 border-primary">
               <h3 className="font-headline-md text-headline-md mb-4 flex items-center gap-2 text-on-surface font-bold">
                 <span className="material-symbols-outlined text-primary">psychology</span> AI Strategy Narrative
               </h3>
               {(() => {
                 const text = roadmap.roadmap_narrative;
                 const lines = text.split('\n').filter((l) => l.trim());
                 
                 const renderFormattedText = (rawStr) => {
                    const parts = rawStr.split(/(\*\*.*?\*\*|<b>.*?<\/b>|^[A-Za-z0-9\s/&+-]+:)/g);
                    return parts.map((part, partIdx) => {
                      if (!part) return null;
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={partIdx} className="font-semibold text-[#1E293B]">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      } else if (part.startsWith('<b>') && part.endsWith('</b>')) {
                        return (
                          <strong key={partIdx} className="font-semibold text-[#1E293B]">
                            {part.slice(3, -4)}
                          </strong>
                        );
                      } else if (partIdx === 1 && part.endsWith(':') && !part.includes('http')) {
                        return (
                          <strong key={partIdx} className="font-semibold text-[#1E293B] mr-1">
                            {part}
                          </strong>
                        );
                      }
                      return (
                        <span key={partIdx} className="text-[#1E293B]">
                          {part}
                        </span>
                      );
                    });
                  };

                  const bulletLines = lines.filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
                  const nonBulletLines = lines.filter((l) => !l.trim().startsWith('- ') && !l.trim().startsWith('* '));

                  return (
                    <div className="space-y-3 text-[#1E293B]">
                      {nonBulletLines.slice(0, 1).map((para, idx) => (
                        <p key={`head-${idx}`} className="font-body-md text-body-md text-[#1E293B] leading-[1.65]">
                          {renderFormattedText(para)}
                        </p>
                      ))}

                      {bulletLines.length > 0 && (
                        <ul className="list-disc pl-6 space-y-2.5 my-3 text-[#1E293B]">
                          {bulletLines.map((bLine, bIdx) => (
                            <li key={bIdx} className="text-[#1E293B] leading-[1.65]">
                              {renderFormattedText(bLine.trim().replace(/^[-*]\s+/, ''))}
                            </li>
                          ))}
                        </ul>
                      )}

                      {nonBulletLines.slice(1).map((para, idx) => (
                        <p key={`tail-${idx}`} className="font-body-md text-body-md text-[#1E293B] leading-[1.65]">
                          {renderFormattedText(para)}
                        </p>
                      ))}
                    </div>
                  );
                })()}
             </div>
          )}
        </div>
      </main>

      <ChatWidget
        pageType="roadmap"
        contextData={{
          domain: targetDomain || undefined,
          recommendation: roadmap
            ? {
                match_percent: typeof roadmap.match_score === 'number' ? roadmap.match_score : undefined,
                recognized_skills: Array.isArray(roadmap.recognized_skills)
                  ? roadmap.recognized_skills
                  : undefined,
                missing_skills: Array.isArray(roadmap.missing_skills)
                  ? roadmap.missing_skills.map((s) => (typeof s === 'string' ? s : s.skill || String(s)))
                  : undefined,
                learning_priority: Array.isArray(roadmap.learning_priority)
                  ? roadmap.learning_priority
                  : undefined,
                estimated_learning_weeks: typeof roadmap.estimated_learning_weeks === 'number'
                  ? roadmap.estimated_learning_weeks
                  : undefined,
                companies_you_would_qualify_for: Array.isArray(roadmap.qualified_companies)
                  ? roadmap.qualified_companies.map((c) => (typeof c === 'string' ? c : c.name || String(c)))
                  : undefined,
                roadmap_narrative: typeof roadmap.roadmap_narrative === 'string'
                  ? roadmap.roadmap_narrative
                  : undefined,
              }
            : undefined,
        }}
      />
    </div>
  );
};

export default Roadmap;
