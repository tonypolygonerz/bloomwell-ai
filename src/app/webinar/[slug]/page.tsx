import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import WebinarDetailClient from './WebinarDetailClient'

const prisma = new PrismaClient()

interface WebinarPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: WebinarPageProps): Promise<Metadata> {
  const { slug } = await params
  const webinar = await getWebinarBySlug(slug)
  
  if (!webinar) {
    return {
      title: 'Webinar Not Found - Bloomwell AI',
      description: 'The webinar you are looking for does not exist.'
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://bloomwell-ai.com'
  const webinarUrl = `${baseUrl}/webinar/${webinar.slug || webinar.uniqueSlug}`
  const imageUrl = webinar.socialImageUrl || webinar.thumbnailUrl || `${baseUrl}/images/webinar-default.jpg`
  
  const startDate = new Date(webinar.scheduledDate)
  const endDate = new Date(startDate.getTime() + webinar.duration * 60 * 1000)

  return {
    title: `${webinar.title} | Bloomwell AI`,
    description: webinar.metaDescription || webinar.description.substring(0, 160),
    keywords: webinar.categories ? webinar.categories.join(', ') : 'webinar, nonprofit, training, education',
    authors: [{ name: 'Bloomwell AI' }],
    creator: 'Bloomwell AI',
    publisher: 'Bloomwell AI',
    openGraph: {
      title: webinar.title,
      description: webinar.metaDescription || webinar.description.substring(0, 160),
      url: webinarUrl,
      siteName: 'Bloomwell AI',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: webinar.title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: webinar.title,
      description: webinar.metaDescription || webinar.description.substring(0, 160),
      images: [imageUrl],
      creator: '@bloomwellai',
      site: '@bloomwellai',
    },
    alternates: {
      canonical: webinarUrl,
    },
    other: {
      'event:start_time': startDate.toISOString(),
      'event:end_time': endDate.toISOString(),
      'event:location': webinar.jitsiRoomUrl || 'Online Event',
      'event:organizer': 'Bloomwell AI',
    },
  }
}

async function getWebinarBySlug(slug: string) {
  try {
    const webinar = await prisma.webinar.findFirst({
      where: {
        OR: [
          { slug: slug },
          { uniqueSlug: slug }
        ],
        status: {
          in: ['published', 'live', 'completed']
        }
      },
      include: {
        _count: {
          select: {
            rsvps: true
          }
        }
      }
    })

    if (!webinar) {
      return null
    }

    // Parse JSON fields from database
    const parsedWebinar = {
      ...webinar,
      categories: webinar.categories ? JSON.parse(webinar.categories) : [],
      guestSpeakers: webinar.guestSpeakers ? JSON.parse(webinar.guestSpeakers) : [],
      materials: webinar.materials ? JSON.parse(webinar.materials) : [],
      rsvpCount: webinar._count.rsvps
    }

    return parsedWebinar
  } catch (error) {
    console.error('Error fetching webinar:', error)
    return null
  }
}

export default async function WebinarPage({ params }: WebinarPageProps) {
  const { slug } = await params
  const webinar = await getWebinarBySlug(slug)
  
  if (!webinar) {
    notFound()
  }

  const startDate = new Date(webinar.scheduledDate)
  const endDate = new Date(startDate.getTime() + webinar.duration * 60 * 1000)

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": webinar.title,
    "description": webinar.description,
    "startDate": startDate.toISOString(),
    "endDate": endDate.toISOString(),
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": webinar.jitsiRoomUrl || `${process.env.NEXTAUTH_URL}/webinar/${webinar.slug || webinar.uniqueSlug}`
    },
    "organizer": {
      "@type": "Organization",
      "name": "Bloomwell AI",
      "url": process.env.NEXTAUTH_URL || "https://bloomwell-ai.com"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": `${process.env.NEXTAUTH_URL}/webinar/${webinar.slug || webinar.uniqueSlug}`
    },
    "image": webinar.socialImageUrl || webinar.thumbnailUrl,
    "url": `${process.env.NEXTAUTH_URL}/webinar/${webinar.slug || webinar.uniqueSlug}`,
    "inLanguage": "en-US",
    "audience": {
      "@type": "Audience",
      "audienceType": "Nonprofit Organizations"
    }
  }

  // Add guest speakers if available
  if (webinar.guestSpeakers && Array.isArray(webinar.guestSpeakers)) {
    structuredData.performer = webinar.guestSpeakers.map((speaker: any) => ({
      "@type": "Person",
      "name": speaker.name,
      "jobTitle": speaker.title,
      "worksFor": {
        "@type": "Organization",
        "name": speaker.company
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <WebinarDetailClient webinar={webinar} />
    </>
  )
}

