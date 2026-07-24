'use client';

import { useEffect, useRef, useState } from 'react';
import { annotationApi, bookmarkApi, messageApi } from '@/services/api';
import ChatModal from './ChatModal';

interface VerseItem {
  versionId: string;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
}

interface ScriptureData {
  generationRecordId: string;
  referenceText: string;
  generationType: string;
  verses: VerseItem[];
}

interface AuthorInfo {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

interface Annotation {
  id: string;
  userId: string;
  versionId: string;
  bookId: string;
  chapterNumber: number;
  startVerse: number;
  endVerse: number;
  selectedText?: string;
  noteContent?: string;
  visibility: 'private' | 'public';
  author?: AuthorInfo;
  createdAt: string;
}

interface BookmarkMap {
  [key: string]: boolean;
}

export default function ScriptureReader({
  scripture,
  currentUserId,
}: {
  scripture: ScriptureData;
  currentUserId?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userAnnotations, setUserAnnotations] = useState<Annotation[]>([]);
  const [publicAnnotations, setPublicAnnotations] = useState<Annotation[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 文本选择
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);

  // 标注弹窗
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [savingAnnotation, setSavingAnnotation] = useState(false);

  // 私信弹窗
  const [chatTarget, setChatTarget] = useState<AuthorInfo | null>(null);

  // 加载标注与收藏
  useEffect(() => {
    if (!scripture?.verses?.length) return;
    loadAnnotations();
    loadBookmarks();
  }, [scripture]);

  const chapterGroups = () => {
    const groups = new Map<string, { versionId: string; bookId: string; chapterNumber: number }>();
    scripture.verses.forEach((v) => {
      const key = `${v.versionId}|${v.bookId}|${v.chapterNumber}`;
      if (!groups.has(key)) {
        groups.set(key, { versionId: v.versionId, bookId: v.bookId, chapterNumber: v.chapterNumber });
      }
    });
    return Array.from(groups.values());
  };

  const loadAnnotations = async () => {
    setLoading(true);
    setError('');
    try {
      const groups = chapterGroups();
      const userResults: Annotation[] = [];
      const publicResults: Annotation[] = [];
      await Promise.all(
        groups.map(async (g) => {
          const [uRes, pRes] = await Promise.all([
            annotationApi.list({ versionId: g.versionId, bookId: g.bookId, chapterNumber: g.chapterNumber }),
            annotationApi.listPublic({ versionId: g.versionId, bookId: g.bookId, chapterNumber: g.chapterNumber }),
          ]);
          userResults.push(...(uRes.data.data || []));
          publicResults.push(...(pRes.data.data || []));
        })
      );
      setUserAnnotations(userResults);
      setPublicAnnotations(publicResults);
    } catch (err: any) {
      setError(err.response?.data?.message || '加载标注失败');
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const res = await bookmarkApi.list(1, 1000);
      const list = res.data.data || [];
      const map: BookmarkMap = {};
      list.forEach((b: any) => {
        map[`${b.bookId}:${b.chapterNumber}:${b.verseNumber}`] = true;
      });
      setBookmarks(map);
    } catch {
      // 收藏加载失败不影响主流程
    }
  };

  // 监听文本选择
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-annotation-toolbar]') || target.closest('[data-annotation-modal]')) {
        return;
      }
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !containerRef.current) {
        setSelectedRange(null);
        setToolbarPos(null);
        return;
      }
      const range = selection.getRangeAt(0);
      if (!containerRef.current.contains(range.commonAncestorContainer)) {
        setSelectedRange(null);
        setToolbarPos(null);
        return;
      }
      const startEl = findVerseElement(range.startContainer);
      const endEl = findVerseElement(range.endContainer);
      if (!startEl || !endEl) {
        setSelectedRange(null);
        setToolbarPos(null);
        return;
      }
      const start = parseInt(startEl.dataset.verseIdx || '0', 10);
      const end = parseInt(endEl.dataset.verseIdx || '0', 10);
      setSelectedRange({ start: Math.min(start, end), end: Math.max(start, end) });
      setSelectedText(selection.toString().trim());
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setToolbarPos({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 12,
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-annotation-toolbar]') || target.closest('[data-annotation-modal]')) {
        return;
      }
      setToolbarPos(null);
      setSelectedRange(null);
      window.getSelection()?.removeAllRanges();
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const findVerseElement = (node: Node): HTMLElement | null => {
    let el: HTMLElement | null = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    while (el && el !== containerRef.current) {
      if (el.dataset.verseIdx !== undefined) return el;
      el = el.parentElement;
    }
    return null;
  };

  const handleBookmark = async (verseIdx: number) => {
    const v = scripture.verses[verseIdx];
    if (!v) return;
    try {
      await bookmarkApi.toggle({
        versionId: v.versionId,
        bookId: v.bookId,
        chapterNumber: v.chapterNumber,
        verseNumber: v.verseNumber,
      });
      setBookmarks((prev) => {
        const key = `${v.bookId}:${v.chapterNumber}:${v.verseNumber}`;
        const next = { ...prev };
        if (next[key]) delete next[key];
        else next[key] = true;
        return next;
      });
      setToolbarPos(null);
      setSelectedRange(null);
      window.getSelection()?.removeAllRanges();
    } catch (err: any) {
      setError(err.response?.data?.message || '收藏失败');
    }
  };

  const openAnnotationModal = () => {
    if (!selectedRange) return;
    setNoteContent('');
    setVisibility('private');
    setShowAnnotationModal(true);
  };

  const saveAnnotation = async () => {
    if (!selectedRange) return;
    setSavingAnnotation(true);
    setError('');
    try {
      const start = scripture.verses[selectedRange.start];
      const end = scripture.verses[selectedRange.end];
      if (!start || !end) return;
      await annotationApi.create({
        referenceText: `${start.bookName} ${start.chapterNumber}:${start.verseNumber}-${end.verseNumber}`,
        versionId: start.versionId,
        bookId: start.bookId,
        chapterNumber: start.chapterNumber,
        startVerse: start.verseNumber,
        endVerse: end.verseNumber,
        selectedText,
        noteContent: noteContent.trim(),
        visibility,
      });
      setShowAnnotationModal(false);
      setToolbarPos(null);
      setSelectedRange(null);
      window.getSelection()?.removeAllRanges();
      await loadAnnotations();
    } catch (err: any) {
      setError(err.response?.data?.message || '保存标注失败');
    } finally {
      setSavingAnnotation(false);
    }
  };

  const isVerseInUserAnnotation = (idx: number) => {
    const v = scripture.verses[idx];
    return userAnnotations.some(
      (a) =>
        a.bookId === v.bookId &&
        a.chapterNumber === v.chapterNumber &&
        a.startVerse <= v.verseNumber &&
        a.endVerse >= v.verseNumber
    );
  };

  const publicAnnotationsForVerse = (idx: number) => {
    const v = scripture.verses[idx];
    const list = publicAnnotations.filter(
      (a) =>
        a.bookId === v.bookId &&
        a.chapterNumber === v.chapterNumber &&
        a.startVerse <= v.verseNumber &&
        a.endVerse >= v.verseNumber
    );
    // 按用户去重
    const seen = new Set<string>();
    return list.filter((a) => {
      if (!a.author || seen.has(a.author.id)) return false;
      seen.add(a.author.id);
      return true;
    });
  };

  const isSelected = (idx: number) => {
    if (!selectedRange) return false;
    return idx >= selectedRange.start && idx <= selectedRange.end;
  };

  return (
    <div className="space-y-6">
      <div className="scripture-card relative" ref={containerRef}>
        <div className="text-center text-bible-gold text-sm font-semibold mb-4 tracking-wider">
          {scripture.referenceText}
        </div>

        {loading && (
          <div className="text-center text-bible-muted py-2 text-sm">正在加载标注...</div>
        )}

        <div className="verse-text space-y-3 select-text">
          {scripture.verses.map((v, idx) => {
            const bookmarked = bookmarks[`${v.bookId}:${v.chapterNumber}:${v.verseNumber}`];
            const publicList = publicAnnotationsForVerse(idx);
            return (
              <div key={idx} className="relative">
                <p
                  data-verse-idx={idx}
                  data-book-id={v.bookId}
                  data-chapter={v.chapterNumber}
                  data-verse={v.verseNumber}
                  className={`inline leading-relaxed rounded px-1 transition-colors ${
                    isSelected(idx)
                      ? 'bg-amber-200'
                      : isVerseInUserAnnotation(idx)
                      ? 'bg-amber-100'
                      : ''
                  }`}
                >
                  <sup className="verse-number">{v.verseNumber}</sup>
                  {v.text}
                  {bookmarked && (
                    <svg
                      className="inline-block w-3.5 h-3.5 ml-1 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                </p>

                {publicList.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 ml-6">
                    {publicList.map((a) =>
                      a.author ? (
                        <button
                          key={a.author.id}
                          onClick={() => setChatTarget(a.author!)}
                          title={`${a.author.displayName} 的默想：${a.noteContent || ''}`}
                          className="w-6 h-6 rounded-full bg-bible-gold/10 border border-bible-gold/30 flex items-center justify-center overflow-hidden hover:ring-2 ring-bible-gold/50"
                        >
                          {a.author.avatarUrl ? (
                            <img
                              src={a.author.avatarUrl}
                              alt={a.author.displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-bible-gold font-bold">
                              {(a.author.displayName || '?').charAt(0)}
                            </span>
                          )}
                        </button>
                      ) : null
                    )}
                    <span className="text-[10px] text-bible-muted">公开默想</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 选择工具栏 */}
        {toolbarPos && selectedRange && (
          <div
            data-annotation-toolbar
            className="absolute z-20 -translate-x-1/2 -translate-y-full flex items-center gap-1 bg-white border border-bible-warm rounded-lg shadow-lg px-2 py-1.5"
            style={{ left: toolbarPos.x, top: toolbarPos.y }}
          >
            <button
              onClick={openAnnotationModal}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-bible-dark hover:bg-bible-cream rounded"
            >
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              划线/默想
            </button>
            <div className="w-px h-4 bg-bible-warm" />
            <button
              onClick={() => handleBookmark(selectedRange.start)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-bible-dark hover:bg-bible-cream rounded"
            >
              <svg
                className={`w-4 h-4 ${
                  bookmarks[`${scripture.verses[selectedRange.start]?.bookId}:${scripture.verses[selectedRange.start]?.chapterNumber}:${scripture.verses[selectedRange.start]?.verseNumber}`]
                    ? 'text-red-500'
                    : 'text-bible-muted'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              收藏
            </button>
          </div>
        )}
      </div>

      {error && <div className="text-center text-red-500 bg-red-50 rounded-lg py-2 px-4 text-sm">{error}</div>}

      {/* 标注弹窗 */}
      {showAnnotationModal && selectedRange && (
        <div
          data-annotation-modal
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAnnotationModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-bible-dark">添加默想</h3>
            <p className="text-xs text-bible-muted">
              {scripture.verses[selectedRange.start]?.bookName}{' '}
              {scripture.verses[selectedRange.start]?.chapterNumber}:
              {scripture.verses[selectedRange.start]?.verseNumber}
              {selectedRange.start !== selectedRange.end &&
                `-${scripture.verses[selectedRange.end]?.verseNumber}`}
            </p>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="写下你对这段经文的默想..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-bible-gold resize-none"
            />
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                />
                仅自己可见
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                />
                公开给他人
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAnnotationModal(false)}
                className="px-4 py-2 text-sm text-bible-muted hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={saveAnnotation}
                disabled={savingAnnotation}
                className="px-4 py-2 text-sm bg-bible-gold text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                {savingAnnotation ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 私信弹窗 */}
      {chatTarget && (
        <ChatModal
          targetUser={chatTarget}
          currentUserId={currentUserId}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
}
