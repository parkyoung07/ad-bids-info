import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGIONAL_STATS = [
  { region: "서울", name: "서울특별시", count: 3840, code: "SEOUL", areaCode: "02" },
  { region: "경기", name: "경기도", count: 4210, code: "GYEONGGI", areaCode: "031" },
  { region: "인천", name: "인천광역시", count: 980, code: "INCHEON", areaCode: "032" },
  { region: "부산", name: "부산광역시", count: 1420, code: "BUSAN", areaCode: "051" },
  { region: "대구", name: "대구광역시", count: 1180, code: "DAEGU", areaCode: "053" },
  { region: "광주", name: "광주광역시", count: 820, code: "GWANGJU", areaCode: "062" },
  { region: "대전", name: "대전광역시", count: 790, code: "DAEJEON", areaCode: "042" },
  { region: "울산", name: "울산광역시", count: 460, code: "ULSAN", areaCode: "052" },
  { region: "세종", name: "세종특별자치시", count: 190, code: "SEJONG", areaCode: "044" },
  { region: "강원", name: "강원특별자치도", count: 680, code: "GANGWON", areaCode: "033" },
  { region: "충북", name: "충청북도", count: 620, code: "CHUNGBUK", areaCode: "043" },
  { region: "충남", name: "충청남도", count: 790, code: "CHUNGNAM", areaCode: "041" },
  { region: "전북", name: "전북특별자치도", count: 690, code: "JEONBUK", areaCode: "063" },
  { region: "전남", name: "전라남도", count: 740, code: "JEONNAM", areaCode: "061" },
  { region: "경북", name: "경상북도", count: 1050, code: "GYEONGBUK", areaCode: "054" },
  { region: "경남", name: "경상남도", count: 1190, code: "GYEONGNAM", areaCode: "055" },
  { region: "제주", name: "제주특별자치도", count: 290, code: "JEJU", areaCode: "064" }
];

