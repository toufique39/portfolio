
"use client";

import { useState } from "react";
import { resolveImageUrl } from "@/lib/utils";

const initialForm = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  technologies: "",
  features: "",
  challenges: "",
  futurePlans: "",
  liveUrl: "",
  githubUrl: "",
  coverImageUrl: "",
  galleryUrls: "",
  status: "completed",
  isPublished: true,
  sortOrder: 0,
};

function toFormData(project) {
  return {
    title: project.title || "",
    slug: project.slug || "",
    shortDescription: project.shortDescription || "",
    description: project.description || "",
    technologies: (project.technologies || []).join("\n"),
    features: (project.features || []).join("\n"),
    challenges: project.challenges || "",
    futurePlans: (project.futurePlans || []).join("\n"),
    liveUrl: project.liveUrl || "",
    githubUrl: project.githubUrl || "",
    coverImageUrl: project.coverImage?.url || "",
    galleryUrls: (project.gallery || [])
      .map((image) => image.url)
      .join("\n"),
    status: project.status || "completed",
    isPublished: project.isPublished ?? true,
    sortOrder: project.sortOrder ?? 0,
  };
}

function toArray(value) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProjectsManager({ initialProjects = [] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setFormData(initialForm);
    setEditingId(null);
  }

  function handleEdit(project) {
    setEditingId(project.id);
    setFormData(toFormData(project));
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const galleryUrls = toArray(formData.galleryUrls);

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        technologies: toArray(formData.technologies),
        features: toArray(formData.features),
        challenges: formData.challenges.trim(),
        futurePlans: toArray(formData.futurePlans),
        liveUrl: formData.liveUrl.trim(),
        githubUrl: formData.githubUrl.trim(),
        coverImage: {
          url: formData.coverImageUrl.trim(),
          alt: formData.title.trim(),
        },
        gallery: galleryUrls.map((url) => ({
          url,
          alt: formData.title.trim(),
        })),
        status: formData.status,
        isPublished: formData.isPublished,
        sortOrder: Number(formData.sortOrder),
      };

      const response = await fetch("/api/admin/projects", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId ? { id: editingId, ...payload } : payload
        ),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save project.");
      }

      if (editingId) {
        setProjects((prev) =>
          prev.map((project) =>
            project.id === editingId ? result.project : project
          )
        );
      } else {
        setProjects((prev) => [...prev, result.project]);
      }

      setMessage(result.message);
      resetForm();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/projects", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete project.");
      }

      setProjects((prev) =>
        prev.filter((project) => project.id !== id)
      );

      if (editingId === id) resetForm();

      setMessage(result.message);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Projects Management
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create and manage your portfolio projects.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Project" : "Add New Project"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Required fields are marked with an asterisk.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Project Title *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Cloud-Native To-Do Application"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>URL Slug *</label>
            <input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="cloud-native-todo"
              pattern="[a-z0-9-]+"
              required
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Example: cloud-native-todo
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Short Description *</label>
            <textarea
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows={2}
              required
              placeholder="A short summary for the project card."
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Full Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
              placeholder="Explain the project, its purpose and how it works."
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              Technologies * (one per line)
            </label>
            <textarea
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              rows={3}
              required
              placeholder={"Next.js\nMongoDB\nBetter Auth"}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              Key Features (one per line)
            </label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows={3}
              placeholder={"User authentication\nCRUD operations\nResponsive UI"}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Challenges</label>
            <textarea
              name="challenges"
              value={formData.challenges}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the technical challenges you faced."
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              Future Improvements (one per line)
            </label>
            <textarea
              name="futurePlans"
              value={formData.futurePlans}
              onChange={handleChange}
              rows={3}
              placeholder={"Add automated testing\nImprove performance"}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Cover Image URL *</label>
            <input
              type="url"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleChange}
              placeholder="https://example.com/project-image.png"
              required
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              Gallery Image URLs (one URL per line)
            </label>
            <textarea
              name="galleryUrls"
              value={formData.galleryUrls}
              onChange={handleChange}
              rows={3}
              placeholder="https://example.com/screenshot-1.png"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Live Demo URL</label>
            <input
              type="url"
              name="liveUrl"
              value={formData.liveUrl}
              onChange={handleChange}
              placeholder="https://your-project.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>GitHub Repository URL</label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username/repository"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Project Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="planned">Planned</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Sort Order</label>
            <input
              type="number"
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
              min="0"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="h-4 w-4 accent-blue-600"
            />
            Publish project
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editingId
                ? "Update Project"
                : "Add Project"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Existing Projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Projects
          </h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {projects.length} total
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-700">
              No projects added yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {project.coverImage?.url &&
                  (resolveImageUrl(project.coverImage.url) ? (
                    <img
                      src={resolveImageUrl(project.coverImage.url)}
                      alt={project.coverImage.alt || project.title}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className="mt-1 text-xs font-medium">
                        Image link is not a valid image
                      </span>
                    </div>
                  ))}

                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {project.status}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600">
                    {project.shortDescription}
                  </p>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      project.isPublished
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {project.isPublished ? "Published" : "Draft"}
                  </span>

                  <div className="flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(project)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === project.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
