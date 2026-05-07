"use client";

import { useState, useEffect } from "react";
import { dummyLinks, Link as LinkType } from "@/data/links";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";
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
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
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
  Pencil,
  Trash2,
  Check,
  X,
  Sparkles,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ReactNode> = {
  instagram: <Camera className="w-5 h-5" />,
  youtube: <Video className="w-5 h-5" />,
  book: <Book className="w-5 h-5" />,
  github: <Code className="w-5 h-5" />,
  briefcase: <Briefcase className="w-5 h-5" />,
};

export default function Page() {
  const { user, loading: authLoading, login } = useAuth();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create state
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [titleError, setTitleError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editUrlError, setEditUrlError] = useState("");
  const [editTitleError, setEditTitleError] = useState("");

  // Delete state
  const [deletingLink, setDeletingLink] = useState<LinkType | null>(null);

  // User Profile state
  const [profile, setProfile] = useState<{ displayName: string; email: string; photoURL: string; bio: string } | null>(null);

  const linksPath = user ? `users/${user.uid}/links` : null;
  const userPath = user ? `users/${user.uid}` : null;

  // Firestore 실시간 구독 + 유저 정보 관리
  useEffect(() => {
    if (!user || !linksPath || !userPath) {
      setLinks([]);
      setProfile(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, userPath);
    const linksRef = collection(db, linksPath);

    const setupData = async () => {
      // 1. 유저 정보 관리
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        const initialProfile = {
          displayName: user.displayName || "User",
          email: user.email || "",
          photoURL: user.photoURL || "",
          bio: "반갑습니다! 저의 멀티링크 페이지입니다. 🚀",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, initialProfile);
        setProfile(initialProfile as any);
      } else {
        setProfile(docSnap.data() as any);
      }

      // 2. 링크 실시간 구독
      const q = query(linksRef, orderBy("createdAt", "desc"));
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
            favicon: data.favicon ?? undefined,
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
    let isCancelled = false;

    const setup = async () => {
      const unsub = await setupData();
      if (isCancelled) {
        if (typeof unsub === "function") unsub();
      } else {
        unsubscribe = unsub as any;
      }
    };

    setup();

    return () => {
      isCancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [user, linksPath, userPath]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linksPath) return;
    
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
      const linksRef = collection(db, linksPath);
      
      // Extract domain for favicon
      let faviconUrl = "";
      try {
        const hostname = new URL(formattedUrl).hostname;
        faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;
      } catch (e) {
        console.error("Favicon error:", e);
      }

      await addDoc(linksRef, {
        title: trimmedTitle,
        url: formattedUrl,
        isActive: true,
        order: links.length,
        favicon: faviconUrl,
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

  const handleStartEdit = (link: LinkType) => {
    setEditingId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditTitleError("");
    setEditUrlError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditUrl("");
  };

  const handleUpdateLink = async (id: string) => {
    if (!linksPath) return;
    setEditTitleError("");
    setEditUrlError("");

    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle || !editUrl.trim()) return;

    if (trimmedTitle.length > 50) {
      setEditTitleError("제목은 50자 이내로 입력해주세요.");
      return;
    }

    let formattedUrl = editUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const parsedUrl = new URL(formattedUrl);
      if (!parsedUrl.hostname.includes(".")) throw new Error("Invalid domain");
    } catch {
      setEditUrlError("올바른 웹사이트 주소를 입력해주세요. (예: yuyeonkim.dev)");
      return;
    }

    try {
      setIsSubmitting(true);
      const linkRef = doc(db, linksPath, id);

      // Extract domain for favicon
      let faviconUrl = "";
      try {
        const hostname = new URL(formattedUrl).hostname;
        faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;
      } catch (e) {
        console.error("Favicon error:", e);
      }

      await updateDoc(linkRef, {
        title: trimmedTitle,
        url: formattedUrl,
        favicon: faviconUrl,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
    } catch (err) {
      console.error("링크 수정 실패:", err);
      alert("링크 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!deletingLink || !linksPath) return;
    try {
      setIsSubmitting(true);
      const linkRef = doc(db, linksPath, deletingLink.id);
      await deleteDoc(linkRef);
      setDeletingLink(null);
    } catch (err) {
      console.error("링크 삭제 실패:", err);
      alert("링크 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center p-6 sm:p-12 overflow-hidden selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <div className="absolute bottom-0 right-0 top-0 hidden w-1/2 bg-[radial-gradient(ellipse_60%_60%_at_100%_50%,rgba(236,72,153,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_60%_at_100%_50%,rgba(236,72,153,0.15),rgba(255,255,255,0))] sm:block" />
        <div className="absolute bottom-0 left-0 top-0 hidden w-1/2 bg-[radial-gradient(ellipse_60%_60%_at_0%_50%,rgba(56,189,248,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_60%_60%_at_0%_50%,rgba(56,189,248,0.15),rgba(255,255,255,0))] sm:block" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-10 mt-12 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {!user ? (
          <div className="flex flex-col items-center text-center space-y-10 py-16 animate-in fade-in zoom-in duration-1000">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-[2.5rem] bg-white dark:bg-slate-900 flex items-center justify-center shadow-2xl border border-slate-200/50 dark:border-slate-800/50">
                <Sparkles className="w-12 h-12 text-purple-500 animate-bounce [animation-duration:3s]" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                  세상의 모든 나를 <br />
                  한 곳에 담으세요
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-[320px] mx-auto text-lg font-medium leading-relaxed">
                나만의 특별한 멀티링크 프로필을 <br />
                지금 바로 시작해보세요.
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={login}
              className="group relative rounded-full px-10 h-16 text-lg font-bold overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl shadow-purple-500/25 border-0"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 transition-transform duration-500 group-hover:scale-110" />
              <span className="relative flex items-center gap-2 text-white">
                시작하기
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              </span>
            </Button>
          </div>
        ) : (
          <>
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
                  <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-950 bg-muted/80 backdrop-blur-sm flex items-center justify-center overflow-hidden text-white font-bold">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl uppercase">{profile?.displayName?.[0] || user.email?.[0]}</span>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-slate-950 rounded-full"></div>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                @{profile?.displayName || "User"}
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-400 mt-2 font-medium max-w-[320px]">
                {profile?.bio || "나만의 링크를 관리해보세요!"}
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
                  <Button className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 px-6 h-11 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold">
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
                        className="w-full sm:w-auto"
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
                <div className="text-center py-12 px-6 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in duration-500">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <LinkIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-slate-900 dark:text-slate-100 font-semibold">아직 등록된 링크가 없습니다.</p>
                  <p className="text-sm text-slate-500 mt-1">첫 번째 링크를 추가하여 프로필을 완성해보세요!</p>
                </div>
              ) : (
                links.map((link, index) => {
                  const isEditing = editingId === link.id;
                  const Icon = link.icon ? (
                    iconMap[link.icon]
                  ) : (
                    <LinkIcon className="w-5 h-5" />
                  );

                  return (
                    <div
                      key={link.id}
                      className="w-full group animate-in slide-in-from-bottom-8 fade-in duration-700 fill-mode-both"
                      style={{ animationDelay: `${100 * (index + 1)}ms` }}
                    >
                      <Card
                        className={cn(
                          "relative flex flex-col p-4 min-h-[64px] transition-all duration-300 ease-out border-0",
                          "bg-white/60 dark:bg-slate-900/40 backdrop-blur-lg shadow-sm border border-slate-200/50 dark:border-slate-800/50",
                          !isEditing && "hover:-translate-y-1.5 hover:scale-[1.02] hover:bg-white/90 dark:hover:bg-slate-800/80 hover:shadow-[0_10px_40px_rgb(168,85,247,0.15)] dark:hover:shadow-[0_10px_40px_rgb(168,85,247,0.1)] hover:border-purple-500/40 dark:hover:border-purple-500/40",
                          isEditing && "border-purple-500/50 ring-2 ring-purple-500/20 bg-white dark:bg-slate-900 shadow-xl"
                        )}
                      >
                        {isEditing ? (
                          <div className="flex flex-col gap-3 w-full animate-in fade-in duration-300">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 space-y-3">
                                <div className="space-y-1">
                                  <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="제목"
                                    className={cn("h-10 rounded-xl", editTitleError && "border-red-500 focus-visible:ring-red-500")}
                                    autoFocus
                                  />
                                  {editTitleError && (
                                    <p className="text-[10px] text-red-500 font-medium">{editTitleError}</p>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <Input
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    placeholder="URL"
                                    className={cn("h-10 rounded-xl", editUrlError && "border-red-500 focus-visible:ring-red-500")}
                                  />
                                  {editUrlError && (
                                    <p className="text-[10px] text-red-500 font-medium">{editUrlError}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-10 w-10 rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700"
                                  onClick={() => handleUpdateLink(link.id)}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-10 w-10 rounded-full bg-slate-200/50 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                  onClick={handleCancelEdit}
                                  disabled={isSubmitting}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <Link
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center flex-1 gap-4 focus:outline-none"
                            >
                              {/* Icon Container */}
                              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm overflow-hidden">
                                {link.favicon ? (
                                  <img 
                                    src={link.favicon} 
                                    alt={link.title} 
                                    className="w-7 h-7 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : link.icon ? (
                                  iconMap[link.icon]
                                ) : (
                                  <LinkIcon className="w-5 h-5" />
                                )}
                              </div>

                              {/* Title */}
                              <div className="font-bold text-slate-800 dark:text-slate-200 tracking-tight text-lg group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                                {link.title}
                              </div>
                            </Link>

                            {/* Action Buttons */}
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                                onClick={() => handleStartEdit(link)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                onClick={() => setDeletingLink(link)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  );
                })
              )}
            </div>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)}>
              <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>링크를 삭제할까요?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-3 pt-2">
                      <p>
                        <span className="font-bold text-slate-900 dark:text-slate-100">&quot;{deletingLink?.title}&quot;</span> 링크가 영구적으로 삭제됩니다.
                      </p>
                      <p className="text-red-500 font-medium text-sm">
                        이 작업은 되돌릴 수 없습니다.
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel disabled={isSubmitting} className="rounded-full">취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteLink();
                    }}
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-full font-bold"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    삭제하기
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {/* Footer logo */}
        <div className="mt-8 mb-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400">
              M
            </div>
            MyLink
          </Link>
        </div>
      </div>
    </div>
  );
}