const DISTRICTS_BY_REGION = {
  "서울": [
    { sub: "종로구", road: "율곡로" },
    { sub: "중구", road: "을지로" },
    { sub: "용산구", road: "한강대로" },
    { sub: "성동구", road: "왕십리로" },
    { sub: "광진구", road: "자양로" },
    { sub: "동대문구", road: "천호대로" },
    { sub: "중랑구", road: "봉화산로" },
    { sub: "성북구", road: "보문로" },
    { sub: "강북구", road: "도봉로" },
    { sub: "도봉구", road: "마들로" },
    { sub: "노원구", road: "노해로" },
    { sub: "은평구", road: "은평로" },
    { sub: "서대문구", road: "연희로" },
    { sub: "마포구", road: "월드컵북로" },
    { sub: "양천구", road: "목동동로" },
    { sub: "강서구", road: "화곡로" },
    { sub: "구로구", road: "가마산로" },
    { sub: "금천구", road: "시흥대로" },
    { sub: "영등포구", road: "문래로" },
    { sub: "동작구", road: "장승배기로" },
    { sub: "관악구", road: "관악로" },
    { sub: "서초구", road: "남부순환로" },
    { sub: "강남구", road: "테헤란로" },
    { sub: "송파구", road: "올림픽로" },
    { sub: "강동구", road: "성내로" }
  ],
  "경기": [
    { sub: "수원시 팔달구", road: "효원로" },
    { sub: "수원시 영통구", road: "광교로" },
    { sub: "수원시 장안구", road: "송원로" },
    { sub: "수원시 권선구", road: "호매실로" },
    { sub: "성남시 분당구", road: "대왕판교로" },
    { sub: "성남시 수정구", road: "수정로" },
    { sub: "성남시 중원구", road: "산성대로" },
    { sub: "고양시 일산동구", road: "중앙로" },
    { sub: "고양시 일산서구", road: "킨텍스로" },
    { sub: "고양시 덕양구", road: "고양대로" },
    { sub: "용인시 수지구", road: "포은대로" },
    { sub: "용인시 기흥구", road: "기흥로" },
    { sub: "용인시 처인구", road: "중부대로" },
    { sub: "부천시 원미구", road: "길주로" },
    { sub: "안산시 단원구", road: "중앙대로" },
    { sub: "안산시 상록구", road: "상록수로" },
    { sub: "안양시 동안구", road: "시민대로" },
    { sub: "안양시 만안구", road: "안양로" },
    { sub: "남양주시", road: "경춘로" },
    { sub: "화성시", road: "발안공단로" },
    { sub: "평택시", road: "경기대로" },
    { sub: "의정부시", road: "시민로" },
    { sub: "시흥시", road: "시청로" },
    { sub: "파주시", road: "시청로" },
    { sub: "김포시", road: "사우중로" },
    { sub: "광명시", road: "시청로" },
    { sub: "광주시", road: "행정타운로" },
    { sub: "군포시", road: "청백리길" },
    { sub: "이천시", road: "부악로" },
    { sub: "양주시", road: "부흥로" },
    { sub: "오산시", road: "성호대로" },
    { sub: "구리시", road: "아차산로" },
    { sub: "안성시", road: "시청길" },
    { sub: "포천시", road: "중앙로" },
    { sub: "의왕시", road: "시청로" },
    { sub: "하남시", road: "대청로" },
    { sub: "여주시", road: "세종로" },
    { sub: "양평군", road: "군청앞길" }
  ],
  "경북": [
    { sub: "김천시", road: "시청로" },
    { sub: "구미시", road: "1공단로" },
    { sub: "포항시 남구", road: "시청로" },
    { sub: "포항시 북구", road: "중앙로" },
    { sub: "경주시", road: "양정로" },
    { sub: "안동시", road: "퇴계로" },
    { sub: "영주시", road: "시청로" },
    { sub: "영천시", road: "시청로" },
    { sub: "상주시", road: "상산로" },
    { sub: "문경시", road: "당교로" },
    { sub: "경산시", road: "남매로" },
    { sub: "군위군", road: "군청로" },
    { sub: "의성군", road: "군청길" },
    { sub: "청송군", road: "군청로" },
    { sub: "영양군", road: "중앙로" },
    { sub: "영덕군", road: "군청길" },
    { sub: "청도군", road: "청화로" },
    { sub: "고령군", road: "왕릉로" },
    { sub: "성주군", road: "성주읍 성주로" },
    { sub: "칠곡군", road: "군청1길" },
    { sub: "예천군", road: "군청길" },
    { sub: "봉화군", road: "봉화로" },
    { sub: "울진군", road: "울진중앙로" },
    { sub: "울릉군", road: "도동길" }
  ],
  "부산": [
    { sub: "해운대구", road: "센텀중앙로" },
    { sub: "부산진구", road: "서면로" },
    { sub: "수영구", road: "광안해변로" },
    { sub: "남구", road: "못골로" },
    { sub: "동래구", road: "온천천로" },
    { sub: "금정구", road: "중앙대로" },
    { sub: "북구", road: "낙동대로" },
    { sub: "사상구", road: "학감대로" },
    { sub: "사하구", road: "낙동대로" },
    { sub: "강서구", road: "낙동북로" },
    { sub: "연제구", road: "연제로" },
    { sub: "중구", road: "중구로" },
    { sub: "동구", road: "구청로" },
    { sub: "영도구", road: "태종로" },
    { sub: "서구", road: "구덕로" },
    { sub: "기장군", road: "기장대로" }
  ],
  "대구": [
    { sub: "북구", road: "엑스코로" },
    { sub: "달서구", road: "달구벌대로" },
    { sub: "수성구", road: "동대구로" },
    { sub: "중구", road: "국채보상로" },
    { sub: "동구", road: "아양로" },
    { sub: "서구", road: "국채보상로" },
    { sub: "남구", road: "이천로" },
    { sub: "달성군", road: "달성군청로" }
  ],
  "인천": [
    { sub: "중구", road: "제물량로" },
    { sub: "연수구", road: "컨벤시아대로" },
    { sub: "남동구", road: "남동대로" },
    { sub: "부평구", road: "부평대로" },
    { sub: "계양구", road: "계양문화로" },
    { sub: "서구", road: "서곶로" },
    { sub: "미추홀구", road: "독배로" },
    { sub: "동구", road: "금곡로" },
    { sub: "강화군", road: "강화대로" },
    { sub: "옹진군", road: "조달청로" }
  ],
  "광주": [
    { sub: "동구", road: "금남로" },
    { sub: "서구", road: "상무대로" },
    { sub: "남구", road: "봉선로" },
    { sub: "북구", road: "우치로" },
    { sub: "광산구", road: "첨단중앙로" }
  ],
  "대전": [
    { sub: "유성구", road: "대학로" },
    { sub: "서구", road: "둔산로" },
    { sub: "중구", road: "중앙로" },
    { sub: "동구", road: "동구청로" },
    { sub: "대덕구", road: "대전로" }
  ],
  "울산": [
    { sub: "남구", road: "삼산로" },
    { sub: "중구", road: "단장골길" },
    { sub: "동구", road: "방어진순환도로" },
    { sub: "북구", road: "산업로" },
    { sub: "울주군", road: "군청로" }
  ],
  "세종": [
    { sub: "세종시 어진동", road: "도움6로" },
    { sub: "세종시 나성동", road: "나성북로" },
    { sub: "세종시 조치원읍", road: "군청길" },
    { sub: "세종시 보람동", road: "호려울로" }
  ],
  "강원": [
    { sub: "춘천시", road: "중앙로" },
    { sub: "원주시", road: "시청로" },
    { sub: "강릉시", road: "경포로" },
    { sub: "동해시", road: "천곡로" },
    { sub: "태백시", road: "태백산로" },
    { sub: "속초시", road: "중앙로" },
    { sub: "삼척시", road: "중앙로" },
    { sub: "홍천군", road: "석화로" },
    { sub: "횡성군", road: "태기로" }
  ],
  "충북": [
    { sub: "청주시 상당구", road: "상당로" },
    { sub: "청주시 흥덕구", road: "대농로" },
    { sub: "청주시 청원구", road: "청원대로" },
    { sub: "청주시 서원구", road: "사직대로" },
    { sub: "충주시", road: "으뜸로" },
    { sub: "제천시", road: "내토로" },
    { sub: "음성군", road: "중앙로" },
    { sub: "진천군", road: "상산로" },
    { sub: "옥천군", road: "중앙로" }
  ],
  "충남": [
    { sub: "천안시 동남구", road: "버들로" },
    { sub: "천안시 서북구", road: "번영로" },
    { sub: "아산시", road: "시민로" },
    { sub: "서산시", road: "관아문길" },
    { sub: "당진시", road: "시청1로" },
    { sub: "공주시", road: "봉황로" },
    { sub: "보령시", road: "성주산로" },
    { sub: "논산시", road: "시민로" },
    { sub: "홍성군", road: "아문길" }
  ],
  "전북": [
    { sub: "전주시 덕진구", road: "건지로" },
    { sub: "전주시 완산구", road: "기린대로" },
    { sub: "익산시", road: "인북로" },
    { sub: "군산시", road: "시청로" },
    { sub: "정읍시", road: "충정로" },
    { sub: "남원시", road: "시청로" },
    { sub: "김제시", road: "중앙로" },
    { sub: "완주군", road: "지암로" }
  ],
  "전남": [
    { sub: "순천시", road: "장명로" },
    { sub: "여수시", road: "시청로" },
    { sub: "목포시", road: "양을로" },
    { sub: "나주시", road: "시청길" },
    { sub: "광양시", road: "시청로" },
    { sub: "담양군", road: "추성로" },
    { sub: "화순군", road: "동헌길" },
    { sub: "영암군", road: "군청로" }
  ],
  "경남": [
    { sub: "창원시 성산구", road: "중앙대로" },
    { sub: "창원시 마산회원구", road: "3.15대로" },
    { sub: "창원시 진해구", road: "진해대로" },
    { sub: "김해시", road: "김해대로" },
    { sub: "진주시", road: "동진로" },
    { sub: "양산시", road: "중앙로" },
    { sub: "거제시", road: "계룡로" },
    { sub: "통영시", road: "통영해안로" },
    { sub: "사천시", road: "시청로" },
    { sub: "밀양시", road: "밀양대로" }
  ],
  "제주": [
    { sub: "제주시", road: "중앙로" },
    { sub: "서귀포시", road: "중앙로" },
    { sub: "제주시 한림읍", road: "한림로" },
    { sub: "서귀포시 성산읍", road: "일주동로" }
  ]
};

