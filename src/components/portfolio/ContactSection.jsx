
"use client";

import { useState } from "react";

import { notifyError, notifySuccess } from "@/lib/notify";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export default function ContactSection({ profile }) {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send message.");
      }

      notifySuccess(
        "Message sent",
        result.message || "Your message has been received."
      );

      setFormData(initialForm);
    } catch (err) {
      notifyError(
        "Failed to send message",
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="contact"
      className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 lg:px-8 md:py-24"
    >
      <div className="mx-auto max-w-6xl">

        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Get in Touch
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Let us Work Together
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
            Have a project idea, internship opportunity or just want
            to connect? Send me a message.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">

          {/* Contact Information */}
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 lg:col-span-2">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Contact Information
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                Feel free to reach out. I am open to professional
                networking, collaboration and internship opportunities.
              </p>
            </div>

            {profile.email && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>

                <a
                  href={`mailto:${profile.email}`}
                  className="mt-2 block break-all font-medium text-slate-900 hover:text-blue-600"
                >
                  {profile.email}
                </a>
              </div>
            )}

            {profile.phone && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Phone
                </p>

                <a
                  href={`tel:${profile.phone}`}
                  className="mt-2 block font-medium text-slate-900 hover:text-blue-600"
                >
                  {profile.phone}
                </a>
              </div>
            )}

            {profile.whatsapp && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  WhatsApp
                </p>

                <a
                  href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-medium text-slate-900 hover:text-blue-600"
                >
                  Chat on WhatsApp
                </a>
              </div>
            )}

            {profile.location && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Location
                </p>

                <p className="mt-2 font-medium text-slate-900">
                  {profile.location}
                </p>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3">
            <h3 className="mb-6 text-xl font-bold text-slate-900">
              Send Me a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Honeypot field */}
              <div
                className="absolute left-[-10000px] h-px w-px overflow-hidden"
                aria-hidden="true"
              >
                <label htmlFor="contact-website">
                  Leave this field empty
                </label>

                <input
                  id="contact-website"
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Your Name *
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    Email Address *
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    maxLength={254}
                    autoComplete="email"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className={labelClass}>
                  Subject *
                </label>

                <input
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What would you like to discuss?"
                  required
                  minLength={3}
                  maxLength={120}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className={labelClass}>
                  Your Message *
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={6}
                  required
                  minLength={10}
                  maxLength={4000}
                  className={inputClass}
                />

                <p className="mt-1 text-xs text-slate-400">
                  Maximum 4000 characters.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {loading ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
