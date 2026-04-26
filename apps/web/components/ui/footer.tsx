"use client";

import Image from "next/image";

export const Footer = () => {
  const socialLinks = [
    {
      label: "Facebook",
      href: "#",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M13.57 21v-8.2h2.76l.42-3.2h-3.18V7.55c0-.92.26-1.54 1.59-1.54h1.69V3.15a22.6 22.6 0 0 0-2.46-.12c-2.43 0-4.1 1.48-4.1 4.2V9.6H7.5v3.2h2.79V21h3.28Z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "#",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      label: "X",
      href: "#",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="m4.2 4 6.77 9.02L4 20h1.58l6.1-6.35L16.43 20H20l-7.1-9.47L19.45 4h-1.57l-5.55 5.78L7.78 4H4.2Zm2.16 1.08h.9l10.56 13.84h-.9L6.36 5.08Z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: "#",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M6.94 8.5a1.88 1.88 0 1 1 0-3.75 1.88 1.88 0 0 1 0 3.75ZM5.3 19.5h3.3v-9h-3.3v9Zm5.18 0h3.3v-4.54c0-1.2.23-2.36 1.72-2.36 1.47 0 1.49 1.37 1.49 2.44v4.46H20.3v-5.1c0-2.5-.54-4.43-3.47-4.43-1.41 0-2.36.77-2.75 1.5h-.05v-1.28h-3.15v9.31Z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="mt-16 rounded-t-[2rem] bg-[#e5e5e5] px-4 pt-12 pb-5 text-[#171717] sm:px-6 md:px-8 lg:px-10 xl:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-black/15 pb-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#111111] text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4 11 8-7 8 7M6.5 9.8V19h11V9.8M9.5 19v-4.5h5V19"
                  />
                </svg>
              </span>
              <h2 className="text-xl font-semibold tracking-tight">KasiStay</h2>
            </div>

            <address className="not-italic text-sm leading-6 text-black/70">
              KasiStay Property Services
              <br />
              102 Jorissen Street, Braamfontein
              <br />
              Johannesburg, South Africa
            </address>
          </div>

          <nav aria-label="Host links" className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide">HOST WITH US</h3>
            <ul className="space-y-2 text-sm text-black/75">
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  Become a host
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  Pricing guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  Reviews
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  Host resources
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Booking links" className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide">BOOK, STAY &amp; MANAGE</h3>
            <ul className="space-y-2 text-sm text-black/75">
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  Find stays
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  Monthly rentals
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  Listings
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  Rental support
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company links" className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide">COMPANY</h3>
            <ul className="space-y-2 text-sm text-black/75">
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  About us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition hover:text-black focus-visible:outline-none focus-visible:underline"
                >
                  Investors
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 overflow-hidden rounded-sm border border-black/10">
          <Image
            src="/bg/hero.jpg"
            alt="KasiStay homes"
            width={1920}
            height={600}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            className="h-28 w-full object-cover object-center sm:h-36 md:h-44"
          />
        </div>

        <div className="mt-5 flex flex-col gap-4 text-xs text-black/75 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 KasiStay. All rights reserved.</p>

          <div className="flex items-center gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/20 text-black transition hover:border-black hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
