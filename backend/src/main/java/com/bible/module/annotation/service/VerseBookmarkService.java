package com.bible.module.annotation.service;

import com.bible.module.annotation.dto.BookmarkRequest;
import com.bible.module.annotation.dto.BookmarkResponse;
import com.bible.module.annotation.entity.VerseBookmark;
import com.bible.module.annotation.mapper.VerseBookmarkMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VerseBookmarkService {

    private final VerseBookmarkMapper bookmarkMapper;

    @Transactional
    public BookmarkResponse toggle(UUID userId, BookmarkRequest req) {
        VerseBookmark existing = bookmarkMapper.findByUserAndVerse(
                userId, req.getVersionId(), req.getBookId(),
                req.getChapterNumber(), req.getVerseNumber());
        if (existing != null) {
            bookmarkMapper.deleteById(existing.getId());
            return toResponse(existing, false);
        }

        VerseBookmark bookmark = new VerseBookmark();
        bookmark.setId(UUID.randomUUID());
        bookmark.setUserId(userId);
        bookmark.setVersionId(req.getVersionId());
        bookmark.setBookId(req.getBookId());
        bookmark.setChapterNumber(req.getChapterNumber());
        bookmark.setVerseNumber(req.getVerseNumber());
        bookmark.setCreatedAt(LocalDateTime.now());
        bookmarkMapper.insert(bookmark);
        return toResponse(bookmark, true);
    }

    public List<BookmarkResponse> listByUser(UUID userId, int page, int size) {
        int offset = (page - 1) * size;
        return bookmarkMapper.findByUserId(userId, offset, size)
                .stream()
                .map(b -> toResponse(b, true))
                .collect(Collectors.toList());
    }

    public BookmarkResponse check(UUID userId, UUID versionId, UUID bookId,
                                  int chapterNumber, int verseNumber) {
        VerseBookmark existing = bookmarkMapper.findByUserAndVerse(
                userId, versionId, bookId, chapterNumber, verseNumber);
        if (existing != null) {
            return toResponse(existing, true);
        }
        return BookmarkResponse.builder()
                .versionId(versionId)
                .bookId(bookId)
                .chapterNumber(chapterNumber)
                .verseNumber(verseNumber)
                .bookmarked(false)
                .build();
    }

    private BookmarkResponse toResponse(VerseBookmark b, boolean bookmarked) {
        return BookmarkResponse.builder()
                .id(b.getId())
                .versionId(b.getVersionId())
                .bookId(b.getBookId())
                .chapterNumber(b.getChapterNumber())
                .verseNumber(b.getVerseNumber())
                .createdAt(b.getCreatedAt())
                .bookmarked(bookmarked)
                .build();
    }
}
