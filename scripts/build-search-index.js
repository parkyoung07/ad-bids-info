const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

// 마크다운 문법 기호를 제거하여 일반 텍스트로 변환하는 함수
function stripMarkdown(markdownText) {
  if (!markdownText) return "";

  return markdownText
    // 코드 블록 제거
    .replace(/```[\s\S]*?```/g, "")
    // 인라인 코드 제거
    .replace(/`([^`]+)`/g, "$1")
    // 이미지 문법 제거 (![alt](url))
    .replace(/!\[.*?\]\(.*?\)/g, "")
    // 링크 문법에서 텍스트만 추출 ([text](url) -> text)
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    // 제목 기호 (#, ##, ### 등) 제거
    .replace(/^#{1,6}\s+/gm, "")
    // 인용 기호 (>) 제거
    .replace(/^>\s+/gm, "")
    // 굵게, 기울임 (**, *, __, _) 제거
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // 취소선 (~~) 제거
    .replace(/~~(.*?)~~/g, "$1")
    // 수평선 (---, ***, ___) 제거
    .replace(/^([-*_]){3,}\s*$/gm, "")
    // 리스트 불릿 기호 (-, *, +, 1.) 제거
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    // 여러 줄 공백 및 줄바꿈을 단일 공백으로 치환
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchIndex() {
  const postsDir = path.join(__dirname, "../src/content/posts");
  const outputDir = path.join(__dirname, "../public/data");
  const outputPath = path.join(outputDir, "search-index.json");

  if (!fs.existsSync(postsDir)) {
    console.log("Posts directory does not exist.");
    return;
  }

  const files = fs.readdirSync(postsDir).filter((file) => file.endsWith(".md"));
  const searchIndex = [];

  files.forEach((file) => {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const slug = file.replace(/\.md$/, "");
    const plainContent = stripMarkdown(content);
    const snippet = plainContent.slice(0, 500);

    searchIndex.push({
      slug,
      title: data.title || "",
      description: data.description || data.summary || "",
      content: snippet,
      date: data.date || "",
      category: data.category || "",
      tags: data.tags || [],
    });
  });

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2), "utf-8");
  console.log(`Search index built: ${searchIndex.length} entries`);
}

buildSearchIndex();
