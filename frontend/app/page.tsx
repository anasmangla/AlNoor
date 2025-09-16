import Link from "next/link";
import Image from "next/image";

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
      <h1 className="text-3xl font-semibold mb-2">Al Noor Farm</h1>
      <p className="text-slate-600 mb-6">
        Browse products, manage inventory, and run POS.
      </p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <Link className="text-blue-600 hover:underline" href="/products">
          Store
        </Link>
        <Link className="text-blue-600 hover:underline" href="/admin/login">
          Admin
        </Link>
        <Link className="text-blue-600 hover:underline" href="/admin/pos">
          POS
        </Link>
      </div>
    </div>
  );
}
