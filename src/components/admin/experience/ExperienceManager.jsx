
"use client";

import { useState } from "react";

import { notifyError, notifySuccess } from "@/lib/notify";
import { handleAdminSessionExpired } from "@/lib/admin-session-client";

const initialForm = {
  company: "",
  role: "",
  employmentType: "Internship",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
  responsibilities: "",
  technologies: "",
  isPublished: true,
  sortOrder: 0,
};

function toLines(value) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toFormData(experience) {
  return {
    company: experience.company || "",
    role: experience.role || "",
    employmentType: experience.employmentType || "",
    location: experience.location || "",
    startDate: experience.startDate || "",
    endDate: experience.endDate || "",
    isCurrent: experience.isCurrent ?? false,
    description: experience.description || "",
    responsibilities: (experience.responsibilities || []).join("\n"),
    technologies: (experience.technologies || []).join("\n"),
    isPublished: experience.isPublished ?? true,
    sortOrder: experience.sortOrder ?? 0,
  };
}

export default function ExperienceManager({
  initialExperiences = [],
}) {
  const [experiences, setExperiences] = useState(initialExperiences);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "isCurrent" && checked) {
        next.endDate = "";
      }

      return next;
    });
  }

  function resetForm() {
    setFormData(initialForm);
    setEditingId(null);
  }

  function handleEdit(experience) {
    setEditingId(experience.id);
    setFormData(toFormData(experience));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const payload = {
        ...formData,
        company: formData.company.trim(),
        role: formData.role.trim(),
        employmentType: formData.employmentType.trim(),
        location: formData.location.trim(),
        endDate: formData.isCurrent ? "" : formData.endDate,
        responsibilities: toLines(formData.responsibilities),
        technologies: toLines(formData.technologies),
        sortOrder: Number(formData.sortOrder),
      };

      const response = await fetch("/api/admin/experiences", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId ? { id: editingId, ...payload } : payload
        ),
      });

      const result = await response.json();

      if (response.status === 401) {
        handleAdminSessionExpired();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to save experience."
        );
      }

      if (editingId) {
        setExperiences((prev) =>
          prev.map((item) =>
            item.id === editingId ? result.experience : item
          )
        );
      } else {
        setExperiences((prev) => [...prev, result.experience]);
      }

      notifySuccess(
        editingId ? "Experience updated" : "Experience created",
        result.message
      );
      resetForm();
    } catch (err) {
      notifyError(
        "Failed to save experience",
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (
      !window.confirm(
        "Are you sure you want to delete this experience?"
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch("/api/admin/experiences", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (response.status === 401) {
        handleAdminSessionExpired();
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete experience."
        );
      }

      setExperiences((prev) =>
        prev.filter((item) => item.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      notifySuccess("Experience deleted", result.message);
    } catch (err) {
      notifyError(
        "Failed to delete experience",
        err.message || "Something went wrong."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Experience Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your internships, employment and relevant professional experience.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Experience" : "Add Experience"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add only experience that you can accurately describe.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Company / Organization *</label>
            <input
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company or organization name"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Role / Position *</label>
            <input
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Frontend Developer Intern"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Employment Type *</label>
            <input
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              placeholder="Internship, Full-time, Freelance"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Remote / Dhaka, Bangladesh"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              disabled={formData.isCurrent}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              placeholder="Describe your role and experience."
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              Responsibilities / Achievements (one per line)
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              rows={4}
              placeholder={"Developed reusable UI components\nCollaborated with team members"}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              Technologies Used (one per line)
            </label>
            <textarea
              name="technologies"
              value={formData.technologies}
              onChange={handleChange}
              rows={3}
              placeholder={"React.js\nNext.js\nMongoDB"}
              className={inputClass}
            />
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
              name="isCurrent"
              checked={formData.isCurrent}
              onChange={handleChange}
              className="h-4 w-4 accent-blue-600"
            />
            I currently work here
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="h-4 w-4 accent-blue-600"
            />
            Publish this experience
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
                ? "Update Experience"
                : "Add Experience"}
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

      {/* Existing Experiences */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Experience
          </h2>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {experiences.length} total
          </span>
        </div>

        {experiences.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-700">
              No experience records added yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              You can leave this section empty until you have relevant experience.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {experiences.map((experience) => (
              <article
                key={experience.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {experience.role}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-blue-600">
                      {experience.company}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {experience.employmentType}
                      {experience.location
                        ? ` · ${experience.location}`
                        : ""}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {experience.startDate || "—"} –{" "}
                      {experience.isCurrent
                        ? "Present"
                        : experience.endDate || "—"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {experience.isCurrent && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                          Current
                        </span>
                      )}

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          experience.isPublished
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {experience.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(experience)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(experience.id)}
                      disabled={deletingId === experience.id}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === experience.id ? "Deleting..." : "Delete"}
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
