import type { Metadata } from "next";
import { EditVenue } from "./edit-form";

export const metadata: Metadata = { title: "Edit venue" };

export default function EditVenuePage() {
  return <EditVenue />;
}