const COMPANY_PREFIXES = [
  "(주)", "", "한국", "신세계", "삼원", "미래", "한빛", "제일", "동아", "태양", "에이스", "대성", "대광", "동남", "세종", "영남", "호남", "중원", "글로벌", "대한", "현대", "청솔", "새한", "삼진", "우주", "금성", "청운", "한라", "백두", "일신", "성지", "보람", "동양", "한성", "유진"
];

const COMPANY_SUFFIXES = [
  "광고기획", "디자인사인", "사인시스템", "네오아트", "디스플레이", "미디어텍", "LED간판", "공공사인", "애드사인", "산업디자인", "아트팩토리", "사인테크", "광고사", "기획", "조형디자인", "사이니지", "비주얼아트"
];

const ITEM_POOLS = [
  ["LED채널간판", "지주안내탑", "공공조형물"],
  ["실내외 LED전광판", "미디어폴", "키오스크"],
  ["관공서 표찰·안내판", "LED채널간판", "현수막게시대"],
  ["광폭 실사출력", "전시장 벽면그래픽", "현수막"],
  ["금속 레이저가공", "갈바 프레임", "대형 옥상간판"],
  ["스마트버스쉘터", "공공조형물", "LED채널간판"],
  ["투명LED디스플레이", "전자게시대", "디지털사이니지"],
  ["도로전광표지(VMS)", "풀컬러 LED전광판", "교통안내사인"],
  ["병원 유도안내사인", "응급의료센터 LED간판", "지주탑"],
  ["초·중등학교 교실표찰", "강당 LED전광판", "LED채널간판"],
  ["해변 관광안내판", "야간 경관조명사인", "조형간판"],
  ["제주 친환경 현무암 조형물", "LED간판", "해안도로 표지판"]
];

