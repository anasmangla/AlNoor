"use client";
export default function Greeting({ name = "World" }: { name?: string }) {
  return <h1>Hello, {name}!</h1>;
}

