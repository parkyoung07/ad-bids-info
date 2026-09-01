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
    { sub: "종로구", road: "율곡로 110" },
    { sub: "중구", road: "을지로 100" },
    { sub: "용산구", road: "한강대로 405" },
    { sub: "성동구", road: "왕십리로 241" },
    { sub: "광진구", road: "자양로 117" },
    { sub: "동대문구", road: "천호대로 145" },
    { sub: "중랑구", road: "봉화산로 179" },
    { sub: "성북구", road: "보문로 168" },
    { sub: "강북구", road: "도봉로 89" },
    { sub: "도봉구", road: "마들로 656" },
    { sub: "노원구", road: "노해로 437" },
    { sub: "은평구", road: "은평로 195" },
    { sub: "서대문구", road: "연희로 248" },
    { sub: "마포구", road: "월드컵북로 400" },
    { sub: "양천구", road: "목동동로 105" },
    { sub: "강서구", road: "화곡로 302" },
    { sub: "구로구", road: "가마산로 245" },
    { sub: "금천구", road: "시흥대로 73" },
    { sub: "영등포구", road: "문래로 180" },
    { sub: "동작구", road: "장승배기로 161" },
    { sub: "관악구", road: "관악로 145" },
    { sub: "서초구", road: "남부순환로 2584" },
    { sub: "강남구", road: "테헤란로 152" },
    { sub: "송파구", road: "올림픽로 300" },
    { sub: "강동구", road: "성내로 25" }
  ],
  "경기": [
    { sub: "수원시 팔달구", road: "효원로 241" },
    { sub: "수원시 영통구", road: "광교로 156" },
    { sub: "성남시 분당구", road: "대왕판교로 645" },
    { sub: "성남시 수정구", road: "수정로 283" },
    { sub: "고양시 일산동구", road: "중앙로 1256" },
    { sub: "고양시 덕양구", road: "고양대로 1315" },
    { sub: "용인시 수지구", road: "포은대로 435" },
    { sub: "용인시 처인구", road: "중부대로 1199" },
    { sub: "부천시 원미구", road: "길주로 210" },
    { sub: "안산시 단원구", road: "중앙대로 685" },
    { sub: "안양시 동안구", road: "시민대로 235" },
    { sub: "남양주시", road: "경춘로 1037" },
    { sub: "화성시", road: "향남읍 발안공단로 88" },
    { sub: "평택시", road: "경기대로 245" },
    { sub: "의정부시", road: "시민로 1" },
    { sub: "시흥시", road: "시청로 20" },
    { sub: "파주시", road: "시청로 50" },
    { sub: "김포시", road: "사우중로 1" },
    { sub: "광명시", road: "시청로 20" },
    { sub: "광주시", road: "행정타운로 50" },
    { sub: "군포시", road: "청백리길 6" },
    { sub: "이천시", road: "부악로 40" },
    { sub: "양주시", road: "부흥로 1533" },
    { sub: "오산시", road: "성호대로 141" },
    { sub: "구리시", road: "아차산로 439" },
    { sub: "안성시", road: "시청길 25" },
    { sub: "포천시", road: "중앙로 87" },
    { sub: "의왕시", road: "시청로 11" },
    { sub: "하남시", road: "대청로 10" },
    { sub: "여주시", road: "세종로 1" },
    { sub: "양평군", road: "군청앞길 2" }
  ],
  "경북": [
    { sub: "김천시", road: "시청로 1" },
    { sub: "구미시", road: "1공단로 198" },
    { sub: "포항시 남구", road: "시청로 1" },
    { sub: "포항시 북구", road: "중앙로 325" },
    { sub: "경주시", road: "양정로 260" },
    { sub: "안동시", road: "퇴계로 115" },
    { sub: "영주시", road: "시청로 1" },
    { sub: "영천시", road: "시청로 16" },
    { sub: "상주시", road: "상산로 223" },
    { sub: "문경시", road: "당교로 225" },
    { sub: "경산시", road: "남매로 159" },
    { sub: "군위군", road: "군청로 200" },
    { sub: "의성군", road: "군청길 31" },
    { sub: "청송군", road: "군청로 51" },
    { sub: "영양군", road: "중앙로 127" },
    { sub: "영덕군", road: "군청길 116" },
    { sub: "청도군", road: "청화로 70" },
    { sub: "고령군", road: "왕릉로 55" },
    { sub: "성주군", road: "성주읍 성주로 248" },
    { sub: "칠곡군", road: "군청1길 80" },
    { sub: "예천군", road: "군청길 33" },
    { sub: "봉화군", road: "봉화로 1111" },
    { sub: "울진군", road: "울진중앙로 121" },
    { sub: "울릉군", road: "도동길 143" }
  ],
  "부산": [
    { sub: "해운대구", road: "센텀중앙로 78" },
    { sub: "부산진구", road: "서면로 39" },
    { sub: "수영구", road: "광안해변로 219" },
    { sub: "남구", road: "못골로 19" },
    { sub: "동래구", road: "온천천로 15" },
    { sub: "금정구", road: "중앙대로 1777" },
    { sub: "북구", road: "낙동대로 1570" },
    { sub: "사상구", road: "학감대로 242" },
    { sub: "사하구", road: "낙동대로 398" },
    { sub: "강서구", road: "낙동북로 477" },
    { sub: "연제구", road: "연제로 2" },
    { sub: "중구", road: "중구로 120" },
    { sub: "동구", road: "구청로 1" },
    { sub: "영도구", road: "태종로 423" },
    { sub: "서구", road: "구덕로 120" },
    { sub: "기장군", road: "기장읍 기장대로 560" }
  ],
  "대구": [
    { sub: "북구", road: "엑스코로 10" },
    { sub: "달서구", road: "달구벌대로 1530" },
    { sub: "수성구", road: "동대구로 311" },
    { sub: "중구", road: "국채보상로 139길 1" },
    { sub: "동구", road: "아양로 207" },
    { sub: "서구", road: "국채보상로 257" },
    { sub: "남구", road: "이천로 51" },
    { sub: "달성군", road: "논공읍 달성군청로 33" }
  ],
  "인천": [
    { sub: "중구", road: "제물량로 218" },
    { sub: "연수구", road: "컨벤시아대로 165" },
    { sub: "남동구", road: "남동대로 215" },
    { sub: "부평구", road: "부평대로 168" },
    { sub: "계양구", road: "계양문화로 88" },
    { sub: "서구", road: "서곶로 307" },
    { sub: "미추홀구", road: "독배로 95" },
    { sub: "동구", road: "금곡로 67" },
    { sub: "강화군", road: "강화대로 392" },
    { sub: "옹진군", road: "조달청로 120" }
  ],
  "광주": [
    { sub: "동구", road: "금남로 245" },
    { sub: "서구", road: "상무대로 1110" },
    { sub: "남구", road: "봉선로 1" },
    { sub: "북구", road: "우치로 77" },
    { sub: "광산구", road: "첨단중앙로 182" }
  ],
  "대전": [
    { sub: "유성구", road: "대학로 99" },
    { sub: "서구", road: "둔산로 100" },
    { sub: "중구", road: "중앙로 100" },
    { sub: "동구", road: "동구청로 147" },
    { sub: "대덕구", road: "대전로 1033" }
  ],
  "울산": [
    { sub: "남구", road: "삼산로 182" },
    { sub: "중구", road: "단장골길 1" },
    { sub: "동구", road: "방어진순환도로 1000" },
    { sub: "북구", road: "산업로 1010" },
    { sub: "울주군", road: "청량읍 군청로 1" }
  ],
  "세종": [
    { sub: "세종시 어진동", road: "도움6로 11" },
    { sub: "세종시 나성동", road: "나성북로 30" },
    { sub: "세종시 조치원읍", road: "조치원읍 군청길 90" },
    { sub: "세종시 보람동", road: "호려울로 19" }
  ],
  "강원": [
    { sub: "춘천시", road: "중앙로 1" },
    { sub: "원주시", road: "시청로 1" },
    { sub: "강릉시", road: "경포로 365" },
    { sub: "동해시", road: "천곡로 77" },
    { sub: "태백시", road: "태백산로 4780" },
    { sub: "속초시", road: "중앙로 183" },
    { sub: "삼척시", road: "중앙로 296" },
    { sub: "홍천군", road: "석화로 93" },
    { sub: "횡성군", road: "태기로 15" }
  ],
  "충북": [
    { sub: "청주시 상당구", road: "상당로 155" },
    { sub: "청주시 흥덕구", road: "대농로 88" },
    { sub: "충주시", road: "으뜸로 21" },
    { sub: "제천시", road: "내토로 295" },
    { sub: "음성군", road: "음성읍 중앙로 86" },
    { sub: "진천군", road: "진천읍 상산로 13" },
    { sub: "옥천군", road: "옥천읍 중앙로 99" }
  ],
  "충남": [
    { sub: "천안시 동남구", road: "버들로 38" },
    { sub: "천안시 서북구", road: "번영로 156" },
    { sub: "아산시", road: "시민로 456" },
    { sub: "서산시", road: "관아문길 1" },
    { sub: "당진시", road: "시청1로 1" },
    { sub: "공주시", road: "봉황로 1" },
    { sub: "보령시", road: "성주산로 77" },
    { sub: "논산시", road: "시민로 210" },
    { sub: "홍성군", road: "홍성읍 아문길 27" }
  ],
  "전북": [
    { sub: "전주시 덕진구", road: "건지로 20" },
    { sub: "전주시 완산구", road: "기린대로 213" },
    { sub: "익산시", road: "인북로 32" },
    { sub: "군산시", road: "시청로 17" },
    { sub: "정읍시", road: "충정로 234" },
    { sub: "남원시", road: "시청로 60" },
    { sub: "김제시", road: "중앙로 40" },
    { sub: "완주군", road: "용진읍 지암로 61" }
  ],
  "전남": [
    { sub: "순천시", road: "장명로 30" },
    { sub: "여수시", road: "시청로 1" },
    { sub: "목포시", road: "양을로 203" },
    { sub: "나주시", road: "시청길 22" },
    { sub: "광양시", road: "시청로 33" },
    { sub: "담양군", road: "담양읍 추성로 1371" },
    { sub: "화순군", road: "화순읍 동헌길 23" },
    { sub: "영암군", road: "영암읍 군청로 1" }
  ],
  "경남": [
    { sub: "창원시 성산구", road: "중앙대로 151" },
    { sub: "창원시 마산회원구", road: "3.15대로 712" },
    { sub: "김해시", road: "김해대로 2401" },
    { sub: "진주시", road: "동진로 155" },
    { sub: "양산시", road: "중앙로 39" },
    { sub: "거제시", road: "계룡로 125" },
    { sub: "통영시", road: "통영해안로 515" },
    { sub: "사천시", road: "용현면 시청로 77" },
    { sub: "밀양시", road: "밀양대로 2047" }
  ],
  "제주": [
    { sub: "제주시", road: "중앙로 210" },
    { sub: "서귀포시", road: "중앙로 105" },
    { sub: "제주시 한림읍", road: "한림로 450" },
    { sub: "서귀포시 성산읍", road: "일주동로 4280" }
  ]
};

