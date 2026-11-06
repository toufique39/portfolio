
"use client";

import { useState } from "react";

const categories = [
  "frontend",
  "backend",
  "database",
  "tools",
  "devops",
  "iot",
  "ai",
  "other",
];

const initialForm = {
  name: "",
  category: "frontend",
  description: "",
  icon: "",
  proficiencyLabel: "",
  isFeatured: false,
  isPublished: true,
  sortOrder: 0,
};

export default function SkillsManager({ initialSkills = [] }) {
  const [skills, setSkills] = useState(initialSkills);
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

  function handleEdit(skill) {
    setEditingId(skill.id);

    setFormData({
      name: skill.name || "",
      category: skill.category || "other",
      description: skill.description || "",
      icon: skill.icon || "",
      proficiencyLabel: skill.proficiencyLabel || "",
      isFeatured: skill.isFeatured ?? false,
      isPublished: skill.isPublished ?? true,
      sortOrder: skill.sortOrder ?? 0,
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        sortOrder: Number(formData.sortOrder),
      };

      const response = await fetch("/api/admin/skills", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? { id: editingId, ...payload }
            : payload
        ),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save skill.");
      }

      if (editingId) {
        setSkills((prev) =>
          prev.map((skill) =>
            skill.id === editingId ? result.skill : skill
          )
        );
      } else {
        setSkills((prev) => [...prev, result.skill]);
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
    const confirmed = window.confirm(
      "Are you sure you want to delete this skill?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/skills", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete skill.");
      }

      setSkills((prev) =>
        prev.filter((skill) => skill.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      setMessage(result.message);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Skills Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Add, organize and manage your technical skills.
        </p>
      </div>

      {/* Messages */}
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

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Skill" : "Add New Skill"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter the skill details below.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Skill Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="React.js"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={inputClass}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() +
                    category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Icon / Emoji</label>
            <input
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="⚛️ or react"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Proficiency Label</label>
            <input
              name="proficiencyLabel"
              value={formData.proficiencyLabel}
              onChange={handleChange}
              placeholder="Intermediate"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe your experience with this skill."
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
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 accent-blue-600"
            />
            Featured skill
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="h-4 w-4 accent-blue-600"
            />
            Publish skill
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
                ? "Update Skill"
                : "Add Skill"}
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

      {/* Skills List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Skills
          </h2>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {skills.length} total
          </span>
        </div>

        {skills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-700">
              No skills added yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add your first skill using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <article
                key={skill.id}
                className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {skill.icon ? `${skill.icon} ` : ""}
                      {skill.name}
                    </h3>

                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {skill.category}
                    </p>
                  </div>

                  {skill.isFeatured && (
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      Featured
                    </span>
                  )}
                </div>

                {skill.description && (
                  <p className="text-sm leading-6 text-slate-600">
                    {skill.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {skill.proficiencyLabel && (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                      {skill.proficiencyLabel}
                    </span>
                  )}

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      skill.isPublished
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {skill.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="flex gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(skill)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(skill.id)}
                    disabled={deletingId === skill.id}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === skill.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
