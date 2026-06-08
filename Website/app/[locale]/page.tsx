import { useTranslations } from "next-intl";
import Header from "../components/Header";
import SearchBox from "../components/search/SearchBox";


export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />

      <main className="mx-auto max-w-2xl px-4 pb-10 pt-5 sm:px-6">
        <div className="mt-4">
          <SearchBox />
        </div>

     
      </main>
    </div>
  );
}