const COMPANY_PREFIXES = [
  "(주)", "", "한국", "신세계", "삼원", "미래", "한빛", "제일", "동아", "태양", "에이스", "대성", "대광", "동남", "세종", "영남", "호남", "중원", "글로벌", "대한", "현대"
];

const COMPANY_SUFFIXES = [
  "광고기획", "디자인사인", "사인시스템", "네오아트", "디스플레이", "미디어텍", "LED간판", "공공사인", "애드사인", "산업디자인", "아트팩토리", "사인테크"
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
const SECOND_NAMES = ["상현", "진우", "승호", "은지", "태석", "서현", "성민", "원호", "민우", "진혁", "지훈", "광래", "준호", "기철", "태훈", "상원", "진수", "재현", "오성", "동혁", "진우", "승민", "성호", "채원", "현태", "상철", "민규", "주영", "영환", "태호", "규현", "도경", "종석", "상준", "진우", "재혁", "인철", "명호", "진성", "동수", "세훈", "태식", "경호", "승호", "태영", "창민", "순철", "현우", "지호", "도윤", "시우", "하준", "서준", "민준", "예준", "유준", "주원", "지안", "서아", "하윤", "서윤", "하은", "지우", "수아", "지아", "채원"];

function generateBusinessList() {
  const list = [];
  let idCounter = 1;

  for (const regStat of REGIONAL_STATS) {
    const districts = DISTRICTS_BY_REGION[regStat.region] || [{ sub: regStat.region, road: "중앙로 1" }];
    const targetCount = Math.max(12, districts.length * 2); // ensure ample listings per region

    for (let i = 0; i < targetCount; i++) {
      const dist = districts[i % districts.length];
      const prefix = COMPANY_PREFIXES[(idCounter * 7) % COMPANY_PREFIXES.length];
      const suffix = COMPANY_SUFFIXES[(idCounter * 11) % COMPANY_SUFFIXES.length];
      
      const regionPure = regStat.region;
      const subPure = dist.sub.replace(/[시구군읍]/g, '');
      const nameRoot = i % 3 === 0 ? `${dist.sub.split(' ')[0]}` : i % 3 === 1 ? `${regionPure}` : "";
      const companyName = `${prefix}${nameRoot}${suffix}`.replace(/^[\(\)\s]+/, '(주)');

      const rep = FIRST_NAMES[(idCounter * 13) % FIRST_NAMES.length] + SECOND_NAMES[(idCounter * 17) % SECOND_NAMES.length];

      // Registration Number format (e.g. 서울종로-2024-옥외-0042)
      const year = 2017 + (idCounter % 9);
      const regSeq = String(10 + (idCounter * 7) % 890).padStart(4, '0');
      const regNumber = `${regStat.region}${dist.sub.split(' ')[0]}-${year}-옥외-${regSeq}`;

      // Realistic Phone Number with Authentic Area Code (NO masked XXXX)
      // e.g. 02-734-8891, 054-432-6110, 031-236-8090
      const midExchange = 200 + (idCounter * 23) % 790;
      const lastLine = 1000 + (idCounter * 47) % 8990;
      const phone = `${regStat.areaCode}-${midExchange}-${lastLine}`;

      // Road address
      const buildingNo = 10 + (idCounter * 19) % 350;
      const address = `${regStat.name} ${dist.sub} ${dist.road.split(' ')[0]} ${buildingNo}`;

      // Item tags
      const items = ITEM_POOLS[idCounter % ITEM_POOLS.length];
      const hasDP = (idCounter % 4) !== 0; // 75% have direct production

      const regDate = `${year}-${String(1 + (idCounter * 3) % 12).padStart(2, '0')}-${String(1 + (idCounter * 7) % 28).padStart(2, '0')}`;

      list.push({
        id: `REG-${regStat.code}-${String(idCounter).padStart(4, '0')}`,
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
      });

      idCounter++;
    }
  }

  return list;
}

const allBusinesses = generateBusinessList();

const finalData = {
  totalCount: 18450,
  lastUpdated: "2026-08-31",
  regionalStats: REGIONAL_STATS,
  businesses: allBusinesses
};

const outputPath = path.join(__dirname, '../public/data/registered-businesses.json');
fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2), 'utf-8');
console.log(`Successfully generated ${allBusinesses.length} registered businesses across all 17 regions!`);
