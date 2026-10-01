import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags?: string[];
  coverImage?: string;
  coverImageCredit?: string;
  coverImageCreditUrl?: string;
  source?: string;
  sourceUrl?: string;
}

export interface PostItem extends PostMeta {
  content: string;
}

/**
 * posts 디렉토리가 없으면 자동 생성하여 안전하게 접근
 */
function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

/**
 * 모든 포스트의 메타데이터 목록을 최신순으로 반환
 */
export function getAllPosts(): PostMeta[] {
  ensurePostsDirectory();

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      const { data } = matter(fileContents);

      // draft: true인 초안 글은 블로그 공개 목록에서 완전 제외
      if (data.draft === true) {
        return null;
      }

      return {
        slug,
        title: data.title || "제목 없음",
        date: data.date || new Date().toISOString().substring(0, 10),
        summary: data.summary || "",
        category: data.category || "트렌드 분석",
        tags: Array.isArray(data.tags)
          ? data.tags
          : typeof data.tags === "string"
          ? data.tags.split(",").map((t: string) => t.trim())
          : [],
        coverImage: data.coverImage || data.thumbnail || "",
        coverImageCredit: data.coverImageCredit || "",
        coverImageCreditUrl: data.coverImageCreditUrl || "",
        source: data.source || "행정안전부 및 조달청 나라장터 공공데이터",
        sourceUrl: data.sourceUrl || "https://www.g2b.go.kr",
      } as PostMeta;
    })
    .filter((item): item is PostMeta => item !== null);

  // 날짜 내림차순 정렬 (최신순)
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * 특정 slug에 해당하는 포스트 상세 데이터(본문 content 포함) 반환
 */
export function getPostBySlug(slug: string): PostItem | null {
  ensurePostsDirectory();

  const decodedSlug = decodeURIComponent(slug);
  const fullPath = path.join(postsDirectory, `${decodedSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug: decodedSlug,
    title: data.title || "제목 없음",
    date: data.date || new Date().toISOString().substring(0, 10),
    summary: data.summary || "",
    category: data.category || "트렌드 분석",
    tags: Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === "string"
      ? data.tags.split(",").map((t: string) => t.trim())
      : [],
    coverImage: data.coverImage || data.thumbnail || "",
    coverImageCredit: data.coverImageCredit || "",
    coverImageCreditUrl: data.coverImageCreditUrl || "",
    source: data.source || "행정안전부 및 조달청 나라장터 공공데이터",
    sourceUrl: data.sourceUrl || "https://www.g2b.go.kr",
    content,
  };
}

/**
 * generateStaticParams를 위한 공개 slug 목록 반환 (draft: true는 제외)
 */
export function getAllPostSlugs(): { slug: string }[] {
  ensurePostsDirectory();

  const fileNames = fs.readdirSync(postsDirectory);
  const slugs = fileNames
    .filter((fileName) => {
      if (!fileName.endsWith(".md")) return false;
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);
      return data.draft !== true;
    })
    .map((fileName) => ({
      slug: fileName.replace(/\.md$/, ""),
    }));

  if (slugs.length === 0) {
    return [{ slug: "_placeholder" }];
  }

  return slugs;
}

/**
 * generateStaticParams를 위한 전체(초안 포함) 미리보기 slug 목록 반환
 */
export function getAllPreviewPostSlugs(): { slug: string }[] {
  ensurePostsDirectory();

  const fileNames = fs.readdirSync(postsDirectory);
  const slugs = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => ({
      slug: fileName.replace(/\.md$/, ""),
    }));

  if (slugs.length === 0) {
    return [{ slug: "_placeholder" }];
  }

  return slugs;
}
