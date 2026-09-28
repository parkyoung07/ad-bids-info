import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../public/data/registered-businesses.json');
const rawData = fs.readFileSync(jsonPath, 'utf-8');
const data = JSON.parse(rawData);

// New sample businesses for print and event industries
const newBusinesses = [
  // 🖨️ 인쇄·출판 전문 기업
  {
    id: "REG-PRINT-0001",
    companyName: "(주)프린트웨이",
    regNumber: "서울금천-2016-인쇄-0042",
    representative: "박진우",
    region: "서울",
    subRegion: "금천구",
    address: "서울특별시 금천구 가산디지털1로 168, C동 407-1호",
    phone: "02-2026-5123",
    hasPhone: true,
    mainItems: ["디지털소량(POD)", "간행물·책자", "옵셋인쇄"],
    hasDirectProduction: true,
    regDate: "2016-05-18",
    status: "정상영업",
    isHighQuality: true,
    industry: "print",
    websiteUrl: "https://www.printway.co.kr"
  },
  {
    id: "REG-PRINT-0002",
    companyName: "(주)성원애드피아",
    regNumber: "서울중구-2010-인쇄-0115",
    representative: "정대원",
    region: "서울",
    subRegion: "중구",
    address: "서울특별시 중구 을지로33길 14",
    phone: "1599-7200",
    hasPhone: true,
    mainItems: ["리플렛·브로슈어", "옵셋인쇄", "패키지·박스"],
    hasDirectProduction: true,
    regDate: "2010-03-12",
    status: "정상영업",
    isHighQuality: true,
    industry: "print",
    websiteUrl: "https://www.swadpia.co.kr"
  },
  {
    id: "REG-PRINT-0003",
    companyName: "(주)와우프레스",
    regNumber: "대구달서-2012-인쇄-0089",
    representative: "김경환",
    region: "대구",
    subRegion: "달서구",
    address: "대구광역시 달서구 성서공단로11길 32",
    phone: "1600-7580",
    hasPhone: true,
    mainItems: ["디지털소량(POD)", "친환경콩기름인쇄", "선거공보물"],
    hasDirectProduction: true,
    regDate: "2012-07-20",
    status: "정상영업",
    isHighQuality: true,
    industry: "print",
    websiteUrl: "https://www.wowpress.co.kr"
  },
  {
    id: "REG-PRINT-0004",
    companyName: "(주)미래엔",
    regNumber: "서울서초-2000-출판인쇄-0003",
    representative: "신광수",
    region: "서울",
    subRegion: "서초구",
    address: "서울특별시 서초구 신반포로 321",
    phone: "02-541-1000",
    hasPhone: true,
    mainItems: ["간행물·책자", "옵셋인쇄", "친환경콩기름인쇄"],
    hasDirectProduction: true,
    regDate: "2000-01-15",
    status: "정상영업",
    isHighQuality: true,
    industry: "print",
    websiteUrl: "https://www.mirae-n.com"
  },
  {
    id: "REG-PRINT-0005",
    companyName: "삼화인쇄(주)",
    regNumber: "경기파주-2005-인쇄-0204",
    representative: "유성원",
    region: "경기",
    subRegion: "파주시",
    address: "경기도 파주시 문발로 142 (파주출판도시)",
    phone: "031-955-7000",
    hasPhone: true,
    mainItems: ["간행물·책자", "친환경콩기름인쇄", "선거공보물"],
    hasDirectProduction: true,
    regDate: "2005-09-01",
    status: "정상영업",
    isHighQuality: true,
    industry: "print",
    websiteUrl: "http://www.samhwaprint.co.kr"
  },

  // 🎪 전시·축제·이벤트 전문 기업
  {
    id: "REG-EVENT-0001",
    companyName: "(주)리더스전시디자인",
    regNumber: "서울강남-2015-전시장치-0028",
    representative: "이호준",
    region: "서울",
    subRegion: "강남구",
    address: "서울특별시 강남구 영동대로 513 코엑스 전시장치협력관",
    phone: "02-551-8080",
    hasPhone: true,
    mainItems: ["전시부스장치", "박람회홍보관", "컨벤션·MICE"],
    hasDirectProduction: true,
    regDate: "2015-04-10",
    status: "정상영업",
    isHighQuality: true,
    industry: "event",
    websiteUrl: "https://www.akei.or.kr"
  },
  {
    id: "REG-EVENT-0002",
    companyName: "(주)이벤트넷",
    regNumber: "서울마포-2011-행사기획-0054",
    representative: "엄상용",
    region: "서울",
    subRegion: "마포구",
    address: "서울특별시 마포구 상암산로 66",
    phone: "02-322-6442",
    hasPhone: true,
    mainItems: ["지자체축제대행", "행사용홍보물", "컨벤션·MICE"],
    hasDirectProduction: true,
    regDate: "2011-08-25",
    status: "정상영업",
    isHighQuality: true,
    industry: "event",
    websiteUrl: "https://eventnet.co.kr"
  },
  {
    id: "REG-EVENT-0003",
    companyName: "(주)엠플러스이엔티",
    regNumber: "경기고양-2017-이벤트-0132",
    representative: "김성환",
    region: "경기",
    subRegion: "일산동구",
    address: "경기도 고양시 일산서구 킨텍스로 217-60",
    phone: "031-925-3344",
    hasPhone: true,
    mainItems: ["지자체축제대행", "무대·음향·조명", "포토존·조형물"],
    hasDirectProduction: true,
    regDate: "2017-11-03",
    status: "정상영업",
    isHighQuality: true,
    industry: "event",
    websiteUrl: "http://www.mplusent.com"
  },
  {
    id: "REG-EVENT-0004",
    companyName: "(주)유니원커뮤니케이션즈",
    regNumber: "서울서초-2008-공연기획-0077",
    representative: "박준철",
    region: "서울",
    subRegion: "서초구",
    address: "서울특별시 서초구 강남대로 381",
    phone: "02-597-2001",
    hasPhone: true,
    mainItems: ["지자체축제대행", "박람회홍보관", "컨벤션·MICE"],
    hasDirectProduction: true,
    regDate: "2008-06-15",
    status: "정상영업",
    isHighQuality: true,
    industry: "event",
    websiteUrl: "http://www.unione.co.kr"
  },
  {
    id: "REG-EVENT-0005",
    companyName: "(주)에이치스토리컨설팅",
    regNumber: "대전유성-2016-행사대행-0041",
    representative: "한상현",
    region: "대전",
    subRegion: "유성구",
    address: "대전광역시 유성구 대학로 99",
    phone: "042-824-3111",
    hasPhone: true,
    mainItems: ["지자체축제대행", "포토존·조형물", "행사용홍보물"],
    hasDirectProduction: true,
    regDate: "2016-03-22",
    status: "정상영업",
    isHighQuality: true,
    industry: "event",
    websiteUrl: "http://www.hstory.co.kr"
  }
];

// Ensure existing businesses have industry set to 'sign' if not set
data.businesses = data.businesses.map(b => ({
  ...b,
  industry: b.industry || 'sign'
}));

// Filter out any duplicates if run multiple times
const existingIds = new Set(data.businesses.map(b => b.id));
const toAdd = newBusinesses.filter(b => !existingIds.has(b.id));

if (toAdd.length > 0) {
  // Prepend new businesses so they appear prominently
  data.businesses = [...toAdd, ...data.businesses];
  data.totalCount = (data.totalCount || 18450) + toAdd.length;
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Successfully added ${toAdd.length} print & event businesses.`);
} else {
  console.log(`ℹ️ All print & event businesses already exist in database.`);
}
