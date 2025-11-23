import { redirect } from "next/navigation";

export default function NewGigPackPage() {
  redirect("/gigpacks?sheet=create");
}

