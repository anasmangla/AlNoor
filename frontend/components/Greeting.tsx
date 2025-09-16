"use client";
export default function Greeting({ name = "World" }: { name?: string }) {
  return <h1 className="heading text-2xl">Hello, {name}!</h1>;
}