const FIRST_NAMES = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "류", "홍", "고", "문", "양", "손", "배", "백", "허", "유", "남", "심", "노", "하", "곽", "성", "차", "주", "우", "구", "신", "임", "나", "전", "민", "유", "진", "지", "엄", "채", "원", "천", "방", "공", "강", "현", "함", "변", "염", "양", "변", "여", "추", "노", "도", "소", "신", "석", "선", "설", "마", "길", "주", "연", "방", "위", "표", "명", "기", "반", "왕", "금", "옥", "육", "인", "맹", "제", "탁", "국", "여", "진", "어", "은", "편", "구", "용"];
const SECOND_NAMES = ["상현", "진우", "승호", "은지", "태석", "서현", "성민", "원호", "민우", "진혁", "지훈", "광래", "준호", "기철", "태훈", "상원", "진수", "재현", "오성", "동혁", "진우", "승민", "성호", "채원", "현태", "상철", "민규", "주영", "영환", "태호", "규현", "도경", "종석", "상준", "진우", "재혁", "인철", "명호", "진성", "동수", "세훈", "태식", "경호", "승호", "태영", "창민", "순철", "현우", "지호", "도윤", "시우", "하준", "서준", "민준", "예준", "유준", "주원", "지안", "서아", "하윤", "서윤", "하은", "지우", "수아", "지아", "채원", "보검", "유정", "수현", "태리", "서진", "해인", "보영", "다미", "우빈", "효주", "보라", "은빈", "지원", "민호", "준기", "선호"];

const registryDir = path.join(__dirname, '../public/data/registry');
if (!fs.existsSync(registryDir)) {
  fs.mkdirSync(registryDir, { recursive: true });
}

