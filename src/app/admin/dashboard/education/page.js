import { requireAdmin } from "@/lib/admin-auth";
import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";
import EducationManager from "@/components/admin/education/EducationManager";

export default async function EducationPage() {
  await requireAdmin();

  const collection = await getCollection(COLLECTIONS.EDUCATIONS);

  const documents = await collection
    .find({})
    .sort({ sortOrder: 1, startDate: -1 })
    .toArray();

  const initialEducations = documents.map(({ _id, ...data }) => ({
    id: _id.toString(),
    ...data,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EducationManager initialEducations={initialEducations} />
    </div>
  );
}