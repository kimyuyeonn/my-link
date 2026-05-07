export interface Link {
  id: string; // Document ID (linkId)
  title: string;
  url: string;
  isActive: boolean;
  order: number;
  createdAt: string; // ISO string for dummy data
  updatedAt: string;
  icon?: string;
  favicon?: string;
}

export const dummyLinks: Link[] = [
  {
    id: "link-1",
    title: "Instagram",
    url: "https://instagram.com",
    isActive: true,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "instagram",
  },
  {
    id: "link-2",
    title: "YouTube",
    url: "https://youtube.com",
    isActive: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "youtube",
  },
  {
    id: "link-3",
    title: "Blog",
    url: "https://section.blog.naver.com/BlogHome.naver?directoryNo=0&currentPage=1&groupId=0",
    isActive: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "book",
  },
  {
    id: "link-4",
    title: "GitHub",
    url: "https://github.com/kimyuyeonn",
    isActive: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "github",
  },
  {
    id: "link-5",
    title: "Portfolio",
    url: "https://portfolio.example.com",
    isActive: true,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "briefcase",
  },
];
