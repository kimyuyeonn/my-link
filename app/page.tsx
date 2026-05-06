"use client";

import { useState, useEffect } from "react";
import { dummyLinks, Link as LinkType } from "@/data/links";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import { Card } from "@/components/ui/card";
import {
  Camera,
  Video,
  Book,
  Code,
  Briefcase,
  Link as LinkIcon,
  Share2,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LINKS_PATH = "users/anonymous/links";

const iconMap: Record<string, React.ReactNode> = {
  instagram: <Camera className="w-5 h-5" />,
  youtube: <Video className="w-5 h-5" />,
  book: <Book className="w-5 h-5" />,
  github: <Code className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
};

export default function Page() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [titleError, setTitleError] = useState("");

  // Firestore 실시간 구독 + 최초 1회 시딩
  useEffect(() => {
    const linksRef = collection(db, LINKS_PATH);

    const seedAndSubscribe = async () => {
      // 컬렉션이 비어있으면 더미 데이터 시딩
      const snapshot = await getDocs(linksRef);
      if (snapshot.empty) {
        const batch = writeBatch(db);
        dummyLinks.forEach((link) => {
          const newDoc = doc(linksRef);
          batch.set(newDoc, {
            title: link.title,
            url: link.url,
            isActive: link.isActive,
            order: link.order,
            icon: link.icon ?? null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      }

      // 실시간 구독
      const q = query(linksRef, orderBy("order", "asc"));
      const unsubscribe = onSnapshot(q, (snap) => {
        const fetchedLinks: LinkType[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title,
            url: data.url,
            isActive: data.isActive ?? true,
            order: data.order ?? 0,
            icon: data.icon ?? undefined,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : data.createdAt ?? new Date().toISOString(),
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt ?? new Date().toISOString(),
          };
        });
        setLinks(fetchedLinks);
        setLoading(false);
      });

      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    seedAndSubscribe().then((fn) => {
      unsubscribe = fn;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError("");
    setTitleError("");

    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle || !newUrl.trim()) return;

    if (trimmedTitle.length > 50) {
      setTitleError("제목은 50자 이내로 입력해주세요.");
      return;
    }

    if (links.length >= 30) {
      alert("링크는 최대 30개까지만 추가할 수 있습니다.");
      return;
    }

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const parsedUrl = new URL(formattedUrl);
      if (!parsedUrl.hostname.includes(".")) throw new Error("Invalid domain");
    } catch {
      setUrlError("올바른 웹사이트 주소를 입력해주세요. (예: yuyeonkim.dev)");
      return;
    }

    try {
      setIsSubmitting(true);
      const linksRef = collection(db, LINKS_PATH);
      await addDoc(linksRef, {
        title: trimmedTitle,
        url: formattedUrl,
        isActive: true,
        order: links.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNewTitle("");
      setNewUrl("");
      setUrlError("");
      setTitleError("");
      setIsDialogOpen(false);
    } catch (err) {
      console.error("링크 추가 실패:", err);
      alert("링크 추가에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-svh flex-col items-center p-6 sm:p-12 overflow-hidden selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute bottom-0 right-0 top-0 hidden w-1/2 bg-[radial-gradient(ellipse_60%_60%_at_100%_50%,rgba(236,72,153,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_60%_at_100%_50%,rgba(236,72,153,0.15),rgba(255,255,255,0))] sm:block" />
        <div className="absolute bottom-0 left-0 top-0 hidden w-1/2 bg-[radial-gradient(ellipse_60%_60%_at_0%_50%,rgba(56,189,248,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_60%_at_0%_50%,rgba(56,189,248,0.15),rgba(255,255,255,0))] sm:block" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-10 mt-12 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Profile Area */}
        <div className="flex flex-col items-center text-center relative">
          <div className="absolute top-0 right-4 sm:right-0">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-md hover:bg-white/80 dark:hover:bg-black/40 text-slate-700 dark:text-slate-300 transition-all"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative mb-5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1 shadow-xl">
              <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-950 bg-muted/80 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <span className="text-3xl font-semibold text-white/50">Y</span>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-slate-950 rounded-full"></div>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            @yuyeonkim
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-2 font-medium max-w-[280px]">
            Frontend Developer 🚀
            <br />
            Sharing my projects & thoughts
          </p>
        </div>

        {/* Add Link Button */}
        <div className="flex justify-center">
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setNewTitle("");
                setNewUrl("");
                setUrlError("");
                setTitleError("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                새로운 링크 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleAddLink}>
                <DialogHeader>
                  <DialogTitle>새로운 링크 추가</DialogTitle>
                  <DialogDescription>
                    공유하고 싶은 웹사이트의 제목과 URL을 입력해주세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="title" className="text-right mt-3">
                      제목
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="title"
                        value={newTitle}
                        onChange={(e) => {
                          setNewTitle(e.target.value);
                          if (titleError) setTitleError("");
                        }}
                        placeholder="예: 나의 포트폴리오"
                        autoComplete="off"
                        maxLength={50}
                        className={
                          titleError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                      {titleError && (
                        <p className="text-sm text-red-500 mt-1.5 font-medium animate-in fade-in slide-in-from-top-1">
                          {titleError}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="url" className="text-right mt-3">
                      URL
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="url"
                        value={newUrl}
                        onChange={(e) => {
                          setNewUrl(e.target.value);
                          if (urlError) setUrlError("");
                        }}
                        placeholder="예: yuyeonkim.dev"
                        autoComplete="off"
                        className={
                          urlError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                      {urlError && (
                        <p className="text-sm text-red-500 mt-1.5 font-medium animate-in fade-in slide-in-from-top-1">
                          {urlError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={
                      !newTitle.trim() || !newUrl.trim() || isSubmitting
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        추가 중...
                      </>
                    ) : (
                      "추가하기"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Links Area */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 animate-in fade-in duration-500">
              <p>아직 등록된 링크가 없습니다.</p>
              <p className="text-sm mt-1">첫 번째 링크를 추가해보세요!</p>
            </div>
          ) : (
            links.map((link, index) => {
              const Icon = link.icon ? (
                iconMap[link.icon]
              ) : (
                <LinkIcon className="w-5 h-5" />
              );
              return (
                <Link
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-2xl outline-none group animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both"
                  style={{ animationDelay: `${150 * (index + 1)}ms` }}
                >
                  <Card
                    className="relative flex items-center p-4 min-h-[64px] transition-all duration-300 ease-out 
                    bg-white/60 dark:bg-slate-900/40 backdrop-blur-lg border border-slate-200/60 dark:border-slate-800/60
                    hover:-translate-y-1.5 hover:scale-[1.02] hover:bg-white/90 dark:hover:bg-slate-800/80 
                    hover:shadow-[0_10px_40px_rgb(168,85,247,0.15)] dark:hover:shadow-[0_10px_40px_rgb(168,85,247,0.1)]
                    hover:border-purple-500/40 dark:hover:border-purple-500/40"
                  >
                    {/* Icon Container */}
                    <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                      {Icon}
                    </div>

                    {/* Title */}
                    <div className="w-full text-center font-semibold text-slate-800 dark:text-slate-200 tracking-wide text-lg group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                      {link.title}
                    </div>
                  </Card>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer logo */}
        <div className="mt-8 mb-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <div className="w-5 h-5 rounded bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-[10px] text-white">
              M
            </div>
            MyLink
          </Link>
        </div>
      </div>
    </div>
  );
}
