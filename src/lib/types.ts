export type BilingualString = {
  en: string;
  zh: string;
};

export type BusinessCard = {
  id: string;
  userId: string;
  name: BilingualString | string; // Support legacy string format for old data
  title: BilingualString | string;
  companyName: BilingualString | string;
  email: string;
  phone: string;
  address: BilingualString | string;
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
