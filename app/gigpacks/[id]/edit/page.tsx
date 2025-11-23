import { redirect } from "next/navigation";

interface EditGigPackPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGigPackPage({ params }: EditGigPackPageProps) {
  const { id } = await params;
  const search = new URLSearchParams({
    sheet: "edit",
    gigPackId: id,
  });
  redirect(`/gigpacks?${search.toString()}`);
}

