
import { requireAdmin } from "@/lib/admin-auth";
import { getProfile } from "@/lib/services/profile.service";
import ProfileForm from "@/components/admin/profile/ProfileForm";

export const metadata = {
  title: "Manage Profile | Admin",
};

export default async function ProfilePage() {
  await requireAdmin();

  const profile = await getProfile();

  const serializedProfile = profile
    ? {
        ...profile,
        _id: String(profile._id),
        createdAt: profile.createdAt?.toISOString(),
        updatedAt: profile.updatedAt?.toISOString(),
      }
    : null;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Profile Management
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Manage your personal and professional information.
        </p>
      </div>

      <ProfileForm initialData={serializedProfile} />
    </section>
  );
}
