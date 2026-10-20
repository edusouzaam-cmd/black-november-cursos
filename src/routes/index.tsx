import { createFileRoute } from "@tanstack/react-router";
import passaporteHtml from "../content/passaporte.html?raw";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Passaporte Vitalício | Black November ENGETELES" },
      { name: "description", content: "3 certificações completas pelo preço de uma!" },
    ],
  }),
  component: PassaportePage,
});

function PassaportePage() {
  // Keep the original document isolated from Tailwind's reset and render it
  // on the client as well, including inside Lovable's preview.
  return (
    <iframe
      title="Passaporte Vitalício Black November ENGETELES"
      srcDoc={passaporteHtml}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        border: 0,
        background: "#161616",
      }}
    />
  );
}
