import { PrismaClient } from "../../generated/prisma/client/client";

const prisma = new PrismaClient();

export { prisma };

/* export async function getJourneys() {
  let markers = await prisma.journey.findMany()
  return markers;
}
*/

export type Markers = ({
  journey: {
    name: string;
    color: string;
    journeyId: string;
  };
} & {
  id: number;
  name: string;
  lng: number;
  lat: number;
  color: string | null;
  journeyId: string;
  nextId: string | null;
})[]

export async function getMarkers(journeyId: string) {
  let markers = await prisma.marker.findMany(
    {
      include: {
        journey: {
        }
      },
      where: {
        journeyId: journeyId
      }
    }
  )
  return markers;
}
