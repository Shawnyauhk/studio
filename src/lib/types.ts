export type BusinessCard = {
  id: string;
  userId: string;
  name: string;
  title: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  companyDescription: string;
  notes: string;
  cardFrontImageUrl: string;
  cardBackImageUrl?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | Date;
};

export type DigitalCardData = {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  avatarUrl: string;
};
