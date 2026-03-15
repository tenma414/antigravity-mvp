import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import EditForm from "./edit-form";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <EditForm
      userId={user.id}
      initialUsername={profile?.username ?? ""}
      initialBio={profile?.bio ?? ""}
      initialAvatarUrl={profile?.avatar_url ?? ""}
    />
  );
}
