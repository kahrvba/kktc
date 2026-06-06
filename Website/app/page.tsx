import Header from "./components/Header";
import SearchBox from "./components/search/SearchBox";
import ActionCards from "./components/search/ActionCards";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-4xl bg-white/95 p-6 shadow-[0_35px_60px_-40px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 sm:p-8">

          {/* Hero text */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-600">
              You're on the hire page
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Find the right service provider fast.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Build your profile, attach an image or voice note, and search for
              providers who get the job done.
            </p>
          </div>

          {/* Search + Action grid */}
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.9fr_1fr]">
            <SearchBox />
            <ActionCards />
          </div>

        </section>
      </main>
    </div>
  );
}
