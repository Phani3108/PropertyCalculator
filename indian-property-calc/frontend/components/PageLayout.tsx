import React from 'react';
import Navbar from '@/components/Navbar';
import Head from 'next/head';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  mainContentClass?: string;
  showDisclaimer?: boolean;
}

export function PageLayout({ 
  children, 
  title, 
  subtitle, 
  description,
  mainContentClass = 'main-content',
  showDisclaimer = true
}: PageLayoutProps) {
  return (
    <>
      {title && (
        <Head>
          <title>{title} | Indian Property Calculator</title>
          <meta name="description" content={description || `Indian Property Calculator - ${title}`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>
      )}
      
      <div className="container pb-8">
        <Navbar />
        
        {(title || subtitle) && (
          <header className="text-center mb-6 mt-4 text-white">
            {title && <h1 className="text-2xl md:text-3xl font-bold mb-1 text-shadow">{title}</h1>}
            {subtitle && <p className="text-sm md:text-base opacity-90">{subtitle}</p>}
          </header>
        )}
        
        <main className={mainContentClass}>
          {children}
        </main>
        
        {showDisclaimer && (
          <footer className="text-center text-white mt-12">
            <div className="max-w-3xl mx-auto">
              <div className="glass-effect p-4 rounded-lg text-left">
                <h3 className="text-sm font-medium mb-2">Disclaimer</h3>
                <p className="text-xs opacity-90">
                  The property cost estimates provided by this calculator are based on average prices and market trends.
                  Actual prices may vary based on specific property characteristics, location, and market conditions.
                  Please consult with local real estate professionals for precise estimates.
                </p>
                <ul className="pl-5 my-2 text-xs opacity-90">
                  <li className="my-1">EMI calculations are indicative and may vary based on bank policies.</li>
                  <li className="my-1">Material costs are averages and may fluctuate with market conditions.</li>
                  <li className="my-1">Eligibility for subsidies should be verified with respective authorities.</li>
                </ul>
                <p className="text-xs text-center mt-3 opacity-90">
                  All data is processed locally on your device. No personal information is stored or shared.
                </p>
              </div>
              
              <div className="text-center mt-4 pt-4 border-t border-white/20">
                <p className="text-xs opacity-80">
                  © {new Date().getFullYear()} Indian Property Calculator | 
                  <a href="#" className="text-blue-200 ml-1 hover:underline">
                    Terms of Use
                  </a>
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}
