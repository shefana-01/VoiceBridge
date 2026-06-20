import React from 'react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto w-full pb-20 animate-[fadeIn_0.3s_ease-out]">
      <header className="mb-10 text-center">
        <h1 className="font-serif-display text-4xl md:text-5xl font-bold text-primary mb-4">
          VoiceBridge
        </h1>
        <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
          Connecting Voices, Building Futures. An Open-Source Communication Platform for Every Child.
        </p>
      </header>

      <div className="glass-card rounded-[2rem] border border-white/20 p-6 md:p-10 shadow-xl overflow-hidden mb-10">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">volunteer_activism</span> 
                Our Mission
              </h2>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                This project was born out of a personal journey supporting a loved one with autism, coupled with years of dedicated research. We recognized a heartbreaking gap: many assistive communication tools are incredibly expensive, locked to specific high-end devices, and often only support English. VoiceBridge was created to change that—ensuring that no family is left behind, regardless of their location or resources.
              </p>
            </div>

            <div className="p-5 bg-primary-container/30 rounded-2xl border border-primary/10">
              <h3 className="font-bold text-primary text-lg mb-2">Why it matters</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Communication is a fundamental human right. VoiceBridge is completely <strong>free</strong>, runs seamlessly on affordable everyday Android tablets, fully supports native languages like Bangla, and works entirely <strong>offline</strong> once set up. It puts the power of expression directly into the hands of those who need it most, using the comforting voices of their own family.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-5/12 shrink-0">
            <div className="aspect-square bg-surface-container rounded-2xl overflow-hidden shadow-lg border border-outline-variant relative">
              <img 
                src="/voicebridge-hero.png" 
                alt="VoiceBridge - Children using AAC device with caregiver" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuD_4PWmZ-0nCsZ6edf5iXGGOwdnfekV-dyb4r5NPCKZqMDNuJpN0d7Au1LDy2AYlpBduY_2y6JHCIXUeXgHi_schp9M59u2falVJpaMr1vrpAI9xFullCRKufMRByHD7b4Fd8VRszK0MaxBuofUzdcg-1a7s102PGD_Yg-N02KBivFs0p9SY3CJIwBS4U770khGppnKF6kdqbdkT6PzkdbFLs8U-mP3KKteIVtRCwNak_Or6abPsXXO_JLUYUg0JHzfrH2Ga831Y7A";
                }}
              />
            </div>
          </div>

        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Web Portal Features */}
        <div className="vb-card flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-2xl">computer</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface">For Caregivers & Parents</h2>
          <ul className="space-y-4 text-on-surface-variant">
            <li className="flex gap-3"><span className="text-secondary mt-1">✨</span> <strong>Personalized Boards:</strong> A simple, visual drag-and-drop tool to create custom communication boards tailored perfectly to your child's daily routine.</li>
            <li className="flex gap-3"><span className="text-secondary mt-1">✨</span> <strong>Familiar Voices:</strong> Upload your own photos and record your own voice in your mother tongue, so your child hears a comforting, recognizable voice.</li>
            <li className="flex gap-3"><span className="text-secondary mt-1">✨</span> <strong>Care Journal:</strong> Track your child's progress, view daily insights, and maintain a mindful daily diary of their milestones.</li>
            <li className="flex gap-3"><span className="text-secondary mt-1">✨</span> <strong>Community Hub:</strong> Connect with other caregivers to share, browse, and easily download helpful pre-made board templates.</li>
          </ul>
        </div>

        {/* Android Tablet Features */}
        <div className="vb-card flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-2xl">tablet_android</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface">For the Child</h2>
          <ul className="space-y-4 text-on-surface-variant">
            <li className="flex gap-3"><span className="text-tertiary mt-1">📱</span> <strong>Instant Voice Feedback:</strong> The app speaks immediately when an icon is tapped, helping children build strong associations between pictures and words.</li>
            <li className="flex gap-3"><span className="text-tertiary mt-1">📱</span> <strong>Sentence Builder:</strong> Children can tap multiple icons to compose a full phrase, then press "Speak" to play the entire sequence out loud.</li>
            <li className="flex gap-3"><span className="text-tertiary mt-1">📱</span> <strong>Works Offline:</strong> No internet connection is needed for your child to use the app, making it reliable anywhere you go.</li>
            <li className="flex gap-3"><span className="text-tertiary mt-1">📱</span> <strong>Safe Kiosk Mode:</strong> Keeps your child safely inside the app without accidentally closing it or getting distracted by other programs.</li>
          </ul>
        </div>

        {/* Security & Privacy */}
        <div className="vb-card md:col-span-2 flex flex-col md:flex-row gap-8 items-center bg-surface-container-low border border-outline-variant">
          <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">shield_locked</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Absolute Privacy & Security</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Your child's data is fiercely protected. We use industry-standard encryption to ensure that only <strong>you</strong> have access to your child's custom boards, audio recordings, and personal journal entries. Your custom assets are securely backed up in the cloud, so you never lose your child's voice even if a tablet is lost or broken.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
