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
      <h1 className="heading text-4xl mb-2 sm:text-5xl">Al Noor Farm</h1>
      <p className="text-brand/80 mb-6 max-w-lg mx-auto">
        Browse products, manage inventory, and run POS.
      </p>
      <div className="flex gap-4 justify-center">
        <Link className="text-brand hover:text-brand-dark hover:underline font-medium" href="/products">Store</Link>
        <Link className="text-brand hover:text-brand-dark hover:underline font-medium" href="/admin/login">Admin</Link>
        <Link className="text-brand hover:text-brand-dark hover:underline font-medium" href="/admin/pos">POS</Link>
      </div>
    </div>
  );
}
