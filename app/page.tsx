import { dummyLinks } from "@/data/links";
import { Card } from "@/components/ui/card";
import { Camera, Video, Book, Code, Briefcase, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, React.ReactNode> = {
  instagram: <Camera className="w-5 h-5" />,
  youtube: <Video className="w-5 h-5" />,
  book: <Book className="w-5 h-5" />,
  github: <Code className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
};

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col items-center p-6 sm:p-12">
      <div className="w-full max-w-md flex flex-col gap-8 mt-12">
        {/* Profile Area Placeholder */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-muted mb-4" />
          <h1 className="text-xl font-bold">@username</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            이곳에 프로필 소개글이 들어갑니다.
          </p>
        </div>

        {/* Links Area */}
        <div className="flex flex-col gap-4">
          {dummyLinks.map((link) => {
            const Icon = link.icon ? iconMap[link.icon] : <LinkIcon className="w-5 h-5" />;
            return (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full focus:outline-none focus:ring-2 focus:ring-ring rounded-xl outline-none"
              >
                <Card className="flex items-center p-4 transition-all duration-200 hover:scale-[1.02] hover:bg-accent hover:text-accent-foreground cursor-pointer shadow-sm">
                  <div className="flex items-center justify-center w-10">
                    {Icon}
                  </div>
                  <div className="flex-1 text-center font-medium pr-10">
                    {link.title}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
