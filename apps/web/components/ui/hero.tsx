"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "/", active: true },
  { label: "Listing", href: "#listing", hasMenu: true },
  { label: "Property", href: "#property", hasMenu: true },
  { label: "Pages", href: "#pages", hasMenu: true },
];

const propertyDetails = ["4 Bed", "2 Bathroom", "6x7.5 m2"];

const HomeIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
    <path
      d="M4.75 19.25V10.7L12 5l7.25 5.7v8.55"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path
      d="M9.25 19.25v-5.1h5.5v5.1"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
    <path
      d="M7 17 17 7M9 7h8v8"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const LockIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
    <path
      d="M7.75 10.75V8.5a4.25 4.25 0 0 1 8.5 0v2.25"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
    />
    <path
      d="M6.75 10.75h10.5v8.5H6.75z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const TuneIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
    <path
      d="M5 7h14M8 12h8M10 17h4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
    />
  </svg>
);

const PinIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
    <path
      d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11z"
      fill="currentColor"
    />
    <circle cx="12" cy="10" fill="white" r="2" />
  </svg>
);

const PropertyIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
    <path
      d="M4.75 19.25V10.5L12 5l7.25 5.5v8.75"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path
      d="M9.25 19.25v-5h5.5v5M8.5 11.5h7"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const BedIcon = () => (
  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
    <path
      d="M4.75 17.25v-9.5M19.25 17.25v-5.5H4.75v5.5M7 11.75V9.5h4.25v2.25"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const BathIcon = () => (
  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
    <path
      d="M6.75 11.25V7.5a2.75 2.75 0 0 1 5.5 0v.25M4.75 11.25h14.5v2.5a5.25 5.25 0 0 1-5.25 5.25h-4a5.25 5.25 0 0 1-5.25-5.25v-2.5z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const DiamondIcon = () => (
  <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
    <path
      d="m12 4.75 7.25 7.25L12 19.25 4.75 12 12 4.75z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const SearchField = ({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) => (
  <button
    className="flex h-11 w-full items-center justify-between rounded-full border border-black/15 bg-white px-3 text-left text-sm font-semibold text-black transition hover:border-black/35 focus:outline-none focus:ring-4 focus:ring-black/10"
    type="button"
  >
    <span className="flex min-w-0 items-center gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black text-white">
        {icon}
      </span>
      <span className="truncate">{children}</span>
    </span>
    <ChevronDownIcon />
  </button>
);

const Hero = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <section className="min-h-screen bg-white text-black">
      <div className="flex min-h-screen w-full flex-col bg-white p-4 sm:p-5 lg:p-6">
        <header className="flex items-center justify-between gap-4 pb-5">
          <Link className="flex items-center gap-3" href="/">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-black text-white">
              <HomeIcon />
            </span>
            <span className="text-lg font-bold tracking-tight">kasistay</span>
          </Link>

          <nav className="hidden items-center gap-10 text-sm font-medium text-black/75 lg:flex">
            {navItems.map((item) => (
              <Link
                className={`flex items-center gap-1.5 transition hover:text-black ${
                  item.active ? "text-black underline underline-offset-4" : ""
                }`}
                href={item.href}
                key={item.label}
              >
                {item.label}
                {item.hasMenu ? <ChevronDownIcon /> : null}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              className="hidden items-center gap-1.5 text-sm font-medium text-black transition hover:text-black/65 md:flex"
              href="/login"
            >
              <LockIcon />
              Login / Sign up
            </Link>
            <Link
              className="hidden h-11 items-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/80 sm:flex"
              href="#listing"
            >
              Add Listing
              <ArrowUpRightIcon />
            </Link>
            <button
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="grid h-11 w-11 place-items-center rounded-full border border-black/20 bg-white text-black transition hover:bg-black hover:text-white focus:outline-none focus:ring-4 focus:ring-black/10 lg:hidden"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              type="button"
            >
              {isMobileMenuOpen ? (
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </button>

            <button
              aria-label="Open filters"
              className="hidden h-11 w-11 place-items-center rounded-full border border-black/20 bg-white text-black transition hover:bg-black hover:text-white focus:outline-none focus:ring-4 focus:ring-black/10 lg:grid"
              type="button"
            >
              <TuneIcon />
            </button>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="mb-5 rounded-2xl border border-black/15 bg-white p-4 shadow-lg shadow-black/10 lg:hidden">
            <nav className="flex flex-col gap-3 text-sm font-medium text-black/75">
              {navItems.map((item) => (
                <Link
                  className="rounded-lg px-2 py-1.5 transition hover:bg-black/5 hover:text-black"
                  href={item.href}
                  key={item.label}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                className="flex h-11 items-center justify-center rounded-full border border-black/20 text-sm font-semibold text-black transition hover:bg-black/5"
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login / Sign up
              </Link>
              <Link
                className="flex h-11 items-center justify-center rounded-full bg-black text-sm font-semibold text-white transition hover:bg-black/85"
                href="#listing"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Add Listing
              </Link>
            </div>
          </div>
        )}

        <div className="relative isolate flex flex-1 overflow-hidden rounded-[1.8rem] bg-black">
          <Image
            alt="Modern property surrounded by greenery"
            className="object-cover object-center"
            fill
            priority
            quality={100}
            sizes="100vw"
            src="/bg/hero.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/80" />
          <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-black/35 via-black/15 to-transparent" />

          <div className="relative z-10 grid min-h-[620px] w-full items-end gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_440px] lg:items-center lg:p-14 xl:p-16">
            <div className="max-w-[760px] self-end pb-0 lg:pb-10">
              <h1 className="font-serif text-5xl leading-[0.96] tracking-tight text-white sm:text-6xl md:text-7xl xl:text-8xl">
                Buy,Rent, &amp; Sell
                <br />
                Property
              </h1>

              <Link
                className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black shadow-lg shadow-black/15 transition hover:bg-[#f4f1e8]"
                href="#property"
              >
                Explore All Property
                <ArrowUpRightIcon />
              </Link>
            </div>

            <form className="w-full rounded-[1.6rem] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8 lg:self-center">
              <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                Find your Best Property
                <br />
                what do you want!
              </h2>

              <div className="mt-7 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-black/40">
                    Location
                  </span>
                  <SearchField icon={<PinIcon />}>Stockholm, Sweden</SearchField>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-black/40">
                    Property Type
                  </span>
                  <SearchField icon={<PropertyIcon />}>
                    Apartment Name
                  </SearchField>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {propertyDetails.map((detail, index) => (
                    <button
                      className="flex h-10 min-w-0 items-center justify-center gap-2 rounded-full bg-black/[0.03] px-2 text-xs font-semibold text-black/80 transition hover:bg-black/10"
                      key={detail}
                      type="button"
                    >
                      {index === 0 ? <BedIcon /> : null}
                      {index === 1 ? <BathIcon /> : null}
                      {index === 2 ? <DiamondIcon /> : null}
                      <span className="truncate">{detail}</span>
                    </button>
                  ))}
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-black/40">
                    Max Price
                  </span>
                  <div className="flex h-11 items-center gap-3 rounded-full border border-black/15 bg-white px-3 text-sm font-semibold text-black">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-black text-white">
                      <PinIcon />
                    </span>
                    590.00 max
                  </div>
                </label>
              </div>

              <button
                className="mt-7 h-12 w-full rounded-full bg-[#ff642f] text-sm font-bold text-white shadow-lg shadow-[#ff642f]/25 transition hover:bg-[#eb5422] focus:outline-none focus:ring-4 focus:ring-[#ff642f]/25"
                type="button"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
