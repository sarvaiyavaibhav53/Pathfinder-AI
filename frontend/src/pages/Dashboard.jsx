import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SideNavBar from '../components/SideNavBar';
import { useDomain } from '../context/DomainContext';
import { useDashboardData } from '../context/DashboardDataContext';
import ChatWidget from '../components/ChatWidget';

const Dashboard = () => {
  const navigate = useNavigate();
  const { domain, setDomain } = useDomain();
  const {
    availableDomains,
    analyticsSummary,
    domainAnalytics,
    roleFit,
    roadmap,
    loadingStats,
    loadingRoleFit,
  } = useDashboardData();

  // Helper values for dynamic calculations
  const matchConfidence = roleFit ? Math.round(roleFit.confidence * 100) : 0;
  const confidenceRatio = roleFit ? roleFit.confidence : 0.5;

  // Dynamic topography curve calculation
  const curveY1 = 200 - Math.round(confidenceRatio * 30);
  const curveY2 = 150 - Math.round(confidenceRatio * 40);
  const curveY3 = 100 - Math.round(confidenceRatio * 50);

  return (
    <div className="font-body-md text-body-md antialiased overflow-x-hidden min-h-screen bg-surface">
      <Navbar showNavLinks={false} />
      <SideNavBar />

      <main className="lg:ml-64 pt-24 md:pt-28 pb-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/20 pb-6">
          <div>
            <h1 className="text-headline-xl font-headline-xl text-on-surface mb-2 font-bold">Welcome back.</h1>
            <p className="text-body-lg font-body-lg text-secondary">Your career topography is shifting.</p>
          </div>
        </header>

        {/* AI Predicted Best-Fit Role Hero Section */}
        {loadingRoleFit ? (
           <div className="bg-surface rounded-2xl p-8 elevation-1 mb-8 flex items-center justify-center text-secondary border border-outline-variant/30">
             <span className="material-symbols-outlined animate-spin mr-3 text-primary text-[24px]">progress_activity</span> 
             Predicting your best-fit role...
           </div>
        ) : roleFit ? (
          <section className="bg-gradient-to-r from-primary/10 via-surface-bright to-surface rounded-2xl p-6 md:p-8 elevation-2 mb-8 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
            <div className="flex-1">
              <div className="text-data-sm font-bold text-primary mb-1 flex items-center gap-1.5 tracking-wider uppercase">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                AI Predicted Best-Fit Role
              </div>
              <h2 className="text-headline-xl font-headline-xl text-on-surface font-extrabold my-2">{roleFit.predicted_role}</h2>
              <p className="text-body-md text-on-surface-variant font-medium max-w-xl">
                This is the role your skills currently match best, out of the roles tracked in {domain || 'your domain'}.
              </p>
            </div>

            {/* Radial Match Score Progress Ring */}
            <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-highest"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeDasharray={`${matchConfidence}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-headline-md font-bold text-primary">{matchConfidence}%</span>
                  <span className="text-[10px] uppercase font-bold text-secondary tracking-tighter">Match</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/roadmap')} 
                className="bg-primary text-on-primary px-6 py-3 rounded-xl font-data-sm text-data-sm font-bold hover:bg-surface-tint transition-all duration-200 elevation-1 flex items-center gap-2 shadow-md hover:-translate-y-0.5"
              >
                Build Roadmap <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </section>
        ) : null}

        {/* Domain selector container directly below Hero Section */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-surface-bright rounded-xl p-3 border border-outline-variant/40 elevation-1 w-fit">
          <div className="flex items-center gap-1.5 text-data-sm font-data-sm font-bold text-secondary uppercase tracking-wider px-1">
            <span className="material-symbols-outlined text-[18px] text-primary">tune</span>
            Viewing Domain:
          </div>
          <select 
            className="bg-surface border border-outline-variant/40 rounded-lg px-3 py-1.5 text-data-lg font-data-lg text-primary font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            {availableDomains.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
            {availableDomains.length === 0 && <option>{domain}</option>}
          </select>
        </div>

        {/* 3-Stat Cards Grid (No Salary Display) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Jobs Analyzed */}
          <div className="bg-surface rounded-xl p-6 elevation-1 flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-body-sm font-body-sm font-semibold text-secondary uppercase tracking-wider">Jobs Analyzed</span>
              <span className="material-symbols-outlined text-waypoint">radar</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-headline-xl font-headline-xl text-on-surface font-bold">
                {loadingStats ? '...' : domainAnalytics?.jobs || analyticsSummary?.total_jobs || 0}
              </span>
              <span className="text-secondary text-body-sm font-body-sm mb-2">in {domain}</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-4">
              <div className="bg-waypoint h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Card 2: Skills Matched */}
          <div className="bg-surface rounded-xl p-6 elevation-1 flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-body-sm font-body-sm font-semibold text-secondary uppercase tracking-wider">Skills Matched</span>
              <span className="material-symbols-outlined text-success">verified</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-headline-xl font-headline-xl text-on-surface font-bold">
                {loadingRoleFit ? '...' : (roadmap?.recognized_skills?.length || 0)}
              </span>
              <span className="text-secondary text-body-sm font-body-sm mb-2">active skills</span>
            </div>
            <div className="mt-4 flex gap-2 items-center">
              <span className="skill-chip px-2.5 py-1 bg-success/10 rounded text-data-sm font-bold text-success border border-success/20">
                {loadingRoleFit ? '...' : `${matchConfidence}% profile fit`}
              </span>
            </div>
          </div>

          {/* Card 3: Top Demand Skills (Top 3 Stacked List) */}
          <div className="bg-surface rounded-xl p-6 elevation-1 flex flex-col justify-between border border-outline-variant/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-sm font-body-sm font-semibold text-secondary uppercase tracking-wider">Top Demand Skills</span>
              <span className="material-symbols-outlined text-warning">local_fire_department</span>
            </div>
            <div className="flex-1 flex flex-col gap-2 justify-center">
              {loadingStats ? (
                <div className="text-secondary text-body-sm">Loading skills...</div>
              ) : domainAnalytics?.top_skills?.length > 0 ? (
                domainAnalytics.top_skills.slice(0, 3).map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-bright transition-colors cursor-pointer group"
                    onClick={() => navigate(`/skill-insight?skill=${encodeURIComponent(item.skill)}`)}
                  >
                    <span className="font-bold text-on-surface text-body-sm group-hover:text-primary transition-colors truncate">
                      {item.skill}
                    </span>
                    <span className="text-data-sm font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded text-xs shrink-0 ml-2">
                      {item.count} jobs
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-secondary text-body-sm">No skill data available</div>
              )}
            </div>
            <div className="mt-2 text-right">
              <Link className="text-body-sm font-body-sm text-waypoint font-semibold hover:underline" to="/skill-insight">
                View all insight →
              </Link>
            </div>
          </div>
        </section>

        {/* Data-Driven Career Topography Graph (3-Step Progress Stepper) */}
        <section className="bg-surface rounded-2xl p-1 elevation-1 mb-8 overflow-hidden border border-outline-variant/20">
          <div className="bg-surface-bright rounded-xl p-6 relative elevation-2 flex flex-col gap-6">
            <div className="flex justify-between items-start z-10">
              <div>
                <h2 className="text-headline-md font-headline-md text-on-surface font-bold">Career Topography</h2>
                <p className="text-body-sm text-secondary mt-1">
                  Your path from current skills ({roadmap?.recognized_skills?.length || 0}) to {roleFit?.predicted_role || 'target role'}, based on {roadmap?.missing_skills?.length || 0} missing skills.
                </p>
              </div>
              <button className="text-primary text-body-sm font-body-sm font-semibold flex items-center gap-1 hover:underline shrink-0" onClick={() => navigate('/roadmap')}>
                Detailed view <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </button>
            </div>

            {/* Horizontal 3-Step Progress Stepper */}
            <div className="py-4 px-4 sm:px-8 relative z-10">
              {/* Connecting Progress Line */}
              <div className="relative w-full mb-8">
                <div className="w-full bg-surface-container-highest h-2 rounded-full"></div>
                <div 
                  className="bg-gradient-to-r from-primary via-waypoint to-tertiary h-2 rounded-full absolute top-0 left-0 transition-all duration-700 ease-out" 
                  style={{ width: `${Math.min(100, Math.max(10, matchConfidence))}%` }}
                ></div>
              </div>

              {/* 3 Step Nodes */}
              <div className="grid grid-cols-3 gap-4">
                {/* Step 1: Current Skills */}
                <div className="flex flex-col items-center text-center group cursor-pointer" onClick={() => navigate('/profile')}>
                  <div className="w-10 h-10 rounded-full bg-surface border-4 border-primary elevation-1 flex items-center justify-center mb-2 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                  <span className="font-bold text-on-surface text-body-md">Current Skills</span>
                  <span className="text-data-sm font-bold text-primary mt-0.5">
                    {roadmap?.recognized_skills?.length || 0} active skills
                  </span>
                </div>

                {/* Step 2: Next Skill */}
                <div className="flex flex-col items-center text-center group cursor-pointer" onClick={() => navigate('/roadmap')}>
                  <div className="w-10 h-10 rounded-full bg-surface border-4 border-waypoint elevation-1 flex items-center justify-center mb-2 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-waypoint"></div>
                  </div>
                  <span className="font-bold text-on-surface text-body-md truncate max-w-full">
                    {roadmap?.missing_skills?.[0]?.skill || 'Next Skill'}
                  </span>
                  <span className="text-data-sm font-semibold text-secondary mt-0.5">
                    {roadmap?.missing_skills?.length || 0} more to go
                  </span>
                </div>

                {/* Step 3: Target Role */}
                <div className="flex flex-col items-center text-center group cursor-pointer" onClick={() => navigate('/roadmap')}>
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center mb-2 shadow-md">
                    <span className="material-symbols-outlined text-[20px]">flag</span>
                  </div>
                  <span className="font-bold text-on-surface text-body-md truncate max-w-full">
                    {roleFit?.predicted_role || 'Target Role'}
                  </span>
                  <span className="text-data-sm font-bold text-success mt-0.5">
                    {matchConfidence}% match
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'radial-gradient(#191c1e 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          </div>
        </section>

        {/* Section: Missing Skills Checklist */}
        <section className="mb-8">
          <div className="bg-surface rounded-2xl p-6 elevation-1 flex flex-col border border-outline-variant/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-headline-md font-headline-md text-on-surface font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-waypoint">checklist</span>
                  Missing Skills Checklist
                </h3>
                <p className="text-body-sm text-secondary mt-1">Recommended skills to acquire for {roleFit?.predicted_role || 'your target role'}</p>
              </div>
              <button className="text-body-sm font-body-sm font-bold text-primary hover:underline" onClick={() => navigate('/roadmap')}>
                View Roadmap
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roadmap?.missing_skills?.length > 0 ? (
                roadmap.missing_skills.slice(0, 6).map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-3.5 rounded-xl bg-surface-bright hover:bg-surface-container-high border border-outline-variant/20 transition-all cursor-pointer group"
                    onClick={() => navigate(`/skill-insight?skill=${encodeURIComponent(item.skill)}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-waypoint/10 text-waypoint flex items-center justify-center font-bold text-data-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-on-surface text-body-md group-hover:text-primary transition-colors truncate">{item.skill}</h4>
                        <span className="text-data-sm text-secondary font-medium">Est. {item.estimated_learning_weeks || 1} weeks</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="px-2.5 py-1 bg-surface rounded text-data-sm font-bold text-waypoint border border-waypoint/20">
                        ROI: {Math.round(item.roi_score || 0)}
                      </span>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                        chevron_right
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-secondary text-center py-8 border border-dashed border-outline-variant/50 rounded-xl my-auto">
                  <span className="material-symbols-outlined text-3xl mb-1 text-success block">check_circle</span>
                  No skill gaps identified yet. Upload your resume or complete your profile!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Standalone Hiring Companies Banner Card */}
        <section className="mb-8">
          <div 
            onClick={() => navigate('/companies')}
            className="bg-gradient-to-r from-tertiary/10 via-surface-bright to-surface rounded-2xl p-6 elevation-1 border border-tertiary/20 flex items-center justify-between cursor-pointer hover:border-tertiary/40 hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[28px]">corporate_fare</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface text-body-lg group-hover:text-tertiary transition-colors">
                  See who's hiring in {domain || 'your domain'} →
                </h3>
                <p className="text-body-sm text-secondary">Browse active hiring organizations and open positions</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-tertiary group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </div>
        </section>

        {/* Action Banner */}
        <section className="flex justify-center my-12">
          <button className="bg-primary text-on-primary px-8 py-4 rounded-xl text-headline-md font-headline-md font-bold elevation-1 hover:bg-surface-tint hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-3" onClick={() => navigate('/roadmap')}>
            <span className="material-symbols-outlined text-[28px]">route</span>
            Generate My Roadmap
          </button>
        </section>
      </main>

      <ChatWidget
        pageType="dashboard"
        contextData={{
          domain: domain || undefined,
          roleFit: roleFit
            ? {
                predicted_role: roleFit.predicted_role || undefined,
                confidence: typeof roleFit.confidence === 'number' ? roleFit.confidence : undefined,
              }
            : undefined,
          recommendation: roadmap
            ? {
                match_percent: typeof roadmap.match_score === 'number' ? roadmap.match_score : undefined,
                missing_skills: Array.isArray(roadmap.missing_skills)
                  ? roadmap.missing_skills.map((s) => (typeof s === 'string' ? s : s.name || String(s)))
                  : undefined,
                companies_you_would_qualify_for: Array.isArray(roadmap.qualified_companies)
                  ? roadmap.qualified_companies.map((c) => (typeof c === 'string' ? c : c.name || String(c)))
                  : undefined,
              }
            : undefined,
        }}
      />
    </div>
  );
};

export default Dashboard;
