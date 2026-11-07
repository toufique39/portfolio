
"use client";

import { useState } from "react";

import { notifyError, notifySuccess } from "@/lib/notify";

const initialForm = {
  platform: "",
  label: "",
  url: "",
  icon: "",
  sortOrder: 0,
  isPublished: true,
};

export default function SocialLinksManager({ initialLinks = [] }) {
  const [links, setLinks] = useState(initialLinks);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  function handleEdit(link) {
    setEditingId(link.id);

    setFormData({
      platform: link.platform || "",
      label: link.label || "",
      url: link.url || "",
      icon: link.icon || "",
      sortOrder: link.sortOrder ?? 0,
      isPublished: link.isPublished ?? true,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const payload = {
        ...formData,
        sortOrder: Number(formData.sortOrder),
      };

      const response = await fetch("/api/admin/social-links", {
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
        throw new Error(result.message || "Something went wrong.");
      }

      if (editingId) {
        setLinks((prev) =>
          prev.map((link) =>
            link.id === editingId ? result.link : link
          )
        );
      } else {
        setLinks((prev) => [...prev, result.link]);
      }

      notifySuccess(
        editingId ? "Social link updated" : "Social link created",
        result.message
      );
      resetForm();
    } catch (err) {
      notifyError(
        "Failed to save social link",
        err.message || "Failed to save social link."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this social link?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch("/api/admin/social-links", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Delete failed.");
      }

      setLinks((prev) =>
        prev.filter((link) => link.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      notifySuccess("Social link deleted", result.message);
    } catch (err) {
      notifyError(
        "Failed to delete social link",
        err.message || "Failed to delete social link."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Social Links
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your public social media and professional profile links.
        </p>
      </div>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Social Link" : "Add New Social Link"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter your social platform details.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Platform *</label>
            <input
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              placeholder="github"
              required
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Use a unique lowercase value, such as github or linkedin.
            </p>
          </div>

          <div>
            <label className={labelClass}>Display Label *</label>
            <input
              name="label"
              value={formData.label}
              onChange={handleChange}
              placeholder="GitHub"
              required
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Profile URL *</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://github.com/your-username"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Icon Name</label>
            <input
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="github"
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

        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            className="h-4 w-4 accent-blue-600"
          />
          Publish this social link
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editingId
                ? "Update Social Link"
                : "Add Social Link"}
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

      {/* Social Links List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Social Links
          </h2>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {links.length} total
          </span>
        </div>

        {links.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-700">
              No social links added yet.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add your GitHub or LinkedIn profile to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <article
                key={link.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {link.label}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        link.isPublished
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {link.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Platform: {link.platform} · Order: {link.sortOrder}
                  </p>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block truncate text-sm text-blue-600 hover:underline"
                  >
                    {link.url}
                  </a>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(link)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(link.id)}
                    disabled={deletingId === link.id}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === link.id ? "Deleting..." : "Delete"}
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
