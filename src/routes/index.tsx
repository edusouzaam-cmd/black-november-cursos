import { createFileRoute } from "@tanstack/react-router";
import passaporteHtml from "../content/passaporte.html?raw";

export const Route = createFileRoute("/")({
  server: {
    handlers: {
      GET: () =>
        new Response(passaporteHtml, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    },
  },
});
