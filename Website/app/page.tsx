import Header from "./components/Header";
import SearchBox from "./components/search/SearchBox";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-2xl px-4 pb-10 pt-5 sm:px-6">
        <div className="mt-4">
          <SearchBox />
        </div>

        <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">
            Attached details
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Use the navbar attachment button to include your location and other
            service details.
          </p>
        </div>
      </main>
    </div>
  );
}
