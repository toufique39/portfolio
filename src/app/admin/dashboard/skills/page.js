import { requireAdmin } from "@/lib/admin-auth";
import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";
import SkillsManager from "@/components/admin/skills/SkillsManager";

export default async function SkillsPage() {
  await requireAdmin();

  const collection = await getCollection(COLLECTIONS.SKILLS);

  const documents = await collection
    .find({})
    .sort({ sortOrder: 1, name: 1 })
    .toArray();

  const initialSkills = documents.map(({ _id, ...data }) => ({
    id: _id.toString(),
    ...data,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <SkillsManager initialSkills={initialSkills} />
    </div>
  );
}