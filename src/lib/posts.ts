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
        coverImage: data.coverImage || "",
        source: data.source || "",
        sourceUrl: data.sourceUrl || "",
      } as PostMeta;
    });

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
    coverImage: data.coverImage || "",
    source: data.source || "",
    sourceUrl: data.sourceUrl || "",
    content,
  };
}

/**
 * generateStaticParams를 위한 slug 목록 반환
 * (output: export 시 최소 1개의 slug가 필요하므로 파일이 없을 때는 fallback 반환)
 */
export function getAllPostSlugs(): { slug: string }[] {
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
