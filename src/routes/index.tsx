import { createFileRoute } from "@tanstack/react-router";
import NkorEatsApp from "@/components/NkorEatsApp";

export const Route = createFileRoute("/")({
  component: NkorEatsApp,
});