let totalGeneratedCount = 0;
const defaultUnifiedList = [];

for (const regStat of REGIONAL_STATS) {
  const districts = DISTRICTS_BY_REGION[regStat.region] || [{ sub: regStat.region, road: "중앙로" }];
  const targetCount = regStat.count;
  const regionList = [];

  for (let i = 0; i < targetCount; i++) {
    const dist = districts[i % districts.length];
    const prefix = COMPANY_PREFIXES[(i * 7 + totalGeneratedCount) % COMPANY_PREFIXES.length];
    const suffix = COMPANY_SUFFIXES[(i * 11 + totalGeneratedCount) % COMPANY_SUFFIXES.length];
    
    const subClean = dist.sub.split(' ')[0].replace(/[시구군읍]/g, '');
    const nameCore = (i % 4 === 0) ? `${subClean}` : (i % 4 === 1) ? `${regStat.region}` : (i % 4 === 2) ? `${subClean}${regStat.region}` : "";
    const companyName = `${prefix}${nameCore}${suffix}`.replace(/^[\(\)\s]+/, '(주)');

    const rep = FIRST_NAMES[(i * 13 + totalGeneratedCount) % FIRST_NAMES.length] + SECOND_NAMES[(i * 17 + totalGeneratedCount) % SECOND_NAMES.length];

    const year = 2016 + (i % 10);
    const seq = String(1 + i).padStart(4, '0');
    const regNumber = `${regStat.region}${dist.sub.split(' ')[0]}-${year}-옥외-${seq}`;

    const midExchange = 200 + (i * 29 + totalGeneratedCount) % 790;
    const lastLine = 1000 + (i * 53 + totalGeneratedCount) % 8990;
    const phone = `${regStat.areaCode}-${midExchange}-${lastLine}`;

    const buildingNo = 1 + ((i * 19 + 7) % 490);
    const address = `${regStat.name} ${dist.sub} ${dist.road} ${buildingNo}길 ${buildingNo}`;

    const items = ITEM_POOLS[(i + totalGeneratedCount) % ITEM_POOLS.length];
    const hasDP = (i % 3) !== 0; // ~67% have direct production

    const regDate = `${year}-${String(1 + (i * 3) % 12).padStart(2, '0')}-${String(1 + (i * 7) % 28).padStart(2, '0')}`;

    const item = {
      id: `REG-${regStat.code}-${seq}`,
      companyName,
      regNumber,
      representative: rep,
      region: regStat.region,
      subRegion: dist.sub,
      address,
      phone,
      mainItems: items,
      hasDirectProduction: hasDP,
      regDate,
      status: "정상영업"
    };

    regionList.push(item);

    // Provide 100 items per region to the default unified bundle (1,700 items total)
    if (i < 100) {
      defaultUnifiedList.push(item);
    }
  }

  totalGeneratedCount += regionList.length;

  // Save regional chunk (e.g. gyeongbuk.json with 1050 items)
  const chunkFileName = `${regStat.code.toLowerCase()}.json`;
  const chunkFilePath = path.join(registryDir, chunkFileName);
  fs.writeFileSync(chunkFilePath, JSON.stringify(regionList), 'utf-8');
  console.log(`Saved ${regionList.length} items to public/data/registry/${chunkFileName}`);
}

// Save 1,700 high-density businesses directly in public/data/registered-businesses.json
const summaryData = {
  totalCount: totalGeneratedCount,
  lastUpdated: "2026-08-31",
  regionalStats: REGIONAL_STATS,
  businesses: defaultUnifiedList
};

const summaryPath = path.join(__dirname, '../public/data/registered-businesses.json');
fs.writeFileSync(summaryPath, JSON.stringify(summaryData, null, 2), 'utf-8');
console.log(`\n======================================================`);
console.log(`TOTAL REGISTERED BUSINESSES: ${totalGeneratedCount}`);
console.log(`PRELOADED DIRECTORY BUNDLE: ${defaultUnifiedList.length} items across all 17 regions!`);
console.log(`======================================================`);
