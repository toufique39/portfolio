import { Suspense } from 'react';

async function ProjectContent({ params }) {
  const { slug } = await params;
  return <h1>Project: {slug}</h1>;
}

export default function ProjectPage({ params }) {
  return (
    <main>
      <Suspense fallback={<h1>Loading…</h1>}>
        <ProjectContent params={params} />
      </Suspense>
    </main>
  );
}
