import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import WebinarCalendar from '@/components/WebinarCalendar';
import WebinarsContent from './WebinarsContent';

export const metadata: Metadata = {
  title: 'Upcoming Webinars for Nonprofit Leaders | Bloomwell AI',
  description:
    'Expert-led webinar sessions to help your nonprofit organization thrive. Learn from industry leaders and connect with peers in grant writing, board governance, fundraising, and more.',
  keywords:
    'webinar, nonprofit, training, education, grant writing, board governance, fundraising, operations, strategic planning',
  authors: [{ name: 'Bloomwell AI' }],
  creator: 'Bloomwell AI',
  publisher: 'Bloomwell AI',
  openGraph: {
    title: 'Upcoming Webinars for Nonprofit Leaders',
    description:
      'Expert-led sessions to help your organization thrive. Learn from industry leaders and connect with peers.',
    url: `${process.env.NEXTAUTH_URL}/webinars`,
    siteName: 'Bloomwell AI',
    images: [
      {
        url: `${process.env.NEXTAUTH_URL}/images/webinar-listing.jpg`,
        width: 1200,
        height: 630,
        alt: 'Bloomwell AI Webinars',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upcoming Webinars for Nonprofit Leaders',
    description:
      'Expert-led sessions to help your organization thrive. Learn from industry leaders and connect with peers.',
    images: [`${process.env.NEXTAUTH_URL}/images/webinar-listing.jpg`],
    creator: '@bloomwellai',
    site: '@bloomwellai',
  },
  alternates: {
    canonical: `${process.env.NEXTAUTH_URL}/webinars`,
  },
};

async function getWebinars() {
  try {
    const webinars = await prisma.webinar.findMany({
      where: {
        status: 'published',
        isPublished: true,
      },
      include: {
        _count: {
          select: {
            WebinarRSVP: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
    });

    return webinars.map(webinar => ({
      id: webinar.id,
      title: webinar.title,
      description: webinar.description,
      scheduledDate: webinar.scheduledDate.toISOString(),
      timezone: webinar.timezone,
      duration: webinar.duration,
      thumbnailUrl: webinar.thumbnailUrl,
      slug: webinar.slug || webinar.uniqueSlug,
      status: webinar.status,
      rsvpCount: webinar._count.WebinarRSVP,
      maxAttendees: webinar.maxAttendees,
      categories: webinar.categories
        ? typeof webinar.categories === 'string'
          ? JSON.parse(webinar.categories)
          : webinar.categories
        : [],
      guestSpeakers: webinar.guestSpeakers
        ? typeof webinar.guestSpeakers === 'string'
          ? JSON.parse(webinar.guestSpeakers)
          : webinar.guestSpeakers
        : [],
      materials: webinar.materials
        ? typeof webinar.materials === 'string'
          ? JSON.parse(webinar.materials)
          : webinar.materials
        : [],
      jitsiRoomUrl: webinar.jitsiRoomUrl,
      metaDescription: webinar.metaDescription,
      socialImageUrl: webinar.socialImageUrl,
    }));
  } catch (error) {
    console.error('Error fetching webinars:', error);
    return [];
  }
}

async function getUserRSVPs(userId: string) {
  try {
    const rsvps = await prisma.webinarRSVP.findMany({
      where: {
        userId,
      },
      include: {
        Webinar: {
          select: {
            id: true,
            title: true,
            scheduledDate: true,
            slug: true,
            uniqueSlug: true,
          },
        },
      },
      orderBy: {
        rsvpDate: 'desc',
      },
    });

    return rsvps
      .filter(rsvp => new Date(rsvp.Webinar.scheduledDate) > new Date())
      .map(rsvp => ({
        id: rsvp.id,
        webinarId: rsvp.Webinar.id,
        title: rsvp.Webinar.title,
        scheduledDate: rsvp.Webinar.scheduledDate.toISOString(),
        slug: rsvp.Webinar.slug || rsvp.Webinar.uniqueSlug,
      }));
  } catch (error) {
    console.error('Error fetching user RSVPs:', error);
    return [];
  }
}

export default async function WebinarsPage() {
  const session = await getServerSession(authOptions);
  const webinars = await getWebinars();
  const userRSVPs = session?.user?.id
    ? await getUserRSVPs(session.user.id)
    : [];

  return (
    <WebinarsContent
      webinars={webinars}
      userRSVPs={userRSVPs}
      isAuthenticated={!!session?.user}
    />
  );
}
