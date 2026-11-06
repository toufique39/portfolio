import { requireAdmin } from "@/lib/admin-auth";
import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";
import SocialLinksManager from "@/components/admin/social-links/SocialLinksManager";

export default async function SocialLinksPage() {
  await requireAdmin();

  const collection = await getCollection(COLLECTIONS.SOCIAL_LINKS);

  const documents = await collection
    .find({})
    .sort({ sortOrder: 1, createdAt: -1 })
    .toArray();

  const initialLinks = documents.map(({ _id, ...data }) => ({
    id: _id.toString(),
    ...data,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SocialLinksManager initialLinks={initialLinks} />
    </div>
  );
}