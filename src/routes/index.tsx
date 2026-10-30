import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({ component: OfferPreview });
function OfferPreview() {
 return <iframe title="Combo 3 Certificações Black November ENGETELES" src={`${import.meta.env.BASE_URL}offer.html`} style={{position:"fixed",inset:0,width:"100%",height:"100dvh",border:0,background:"#0a0d14"}} />;
}
