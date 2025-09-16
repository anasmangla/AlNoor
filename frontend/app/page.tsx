import Link from "next/link";
import Image from "next/image";
import LocalizedText from "@/components/LocalizedText";

export default function Home() {
  return (
    <div className="text-center">
      <Image
        src="/alnoorlogo.png"
        alt="Al Noor Farm Icon"
        width={96}
        height={96}
        className="mx-auto mb-6 h-auto w-auto"
        priority
      />
      <h1 className="text-3xl font-semibold mb-2">
        <LocalizedText id="home.title" />
      </h1>
      <p className="text-slate-600 mb-6">
        <LocalizedText id="home.subtitle" />
      </p>
      <div className="flex gap-4 justify-center">
        <Link className="text-blue-600 hover:underline" href="/products">
          <LocalizedText id="home.store" />
        </Link>
        <Link className="text-blue-600 hover:underline" href="/admin/login">
          <LocalizedText id="home.admin" />
        </Link>
        <Link className="text-blue-600 hover:underline" href="/admin/pos">
          <LocalizedText id="home.pos" />
        </Link>
      </div>
    </div>
  );
}
