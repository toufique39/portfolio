import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";

export async function getPublicProfile() {
  const collection = await getCollection(COLLECTIONS.PROFILES);

  return collection.findOne(
    { _id: "main" },
    {
      projection: {
        _id: 0,
        name: 1,
        designation: 1,
        headline: 1,
        heroDescription: 1,
        about: 1,
        programmingJourney: 1,
        interests: 1,
        profileImage: 1,
        resumeUrl: 1,
        email: 1,
        phone: 1,
        whatsapp: 1,
        location: 1,
      },
    }
  );
}
export async function getPublicSiteSettings() {
  const collection = await getCollection(COLLECTIONS.SETTINGS);

  return collection.findOne(
    { _id: "main" },
    {
      projection: {
        _id: 0,
        navigation: 1,
        sections: 1,
      },
    }
  );
}

export async function getPublicSocialLinks() {
  const collection = await getCollection(COLLECTIONS.SOCIAL_LINKS);

  const links = await collection
    .find(
      { isPublished: true },
      {
        projection: {
          platform: 1,
          label: 1,
          url: 1,
          icon: 1,
          sortOrder: 1,
        },
      }
    )
    .sort({ sortOrder: 1 })
    .toArray();

  return links.map((link) => ({
    platform: link.platform,
    label: link.label,
    url: link.url,
    icon: link.icon,
  }));
}
export async function getPublicSkills() {
  const collection = await getCollection(COLLECTIONS.SKILLS);

  const skills = await collection
    .find(
      { isPublished: true },
      {
        projection: {
          name: 1,
          category: 1,
          description: 1,
          icon: 1,
          proficiencyLabel: 1,
          isFeatured: 1,
          sortOrder: 1,
        },
      }
    )
    .sort({ sortOrder: 1, name: 1 })
    .toArray();

  return skills.map(({ _id, ...skill }) => ({
    id: _id.toString(),
    ...skill,
  }));
}

// Get published projects for the public portfolio
export async function getPublicProjects() {
  const collection = await getCollection(COLLECTIONS.PROJECTS);

  const projects = await collection
    .find(
      { isPublished: true },
      {
        projection: {
          title: 1,
          slug: 1,
          shortDescription: 1,
          technologies: 1,
          coverImage: 1,
          status: 1,
          sortOrder: 1,
          updatedAt: 1,
        },
      }
    )
    .sort({ sortOrder: 1, createdAt: -1 })
    .toArray();

  return projects.map(({ _id, ...project }) => ({
    id: _id.toString(),
    ...project,
  }));
}

// Get one published project by slug
export async function getPublishedProjectBySlug(slug) {
  const collection = await getCollection(COLLECTIONS.PROJECTS);

  return collection.findOne(
    {
      slug,
      isPublished: true,
    },
    {
      projection: {
        _id: 0,
        title: 1,
        slug: 1,
        shortDescription: 1,
        description: 1,
        technologies: 1,
        features: 1,
        challenges: 1,
        futurePlans: 1,
        liveUrl: 1,
        githubUrl: 1,
        coverImage: 1,
        gallery: 1,
        status: 1,
      },
    }
  );
}

export async function getPublicEducations() {
  const collection = await getCollection(COLLECTIONS.EDUCATIONS);

  return collection
    .find(
      { isPublished: true },
      {
        projection: {
          institution: 1,
          degree: 1,
          field: 1,
          startDate: 1,
          endDate: 1,
          status: 1,
          description: 1,
          sortOrder: 1,
        },
      }
    )
    .sort({ sortOrder: 1, startDate: -1 })
    .toArray();
}

export async function getPublicExperiences() {
  const collection = await getCollection(COLLECTIONS.EXPERIENCES);

  return collection
    .find(
      { isPublished: true },
      {
        projection: {
          company: 1,
          role: 1,
          employmentType: 1,
          location: 1,
          startDate: 1,
          endDate: 1,
          isCurrent: 1,
          description: 1,
          responsibilities: 1,
          technologies: 1,
          sortOrder: 1,
        },
      }
    )
    .sort({ sortOrder: 1, startDate: -1 })
    .toArray();
}