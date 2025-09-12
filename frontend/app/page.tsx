import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="text-center">
      <Image
        src="/favicon.png"
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
      <div className="flex gap-4 justify-center">
        <Link className="text-blue-600 hover:underline" href="/products">Store</Link>
        <Link className="text-blue-600 hover:underline" href="/admin/login">Admin</Link>
        <Link className="text-blue-600 hover:underline" href="/admin/pos">POS</Link>
      </div>
    </div>
  );
}
