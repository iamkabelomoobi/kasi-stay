"use client";

export const Footer = () => {
  return (
    <footer className="bg-[#050505] px-4 py-10 text-white sm:px-6 md:px-8 lg:px-10 xl:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <div>
            <h2 className="text-2xl font-black tracking-[0.3em] text-white sm:text-3xl">
              kasistay
            </h2>
          </div>

          <div className="mt-5 h-px w-full bg-white/20" />

          <nav className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/90 sm:text-sm">
            <a href="#" className="transition hover:text-white">
              Home
            </a>
            <a href="#" className="transition hover:text-white">
              Search
            </a>
            <a href="#" className="transition hover:text-white">
              Properties
            </a>
            <a href="#" className="transition hover:text-white">
              Pricing
            </a>
            <a href="#" className="transition hover:text-white">
              Blog
            </a>
            <a href="#" className="transition hover:text-white">
              FAQ
            </a>
          </nav>

          <form className="mt-6 flex w-full max-w-md flex-col gap-3 rounded-full border border-white/25 bg-transparent p-2 sm:flex-row">
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full rounded-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:opacity-90"
            >
              Subscribe
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/80 sm:text-sm">
            <a href="#" className="transition hover:text-white">
              Linked In
            </a>
            <a href="#" className="transition hover:text-white">
              Facebook
            </a>
            <a href="#" className="transition hover:text-white">
              Instagram
            </a>
            <a href="#" className="transition hover:text-white">
              X
            </a>
          </div>

          <div className="mt-8 h-px w-full bg-white/20" />

          <div className="mt-4 flex w-full flex-col items-center justify-between gap-3 text-center text-[11px] text-white/75 sm:flex-row sm:text-xs">
            <a href="#" className="transition hover:text-white">
              Terms &amp; Conditions
            </a>
            <p>© kasistay | All Rights Reserved.</p>
            <a href="#" className="transition hover:text-white">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
