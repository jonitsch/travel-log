import { env } from "$env/dynamic/private";
import { PrismaClient } from "$gen/prisma/client/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(env.DATABASE_URL)});

export { prisma };

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
