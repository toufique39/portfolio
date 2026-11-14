
"use client";

import { useState } from "react";

import { notifyError, notifySuccess } from "@/lib/notify";
import { handleAdminSessionExpired } from "@/lib/admin-session-client";

const initialForm = {
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  status: "studying",
  description: "",
  isPublished: true,
  sortOrder: 0,
};

export default function EducationManager({ initialEducations = [] }) {
  const [educations, setEducations] = useState(initialEducations);
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

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setFormData(initialForm);
    setEditingId(null);
  }

  function handleEdit(education) {
    setEditingId(education.id);

    setFormData({
      institution: education.institution || "",
      degree: education.degree || "",
      field: education.field || "",
      startDate: education.startDate || "",
      endDate: education.endDate || "",
      status: education.status || "studying",
      description: education.description || "",
      isPublished: education.isPublished ?? true,
      sortOrder: education.sortOrder ?? 0,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const payload = {
        ...formData,
        institution: formData.institution.trim(),
        degree: formData.degree.trim(),
        field: formData.field.trim(),
        sortOrder: Number(formData.sortOrder),
      };

      const response = await fetch("/api/admin/educations", {
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
        throw new Error(result.message || "Failed to save education.");
      }

      if (editingId) {
        setEducations((prev) =>
          prev.map((item) =>
            item.id === editingId ? result.education : item
          )
        );
      } else {
        setEducations((prev) => [...prev, result.education]);
      }

      notifySuccess(
        editingId ? "Education updated" : "Education record created",
        result.message
      );
      resetForm();
    } catch (err) {
      notifyError(
        "Failed to save education",
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch("/api/admin/educations", {
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
        throw new Error(result.message || "Failed to delete education.");
      }

      setEducations((prev) =>
        prev.filter((item) => item.id !== id)
      );

      if (editingId === id) resetForm();

      notifySuccess("Education record deleted", result.message);
    } catch (err) {
      notifyError(
        "Failed to delete education",
        err.message || "Something went wrong."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Education Management
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your academic qualifications and education history.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {editingId ? "Edit Education" : "Add Education"}
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Institution *</label>
            <input
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="University name"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Degree *</label>
            <input
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              placeholder="B.Sc."
              required
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Field of Study *</label>
            <input
              name="field"
              value={formData.field}
              onChange={handleChange}
              placeholder="Internet of Things and Robotics Engineering"
              required
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
              disabled={formData.status === "studying"}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="studying">Currently Studying</option>
              <option value="completed">Completed</option>
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

          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Add relevant details about your education."
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            className="h-4 w-4 accent-blue-600"
          />
          Publish this education record
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : editingId
                ? "Update Education"
                : "Add Education"}
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

      {/* Education Records */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Your Education
        </h2>

        {educations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-medium text-slate-700">
              No education records added yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {educations.map((education) => (
              <article
                key={education.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {education.degree} — {education.field}
                    </h3>

                    <p className="mt-1 text-sm text-slate-600">
                      {education.institution}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {education.startDate || "—"} —{" "}
                      {education.status === "studying"
                        ? "Present"
                        : education.endDate || "—"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700">
                        {education.status}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          education.isPublished
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {education.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(education)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(education.id)}
                      disabled={deletingId === education.id}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === education.id ? "Deleting..." : "Delete"}
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
