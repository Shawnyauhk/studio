export type BusinessCard = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  notes: string;
  imageUrl: string;
  address: string;
  companyInfo?: {
    description: string;
  };
  createdAt: Date;
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
