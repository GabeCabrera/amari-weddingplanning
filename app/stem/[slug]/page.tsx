import { db } from "@/lib/db";
import { rsvpForms, tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StemClient } from "./stem-client";
import type { Metadata, ResolvingMetadata } from 'next';

interface StemPageProps {
  params: { slug: string };
}

// Generate dynamic metadata for each wedding website
export async function generateMetadata(
  { params }: StemPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;

  const [form] = await db
    .select()
    .from(rsvpForms)
    .where(eq(rsvpForms.slug, slug))
    .limit(1);

  if (!form || !form.isActive) {
    return {
      title: "Page Not Found",
    };
  }

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, form.tenantId))
    .limit(1);
    
  const coupleNames = tenant?.displayName || "A Couple";
  const weddingDate = form.weddingDate?.toISOString() || tenant.weddingDate?.toISOString();
  const title = "Scribe & Stem";
  const description = `Join ${coupleNames} for their wedding celebration. Find all the details and RSVP here.`;
  const siteUrl = `https://scribeandstem.com/stem/${slug}`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `The Wedding of ${coupleNames}`,
    startDate: weddingDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'To be announced', // This could be dynamically populated if the data exists
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'To be announced',
      },
    },
    image: [
      'https://scribeandstem.com/og-image-wedding.png'
     ],
    description,
    performer: {
      '@type': 'Person',
      name: coupleNames,
    },
    organizer: {
        '@type': 'Organization',
        name: 'Scribe & Stem',
        url: 'https://scribeandstem.com'
    }
  };

  return {
    title,
    description,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      type: 'website',
      images: [
        {
          url: '/og-image-wedding.png', // A generic wedding-themed OG image
          width: 1200,
          height: 630,
          alt: `${coupleNames}'s Wedding`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image-wedding.png'],
    },
    other: {
        "ld+json": JSON.stringify(structuredData),
    }
  };
}

export default async function StemPage({ params }: StemPageProps) {
  const { slug } = params;

  // Get the RSVP form
  const [form] = await db
    .select()
    .from(rsvpForms)
    .where(eq(rsvpForms.slug, slug))
    .limit(1);

  if (!form || !form.isActive) {
    notFound();
  }

  // Get tenant info for display
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, form.tenantId))
    .limit(1);

  if (!tenant) {
    notFound();
  }
  
  const coupleNames = tenant?.displayName || "A Couple";
  const weddingDate = form.weddingDate?.toISOString() || tenant.weddingDate?.toISOString();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `The Wedding of ${coupleNames}`,
    startDate: weddingDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'To be announced', // This could be dynamically populated if the data exists
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'To be announced',
      },
    },
    image: [
      'https://scribeandstem.com/og-image-wedding.png'
     ],
    description: `Join ${coupleNames} for their wedding celebration. Find all the details and RSVP here.`,
    performer: {
      '@type': 'Person',
      name: coupleNames,
    },
    organizer: {
        '@type': 'Organization',
        name: 'Scribe & Stem',
        url: 'https://scribeandstem.com'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <StemClient
        form={form}
        coupleNames={tenant.displayName}
        weddingDate={form.weddingDate?.toISOString() || tenant.weddingDate?.toISOString()}
      />
    </>
  );
}