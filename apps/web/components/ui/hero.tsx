"use client";

import Image from "next/image";
import Navbar from "../navbar";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <Image
        src="/bg/hero.jpg"
        alt="PayStay property booking background"
        fill
        priority
        quality={100}
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/15" />

      <Navbar />

      <div className="relative z-10 grid min-h-[calc(100vh-88px)] items-center px-4 pb-12 pt-6 sm:px-6 sm:pb-14 md:px-8 md:pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 xl:px-16">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium tracking-[0.2em] text-white/85 backdrop-blur-md sm:text-sm">
            BOOK STAYS • PAY SECURELY • TRAVEL EASILY
          </p>

          <h2 className="font-serif text-4xl leading-tight tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
            Discover, Book, and Pay for Your Perfect Stay
          </h2>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-10">
            <button className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90">
              Book Now
            </button>

            <button className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/15">
              Explore Stays
            </button>
          </div>
        </div>

        <div className="hidden lg:block" />
      </div>
    </section>
  );
};

export default Hero;
