"use client";

import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative z-10 px-4 py-4 sm:px-6 md:px-8 lg:px-10 xl:px-16">
      <div className="flex items-center justify-between gap-4">
        <div className="shrink-0">
          <h1 className="text-xl font-black tracking-[0.3em] text-white sm:text-2xl">
            PAYSTAY
          </h1>
        </div>

        <nav className="hidden items-center gap-6 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm text-white/85 backdrop-blur-md md:flex lg:gap-8 xl:px-8">
          <a href="#" className="transition hover:text-white">
            Home
          </a>
          <a href="#" className="transition hover:text-white">
            Stays
          </a>
          <a href="#" className="transition hover:text-white">
            How It Works
          </a>
          <a href="#" className="transition hover:text-white">
            Payments
          </a>
          <a href="#" className="transition hover:text-white">
            About
          </a>
        </nav>

        <div className="hidden shrink-0 sm:block">
          <button className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:opacity-90 md:px-6 md:py-3">
            Book Now
          </button>
        </div>

        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="mt-4 rounded-3xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-3 text-sm text-white/90">
            <a href="#" className="transition hover:text-white">
              Home
            </a>
            <a href="#" className="transition hover:text-white">
              Stays
            </a>
            <a href="#" className="transition hover:text-white">
              How It Works
            </a>
            <a href="#" className="transition hover:text-white">
              Payments
            </a>
            <a href="#" className="transition hover:text-white">
              About
            </a>
          </nav>

          <button className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90">
            Book Now
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
