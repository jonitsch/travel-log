import { PrismaClient } from "../../generated/prisma/client/client";

const prisma = new PrismaClient();

export { prisma };

/* export async function getJourneys() {
  let markers = await prisma.journey.findMany()
  return markers;
}
*/

export type Data = {
  journeys: Journey[]
};

export type Journey = {
  journeyId: string;
  name: string;
  color: string;
  lng: number;
  lat: number;
  marker: {
    journeyId: string;
    name: string;
    color: string;
    lng: number;
    lat: number;
    id: number;
  }[];
  image: {
    id: number;
    journeyId: string;
    lng: number | null;
    lat: number | null;
    path: string;
    fileName: string;
    width: number;
    height: number;
  }[];
};

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
