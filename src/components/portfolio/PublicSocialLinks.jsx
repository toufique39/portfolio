export default function PublicSocialLinks({ links = [] }) {
  if (!links.length) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label || link.platform}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
        >
          {link.label || link.platform}
        </a>
      ))}
    </div>
  );
}