import { useState } from 'react';
import heroLight from '../../assets/images/hero.webp';
import heroDark from '../../assets/images/hero_dark.webp';
import SignupPopup from '../Signup';

export default function Hero() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <section className="py-6 lg:py-16">
      <div className="w-full max-w-[1300px] mx-auto px-4 flex flex-col-reverse lg:flex-row items-center justify-between gap-10">

        {/* Text Content */}
        <div className="text-center lg:text-left lg:w-7/12">
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight">
            Where developers<br />
            <span className="text-3xl md:text-6xl font-bold"> Build, Write, and Share</span>
          </h1>
          <p className="text-lg lg:text-xl mt-4">
            A space to share ideas, projects, lessons, and stories, and connect with a thriving global community of tech enthusiasts.
          </p>
          <button
            onClick={() => setShowSignup(true)}
            className="mt-6 lg:mt-8 px-6 py-2 border rounded-full hover:bg-white hover:text-[#1d3439] transition"
          >
            Join the community
          </button>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-sm mx-auto lg:mx-0 relative flex justify-center lg:justify-start">
          <img src={heroLight} alt="Hero" className="h-[40vh] dark:hidden" />
          <img
            src={heroDark}
            alt="Hero Dark"
            className="h-[40vh] hidden dark:block drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          />
        </div>
      </div>

      {showSignup && <SignupPopup onClose={() => setShowSignup(false)} />}
    </section>
  );
}
