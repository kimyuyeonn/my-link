export interface Link {
  id: string; // Document ID (linkId)
  title: string;
  url: string;
  isActive: boolean;
  order: number;
  createdAt: string; // ISO string for dummy data
  updatedAt: string;
  icon?: string; // 추후 고도화 기능 (사용자 요청 사항 반영)
}

export const dummyLinks: Link[] = [
  {
    id: "link-1",
    title: "인스타그램",
    url: "https://instagram.com",
    isActive: true,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "instagram",
  },
  {
    id: "link-2",
    title: "유튜브",
    url: "https://youtube.com",
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "youtube",
  },
  {
    id: "link-3",
    title: "블로그",
    url: "https://blog.example.com",
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "book",
  },
  {
    id: "link-4",
    title: "Github",
    url: "https://github.com/kimyuyeonn",
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "github",
  },
  {
    id: "link-5",
    title: "포트폴리오",
    url: "https://portfolio.example.com",
    isActive: true,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "briefcase",
  },
];
