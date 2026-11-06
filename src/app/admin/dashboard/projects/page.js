import { requireAdmin } from "@/lib/admin-auth";
import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";
import ProjectsManager from "@/components/admin/projects/ProjectsManager";

export default async function ProjectsPage() {
  await requireAdmin();

  const collection = await getCollection(COLLECTIONS.PROJECTS);

  const documents = await collection
    .find({})
    .sort({ sortOrder: 1, createdAt: -1 })
    .toArray();

  const initialProjects = documents.map(({ _id, ...data }) => ({
    id: _id.toString(),
    ...data,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ProjectsManager initialProjects={initialProjects} />
    </div>
  );
}