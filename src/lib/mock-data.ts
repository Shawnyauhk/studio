import type { BusinessCard, DigitalCardData } from './types';

export const mockBusinessCards: BusinessCard[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    title: 'Lead Developer',
    company: 'Innovate Inc.',
    email: 'alice.j@innovate.com',
    phone: '123-456-7890',
    website: 'innovate.com',
    notes: 'Met at the tech conference. Interested in our new API.',
    imageUrl: 'https://picsum.photos/seed/card1/500/300',
    companyInfo: {
      description: 'Innovate Inc. is a leading provider of cloud solutions, specializing in AI-driven analytics.',
    },
    createdAt: new Date('2023-10-26'),
  },
  {
    id: '2',
    name: 'Bob Williams',
    title: 'Marketing Director',
    company: 'Solutions Co.',
    email: 'bob.w@solutions.co',
    phone: '098-765-4321',
    notes: 'Follow up regarding the marketing proposal next week.',
    imageUrl: 'https://picsum.photos/seed/card2/500/300',
    createdAt: new Date('2023-11-15'),
  },
  {
    id: '3',
    name: 'Charlie Brown',
    title: 'CEO',
    company: 'Creative Designs',
    email: 'charlie@creativedesigns.io',
    phone: '555-555-5555',
    website: 'creativedesigns.io',
    notes: '',
    imageUrl: 'https://picsum.photos/seed/card3/500/300',
    companyInfo: {
      description: 'Creative Designs offers bespoke design services for digital and print media, helping brands to stand out.',
    },
    createdAt: new Date('2024-01-20'),
  },
];

export const mockUserDigitalCard: DigitalCardData = {
    name: "Alex Doe",
    title: "Full Stack Developer",
    company: "BizCard Portfolio",
    phone: "+1 800 123 4567",
    email: "alex.doe@example.com",
    website: "www.example.com",
    address: "123 Innovation Drive, Tech City",
    avatarUrl: "https://picsum.photos/seed/useravatar/200/200",
};
