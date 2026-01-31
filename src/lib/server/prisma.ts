import { env } from "$env/dynamic/private";
import { Prisma, PrismaClient } from "$gen/prisma/client/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(env.DATABASE_URL) });

export { prisma };

export type Data = {
  journeys: {
    journeyId: string;
    name: string;
    color: string;
    lng: number;
    lat: number;
    marker: Marker[];
    image: Image[];
  }[]
};

export type Journey = {
  journeyId: string;
  name: string;
  color: string;
  lng: number;
  lat: number;
  marker: Marker[];
  image: Image[];
};

export type Image = {
  id: string;
  journeyId: string;
  lng: number | null;
  lat: number | null;
  path: string;
  fileName: string;
  fileType: string | null;
  createdOn: Date;
  width: number;
  height: number;
};

export type Marker = {
  id: number;
  name: string;
  lng: number;
  lat: number;
  color: string | null;
  journeyId: string;
};
