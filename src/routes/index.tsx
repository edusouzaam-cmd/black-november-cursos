import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Black November Cursos" },
      { name: "description", content: "Black November Cursos" },
      { property: "og:title", content: "Black November Cursos" },
      { property: "og:description", content: "Black November Cursos" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex h-screen items-center justify-center overflow-hidden bg-foreground px-6">
      <h1 className="text-center text-5xl font-black uppercase tracking-tight text-background md:text-8xl">
        Black November Cursos
      </h1>
    </main>
  );
}
