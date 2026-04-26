import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

type AuthPanelProps = {
  children: ReactNode;
  eyebrow?: string;
  subtitle: string;
  title: string;
};

const trustPoints = ["Verified hosts", "Secure payments", "Local stays"];

const BrandMark = () => (
  <Link href="/" className="group inline-flex items-center gap-3">
    <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#050505] text-white shadow-lg shadow-black/15">
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
      >
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
    </span>
    <span className="text-2xl font-black tracking-tight text-[#050505] transition group-hover:text-black/70">
      kasistay<span className="text-black/45">.</span>
    </span>
  </Link>
);

export const AuthPanel = ({
  children,
  eyebrow,
  subtitle,
  title,
}: AuthPanelProps) => (
  <div className="w-full max-w-[420px]">
    {eyebrow ? (
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-black/55">
        {eyebrow}
      </p>
    ) : null}
    <h1 className="text-4xl font-black tracking-tight text-black sm:text-5xl">
      {title}
    </h1>
    <p className="mt-2 max-w-sm text-sm leading-6 text-black/60">{subtitle}</p>
    <div className="mt-8">{children}</div>
  </div>
);

export const AuthShell = ({ children }: AuthShellProps) => {
  return (
    <main className="min-h-screen bg-[#f4f1e8]">
      <div className="grid min-h-screen w-full overflow-hidden bg-[#f4f1e8] lg:grid-cols-[0.84fr_1.16fr]">
        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-10 xl:px-24">
          <BrandMark />

          <div className="relative mt-8 h-40 overflow-hidden rounded-[2rem] bg-[#050505] lg:hidden">
            <Image
              alt="Modern stay with warm city views"
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 0px"
              src="/bg/hero.jpg"
            />
            <div className="absolute inset-0 bg-black/35" />
            <p className="absolute bottom-5 left-5 right-5 text-balance text-lg font-bold leading-tight text-white">
              Browse trusted stays, book securely, and feel at home sooner.
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center py-10 lg:py-8">
            {children}
          </div>
        </section>

        <aside className="relative hidden min-h-screen p-6 lg:block">
          <div className="relative h-full min-h-[calc(100vh-3rem)] overflow-hidden rounded-[2.2rem] bg-[#050505] [border-bottom-right-radius:6rem] [border-top-left-radius:6rem]">
            <Image
              alt="kasistay property booking background"
              className="object-cover"
              fill
              priority
              quality={100}
              sizes="(min-width: 1024px) 58vw, 100vw"
              src="/bg/hero.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/55" />
            <div className="absolute inset-0 bg-black/10" />

            <div className="relative z-10 ml-auto max-w-md px-8 pt-10 text-right text-white xl:px-12">
              <p className="text-2xl font-black leading-tight">
                Browse beautiful places to rent, book, and pay with confidence.
              </p>
            </div>

            <div className="absolute bottom-8 left-8 right-8 z-10 grid grid-cols-3 gap-3">
              {trustPoints.map((point) => (
                <div
                  className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-center text-xs font-semibold text-white shadow-lg backdrop-blur-md"
                  key={point}
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};
