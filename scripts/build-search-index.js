const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

// 마크다운 문법 기호를 제거하여 일반 텍스트로 변환하는 함수
function stripMarkdown(markdownText) {
  if (!markdownText) return "";

  return markdownText
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/^([-*_]){3,}\s*$/gm, "")
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchIndex() {
  const dataDir = path.join(__dirname, "../public/data");
  const postsDir = path.join(__dirname, "../src/content/posts");
  const outputPath = path.join(dataDir, "search-index.json");

  const searchIndex = [];

  // 1. 블로그 포스트 인덱싱
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter((file) => file.endsWith(".md"));
    files.forEach((file) => {
      try {
        const filePath = path.join(postsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(fileContent);

        const slug = file.replace(/\.md$/, "");
        const plainContent = stripMarkdown(content);
        const snippet = plainContent.slice(0, 600);

        searchIndex.push({
          type: "post",
          id: slug,
          slug,
          title: data.title || "",
          description: data.description || data.summary || "",
          content: snippet,
          date: data.date || "",
          category: data.category || "블로그 트렌드",
          tags: data.tags || [],
          url: `/blog/${slug}`,
        });
      } catch (e) {
        console.error(`Error parsing post ${file}:`, e.message);
      }
    });
  }

  // 2. 실시간 입찰 공고(bids.json) 인덱싱
  const bidsPath = path.join(dataDir, "bids.json");
  if (fs.existsSync(bidsPath)) {
    try {
      const bids = JSON.parse(fs.readFileSync(bidsPath, "utf-8"));
      bids.forEach((bid) => {
        searchIndex.push({
          type: "bid",
          id: bid.id,
          title: bid.title || "",
          client: bid.client || "",
          budget: bid.budget || 0,
          budgetText: bid.budgetText || "",
          location: bid.location || "전국",
          category: bid.category || "기타",
          bidType: bid.bidType || "",
          endDate: bid.endDate || "",
          dDay: bid.dDay ?? 0,
          description: `[발주처: ${bid.client}] [예산: ${bid.budgetText}] [마감: ${bid.endDate || ""}(D-${bid.dDay})] ${bid.aiSummary || ""}`,
          content: `${bid.title} ${bid.client} ${bid.category} ${bid.location} ${bid.budgetText} ${bid.aiSummary || ""} ${bid.aiTips || ""}`,
          tags: bid.tags || [],
          url: `/bids/${bid.id}`,
        });
      });
    } catch (e) {
      console.error("Error reading bids.json:", e.message);
    }
  }

  // 3. 우수 협력사 DB(partners.json) 인덱싱
  const partnersPath = path.join(dataDir, "partners.json");
  if (fs.existsSync(partnersPath)) {
    try {
      const partners = JSON.parse(fs.readFileSync(partnersPath, "utf-8"));
      partners.forEach((partner) => {
        const equipmentText = (partner.equipment || []).join(", ");
        const badgesText = (partner.badges || []).join(", ");
        searchIndex.push({
          type: "partner",
          id: partner.id,
          title: `[협력사] ${partner.companyName} (${partner.category})`,
          companyName: partner.companyName,
          category: partner.category,
          location: partner.location,
          contactPerson: partner.contactPerson,
          phone: partner.phone,
          equipment: partner.equipment || [],
          description: `[${partner.category}] ${partner.companyName} | 담당: ${partner.contactPerson} (${partner.phone}) | 지역: ${partner.location} | 장비/역량: ${equipmentText} | ${partner.description}`,
          content: `${partner.companyName} ${partner.category} ${partner.location} ${partner.contactPerson} ${partner.phone} ${partner.description} ${equipmentText} ${badgesText} ${partner.experience || ""}`,
          tags: [...(partner.equipment || []), ...(partner.badges || [])],
          url: "/partners",
        });
      });
    } catch (e) {
      console.error("Error reading partners.json:", e.message);
    }
  }

  // 4. 낙찰 결과(award-results.json) 인덱싱
  const awardsPath = path.join(dataDir, "award-results.json");
  if (fs.existsSync(awardsPath)) {
    try {
      const awards = JSON.parse(fs.readFileSync(awardsPath, "utf-8"));
      awards.forEach((award) => {
        searchIndex.push({
          type: "award",
          id: award.id,
          title: `[낙찰결과] ${award.title}`,
          winnerCompany: award.winnerCompany,
          awardedRate: award.awardedRate,
          description: `낙찰사: ${award.winnerCompany} | 낙찰률: ${award.awardedRate}% | 낙찰금액: ${award.awardedAmountText} (발주: ${award.client})`,
          content: `${award.title} ${award.client} ${award.winnerCompany} ${award.awardedRate}% ${award.awardedAmountText}`,
          category: award.category || "낙찰통계",
          tags: ["낙찰결과", "개찰", award.winnerCompany],
          url: "/results",
        });
      });
    } catch (e) {
      console.error("Error reading award-results.json:", e.message);
    }
  }

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2), "utf-8");
  console.log(`Integrated Search Index built: ${searchIndex.length} entries (Posts, Bids, Partners, Awards)`);
}

buildSearchIndex();

