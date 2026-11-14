"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { notifyError, notifySuccess } from "@/lib/notify";
import { handleAdminSessionExpired } from "@/lib/admin-session-client";
import { uploadAdminFile } from "@/lib/upload";
import { isCloudinaryUploadUrl, resolveImageUrl } from "@/lib/utils";

export default function ProfileForm({ initialData }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    designation: initialData?.designation || "",
    headline: initialData?.headline || "",
    heroDescription: initialData?.heroDescription || "",
    about: initialData?.about || "",
    programmingJourney: initialData?.programmingJourney || "",
    interests: initialData?.interests?.join(", ") || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    whatsapp: initialData?.whatsapp || "",
    location: initialData?.location || "",
    profileImage: initialData?.profileImage || null,
    resumeUrl: initialData?.resumeUrl || "",
  });

  const [uploading, setUploading] = useState({
    image: false,
    resume: false,
  });

  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);

  async function removeAsset(field) {
    if (removing) return;

    setRemoving(field);

    // Abort a hung request so the form controls can never stay disabled.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch("/api/admin/profile", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ field }),
        signal: controller.signal,
      });

      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        handleAdminSessionExpired();
        return;
      }

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Removal failed. Please try again."
        );
      }

      if (field === "profileImage") {
        setFormData((prev) => ({ ...prev, profileImage: null }));
      } else {
        setFormData((prev) => ({ ...prev, resumeUrl: "" }));
      }

      notifySuccess(
        field === "profileImage"
          ? "Profile photo removed"
          : "Resume removed",
        "Save your profile to keep the changes."
      );
    } catch (err) {
      notifyError(
        field === "profileImage"
          ? "Photo removal failed"
          : "Resume removal failed",
        err?.name === "AbortError"
          ? "The request timed out. Please try again."
          : err.message || "Something went wrong."
      );
    } finally {
      clearTimeout(timeout);
      setRemoving(null);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleUpload(file, kind) {
    if (!file) return;

    const isImage = kind === "profile-image";
    const stateKey = isImage ? "image" : "resume";

    setUploading((prev) => ({
      ...prev,
      [stateKey]: true,
    }));

    try {
      const asset = await uploadAdminFile(file, kind);

      if (isImage) {
        setFormData((prev) => ({
          ...prev,
          profileImage: {
            url: asset.url,
            publicId: asset.publicId,
            alt: prev.name
              ? `${prev.name} profile photo`
              : "Profile photo",
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          resumeUrl: asset.url,
        }));
      }

      notifySuccess(
        isImage
          ? "Profile photo uploaded"
          : "Resume uploaded",
        "Save your profile to keep the changes."
      );
    } catch (err) {
      if (err.status === 401) {
        handleAdminSessionExpired();
        return;
      }

      notifyError(
        isImage ? "Photo upload failed" : "Resume upload failed",
        err.message || "Something went wrong during upload."
      );
    } finally {
      setUploading((prev) => ({
        ...prev,
        [stateKey]: false,
      }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);

    try {
      const payload = {
        ...formData,
        interests: formData.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      // Do not send null for an optional image object.
      if (!payload.profileImage) {
        delete payload.profileImage;
      }

      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (response.status === 401) {
        handleAdminSessionExpired();
        return;
      }

      if (!response.ok) {
        throw new Error(result?.message || "Profile update failed.");
      }

      notifySuccess(
        "Profile saved",
        "Your profile has been updated successfully."
      );

      // Sync the server-rendered profile data with the saved document.
      router.refresh();
    } catch (err) {
      notifyError(
        "Profile update failed",
        err.message || "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500";

  const labelClass = "mb-1 block text-sm font-medium";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profile Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal and professional information.
        </p>
      </div>

      {/* Profile Photo */}
      <section className="space-y-3 rounded-xl border p-4">
        
        <h3 className="font-semibold">Profile Photo</h3>
        <div className="relative h-64 w-64 sm:h-80 sm:w-80">
          {(() => {
            const previewUrl = resolveImageUrl(formData.profileImage?.url);

            if (previewUrl) {
              return isCloudinaryUploadUrl(previewUrl) ? (
                <Image
                  src={previewUrl}
                  alt={formData.profileImage.alt || "Profile photo"}
                  fill
                  sizes="(max-width: 640px) 256px, 320px"
                  className="object-cover"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={formData.profileImage.alt || "Profile photo"}
                  className="h-full w-full rounded-lg object-cover"
                />
              );
            }

            return (
              <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                No photo uploaded yet
              </div>
            );
          })()}
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading.image || removing === "profileImage"}
          onChange={(event) => {
            handleUpload(event.target.files?.[0], "profile-image");
            event.target.value = "";
          }}
          className="block w-full text-sm"
        />

        <p className="text-xs text-gray-500">
          JPEG, PNG or WebP. Maximum size: 20 MB.
        </p>

        {uploading.image && (
          <p className="text-sm text-blue-600">Uploading photo...</p>
        )}

        {formData.profileImage?.url && (
          <button
            type="button"
            onClick={() => removeAsset("profileImage")}
            disabled={removing !== null || uploading.image}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {removing === "profileImage" ? "Removing..." : "Remove photo"}
          </button>
        )}
      </section>

      {/* Resume */}
      <section className="space-y-3 rounded-xl border p-4">
        <h3 className="font-semibold">Resume / CV</h3>

        {formData.resumeUrl && (
          <a
            href={formData.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 underline"
          >
            View uploaded resume
          </a>
        )}

        <input
          type="file"
          accept="application/pdf"
          disabled={uploading.resume || removing === "resumeUrl"}
          onChange={(event) => {
            handleUpload(event.target.files?.[0], "resume");
            event.target.value = "";
          }}
          className="block w-full text-sm"
        />

        <p className="text-xs text-gray-500">
          PDF only. Maximum size: 10 MB.
        </p>

        {uploading.resume && (
          <p className="text-sm text-blue-600">Uploading resume...</p>
        )}

        {formData.resumeUrl && (
          <button
            type="button"
            onClick={() => removeAsset("resumeUrl")}
            disabled={removing !== null || uploading.resume}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {removing === "resumeUrl" ? "Removing..." : "Remove resume"}
          </button>
        )}
      </section>

      {/* Personal Information */}
      <section className="grid gap-4 md:grid-cols-2">
        {[
          ["name", "Full Name"],
          ["designation", "Designation"],
          ["headline", "Professional Headline"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["whatsapp", "WhatsApp"],
          ["location", "Location"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className={labelClass}>{label}</label>
            <input
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        ))}
      </section>

      {/* Professional Information */}
      <section className="space-y-4">
        {[
          ["heroDescription", "Hero Description"],
          ["about", "About Me"],
          ["programmingJourney", "Programming Journey"],
        ].map(([name, label]) => (
          <div key={name}>
            <label className={labelClass}>{label}</label>
            <textarea
              name={name}
              value={formData[name]}
              onChange={handleChange}
              rows={4}
              className={inputClass}
            />
          </div>
        ))}

        <div>
          <label className={labelClass}>Interests</label>
          <input
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            placeholder="Coding, Reading, Traveling"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            Separate interests using commas.
          </p>
        </div>
      </section>

      <button
        type="submit"
        disabled={
          saving ||
          removing !== null ||
          uploading.image ||
          uploading.resume
        }
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
