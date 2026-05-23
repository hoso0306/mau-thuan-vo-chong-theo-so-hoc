/**
 * Python-translated Numerology Calculation Helper for Vietnamese Names and Dates
 */

export function removeAccents(s: string): string {
  let str = s.toLowerCase().trim();
  const map: { [key: string]: string } = {
    "à": "a", "á": "a", "ạ": "a", "ả": "a", "ã": "a", "â": "a", "ầ": "a", "ấ": "a", "ậ": "a", "ẩ": "a", "ẫ": "a", "ă": "a", "ằ": "a", "ắ": "a", "ặ": "a", "ẳ": "a", "ẵ": "a",
    "è": "e", "é": "e", "ẹ": "e", "ẻ": "e", "ẽ": "e", "ê": "e", "ề": "e", "ế": "e", "ệ": "e", "ể": "e", "ễ": "e",
    "ì": "i", "í": "i", "ị": "i", "ỉ": "i", "ĩ": "i",
    "ò": "o", "ó": "o", "ọ": "o", "ỏ": "o", "õ": "o", "ô": "o", "ồ": "o", "ố": "o", "ộ": "o", "ổ": "o", "ỗ": "o", "ơ": "o", "ờ": "o", "ớ": "o", "ợ": "o", "ở": "o", "ỡ": "o",
    "ù": "u", "ú": "u", "ụ": "u", "ủ": "u", "ũ": "u", "ư": "u", "ừ": "u", "ứ": "u", "ự": "u", "ử": "u", "ữ": "u",
    "ỳ": "y", "ý": "y", "ỵ": "y", "ỷ": "y", "ỹ": "y",
    "đ": "d"
  };
  
  let res = "";
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (map[c] !== undefined) {
      res += map[c];
    } else {
      res += c;
    }
  }
  
  res = res.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return res;
}

const LETTER_MAP: { [key: string]: number } = {
  "a":1,"j":1,"s":1,
  "b":2,"k":2,"t":2,
  "c":3,"l":3,"u":3,
  "d":4,"m":4,"v":4,
  "e":5,"n":5,"w":5,
  "f":6,"o":6,"x":6,
  "g":7,"p":7,"y":7,
  "h":8,"q":8,"z":8,
  "i":9,"r":9
};

export function getLetterValue(c: string): number {
  return LETTER_MAP[c] || 0;
}

export function reduceNum(n: number, km: boolean = true): number {
  if (n === 0) return 0;
  let c = n;
  while (true) {
    if (km && (c === 11 || c === 22 || c === 33)) return c;
    if (c <= 9) return c;
    c = c.toString().split("").reduce((sum, x) => sum + parseInt(x, 10), 0);
  }
}

export function isVowel(c: string, i: number, w: string): boolean {
  const vowels = ["a", "e", "i", "o", "u"];
  if (vowels.includes(c)) return true;
  if (c === "y") {
    if (w.length === 1) return true;
    if (i === w.length - 1) return !vowels.includes(w[i - 1]);
    if (i > 0) return !vowels.includes(w[i - 1]) && !vowels.includes(w[i + 1]);
  }
  return false;
}

export interface PythonNumerologyResult {
  "Nội tâm": number;
  "Tương tác": number;
  "Sứ mệnh": number;
  "Đường đời": number;
  "Thái độ": number;
  "Ngày sinh": number;
  "Năm cá nhân": number;
  "Tháng cá nhân": string[];
  "Cân bằng": number;
  "Nội cảm": number[];
  "Đỉnh chặng": number[];
  "Thách thức": number[];
}

export function calcPythonNumerology(fullName: string, dobString: string): PythonNumerologyResult {
  const words = removeAccents(fullName).split(/\s+/).filter(w => w.length > 0);
  const aV: number[] = [];
  const wD: number[] = [];
  const wS: number[] = [];
  const wP: number[] = [];
  const fL: number[] = [];
  
  let total_ss = 0;
  let total_ps = 0;
  let total_ds = 0;
  
  for (const w of words) {
    let ds = 0;
    let ss = 0;
    let ps = 0;
    for (let i = 0; i < w.length; i++) {
      const c = w[i];
      if (c < "a" || c > "z") continue;
      const v = getLetterValue(c);
      aV.push(v);
      ds += v;
      if (isVowel(c, i, w)) {
        ss += v;
      } else {
        ps += v;
      }
    }
    total_ss += ss;
    total_ps += ps;
    total_ds += ds;
    
    wD.push(reduceNum(ds, true));
    wS.push(reduceNum(ss, true));
    wP.push(reduceNum(ps, true));
    
    if (w.length > 0) {
      const firstChar = w[0];
      if (firstChar >= "a" && firstChar <= "z") {
        fL.push(getLetterValue(firstChar));
      }
    }
  }
  
  // Parse dobString (usually YYYY-MM-DD from HTML date-picker)
  const dParts = dobString.split("-").map(x => parseInt(x, 10)).filter(x => !isNaN(x));
  let dy = 1;
  let mo = 1;
  let yr = 2000;
  
  if (dParts.length >= 3) {
    if (dParts[0] > 100) {
      // YYYY-MM-DD
      yr = dParts[0];
      mo = dParts[1];
      dy = dParts[2];
    } else {
      // DD-MM-YYYY
      dy = dParts[0];
      mo = dParts[1];
      yr = dParts[2];
    }
  }
  
  const rD = reduceNum(dy, true);
  const rM = reduceNum(mo, true);
  
  const rawY = yr.toString().split("").reduce((sum, x) => sum + parseInt(x, 10), 0);
  const rY = reduceNum(rawY, true);
  
  // Using current system year/month for dynamic calculation
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed
  
  const rawC = currentYear.toString().split("").reduce((sum, x) => sum + parseInt(x, 10), 0);
  
  // lp = red(sum(int(x) for x in str(dy) + str(mo) + str(yr)))
  const concatStr = dy.toString() + mo.toString() + yr.toString();
  const sumDigitsLP = concatStr.split("").reduce((sum, x) => sum + parseInt(x, 10), 0);
  const lp = reduceNum(sumDigitsLP, true);
  
  // py = red(dy + mo + rawC, True)
  const py = reduceNum(dy + mo + rawC, true);
  
  // Monthly calculations
  const pMs: string[] = [];
  for (let i = 0; i < 6; i++) {
    let m = currentMonth + i;
    let y = currentYear;
    if (m > 12) {
      m -= 12;
      y += 1;
    }
    const sumYDigits = y.toString().split("").reduce((sum, x) => sum + parseInt(x, 10), 0);
    const pmVal = reduceNum(dy + mo + sumYDigits + m, true);
    pMs.push(`${m.toString().padStart(2, '0')}/${y}: ${pmVal}`);
  }
  
  // Inner Feeling (Nội cảm / nc)
  const counts: { [key: number]: number } = {};
  for (const v of aV) {
    counts[v] = (counts[v] || 0) + 1;
  }
  const countValues = Object.values(counts);
  const maxC = countValues.length > 0 ? Math.max(...countValues) : 0;
  
  const nc = Object.keys(counts)
    .map(Number)
    .filter(k => counts[k] >= maxC - 1 && counts[k] >= 3)
    .sort((a, b) => a - b);
    
  // Đỉnh chặng
  const peak1 = reduceNum(dy + mo, true);
  const peak2 = reduceNum(dy + rawY, true);
  const peak3 = reduceNum(reduceNum(dy + mo, true) + reduceNum(dy + rawY, true), true);
  const peak4 = reduceNum(mo + rawY, true);
  
  // Thách thức
  const redDyNoMaster = reduceNum(dy, false);
  const redMoNoMaster = reduceNum(mo, false);
  const redYNoMaster = reduceNum(rawY, false);
  
  const challenger1 = Math.abs(redDyNoMaster - redMoNoMaster);
  const challenger2 = Math.abs(redDyNoMaster - redYNoMaster);
  const challenger3 = Math.abs(challenger1 - challenger2);
  const challenger4 = Math.abs(redMoNoMaster - redYNoMaster);
  
  return {
    "Nội tâm": reduceNum(total_ss, true),
    "Tương tác": reduceNum(total_ps, true),
    "Sứ mệnh": reduceNum(total_ds, true),
    "Đường đời": lp,
    "Thái độ": reduceNum(dy + mo, true),
    "Ngày sinh": rD,
    "Năm cá nhân": py,
    "Tháng cá nhân": pMs,
    "Cân bằng": reduceNum(fL.reduce((sum, x) => sum + x, 0), true),
    "Nội cảm": nc,
    "Đỉnh chặng": [peak1, peak2, peak3, peak4],
    "Thách thức": [challenger1, challenger2, challenger3, challenger4]
  };
}

// Get Vietnamese description keywords for Life Path Number
export function getLifePathTraits(num: number): { title: string; keywords: string[]; description: string } {
  const descriptions: { [key: number]: { title: string; keywords: string[]; description: string } } = {
    1: {
      title: "Nhà Lãnh Đạo Tự Chủ",
      keywords: ["Độc lập", "Quyết đoán", "Tiên phong", "Tham vọng"],
      description: "Có xu hướng làm chủ bản thân, thích tự ra quyết định và dẫn dắt người lý trí. Trong hôn nhân, người số 1 luôn muốn giữ vai chính dẫn dắt, đôi khi có phần độc lập thái quá hoặc thích kiểm soát."
    },
    2: {
      title: "Người Kết Nối Hòa Nhã",
      keywords: ["Hợp tác", "Lắng nghe", "Nhạy cảm", "Hòa giải"],
      description: "Thích sự yên bình, giỏi lắng nghe, giàu sự đồng cảm và trân quý mối quan hệ hợp tác. Người số 2 coi trọng bạn đời vô cùng, đôi khi quá nhạy cảm hay cả nể dễ xúc động và hay chịu thiệt thòi."
    },
    3: {
      title: "Người Truyền Cảm Hứng Đại Tài",
      keywords: ["Sáng tạo", "Giao tiếp", "Vui vẻ", "Năng lượng"],
      description: "Giàu ý tưởng, giỏi giao lưu, truyền cảm hứng vui tươi đến mọi người xung quanh cực mạnh mẽ. Đôi khi có xu hướng bộc phát cảm xúc nhất thời, bốc đồng hay cả thèm chóng chán trong đời sống thường ngày."
    },
    4: {
      title: "Người Kiến Tạo Thực Tế",
      keywords: ["Kỷ luật", "Thực tế", "Vững chãi", "Chi tiết"],
      description: "Yêu chuộng trật tự, tính thực tế cao, kiên định và luôn làm việc có kế hoạch. Trong gia đình, đây là chỗ dựa vững chãi nhưng đôi lúc khá bảo thủ, cứng nhắc, thiếu đi sự lãng mạn lôi cuốn."
    },
    5: {
      title: "Người Phiêu Lưu Tự Do",
      keywords: ["Phóng khoáng", "Thích trải nghiệm", "Thích nghi nhanh", "Không bó buộc"],
      description: "Đặt tự do, sự mới mẻ lên hàng đầu. Sợ sự ràng buộc rập khuôn tẻ nhạt. Trong hôn nhân, cuộc sống gia đình cần nhiều điều thú vị độc đáo, nếu không số 5 sẽ dễ có cảm giác bị tù túng."
    },
    6: {
      title: "Người Chăm Sóc Trách Nhiệm",
      keywords: ["Yêu thương", "Bảo bọc", "Gia đình", "Trách nhiệm"],
      description: "Biểu trưng của tình mẫu tử/phụ tử, thích chăm lo, bảo bọc cho tổ ấm và những người thân yêu quý. Tuy nhiên, họ dễ trở nên lo âu thái quá hoặc muốn kiểm soát đối phương dưới danh nghĩa yêu thương."
    },
    7: {
      title: "Nhà Chiêm Nghiệm Trí Tuệ",
      keywords: ["Suy tư", "Phân tích", "Chân lý", "Cô độc"],
      description: "Thích chiêm nghiệm tự lập, phân tích logic sâu sắc, tìm tòi bản chất sự việc. Người số 7 thích có không gian riêng tư cao độ, vì vậy họ thường bị bạn đời hiểu lầm là lạnh lùng hay cô lập."
    },
    8: {
      title: "Nhà Điều Hành Uy Quyền",
      keywords: ["Tài chính", "Quyền lực", "Quản lý", "Thực tế"],
      description: "Mang năng lượng của sự thịnh vượng, quả cảm, kiểm soát và tổ chức xuất sắc. Coi trọng tài chính ổn định và sự tôn trọng từ bạn đời, đôi khi khô khan hay quá thiên về vật chất."
    },
    9: {
      title: "Người Nhân Ái Lý Tưởng",
      keywords: ["Nhân đạo", "Hoài bão", "Nghĩa hiệp", "Lòng tốt"],
      description: "Luôn mang lý tưởng giúp đỡ cộng đồng hoặc hướng tới cái đẹp toàn mỹ tuyệt đối. Đôi khi họ bao dung việc xã hội nhưng lại hơi vô tâm với chính gia đình nhỏ của mình vì quá mơ mộng cao xa."
    },
    11: {
      title: "Người Khai Sáng Tâm Linh (Master 11)",
      keywords: ["Trực giác", "Bài học lớn", "Nhạy cảm cao", "Khai sáng"],
      description: "Con số Master mang năng lượng trực giác nhạy bén tuyệt vời cùng lý tưởng cao cả. Tuy nhiên dễ bị căng thẳng thần kinh bộc phát dồn dập hoặc mâu thuẫn nội tâm dai dẳng đầy mệt mỏi."
    },
    22: {
      title: "Người Kiến Tạo Tầm Vóc (Master 22)",
      keywords: ["Thực lực lớn", "Trực giác", "Tầm nhìn xa", "Chắt chiu"],
      description: "Sở hữu khả năng phi thường biến giấc mơ lớn thành hiện thực thực tế. Tuy nhiên dễ chịu áp lực thành công cực kỳ nặng nề, khiến cuộc sống hôn nhân thiếu hụt không khí thoải mái tự nhiên."
    },
    33: {
      title: "Người Thầy Chữa Lành (Master 33)",
      keywords: ["Yêu thương vô bờ", "Chữa lành", "Hy sinh", "Nuôi dưỡng"],
      description: "Năng lượng vũ trụ của sự chữa lành, hy sinh thầm lặng và bao dung vô bờ bến. Thường gánh vác trách nhiệm gia quyến quá lớn, dễ rơi vào trạng thái kiệt quệ cảm xúc vì quên đi bản thân."
    }
  };

  return descriptions[num] || {
    title: "Con Số Bí Ẩn",
    keywords: ["Khám phá", "Tiềm ẩn"],
    description: "Mang năng lượng tiềm tàng cần được thấu hiểu sâu sắc từ cuộc sống."
  };
}

export function getBasicCompatibilityScore(lp1: number, lp2: number): number {
  if (!lp1 || !lp2) return 50;

  if (lp1 === lp2) return 80;

  const isGroup369 = (n: number) => n === 3 || n === 6 || n === 9 || n === 33;
  const isGroup157 = (n: number) => n === 1 || n === 5 || n === 7 || n === 11;
  const isGroup248 = (n: number) => n === 2 || n === 4 || n === 8 || n === 22;

  if (isGroup369(lp1) && isGroup369(lp2)) return 92;
  if (isGroup157(lp1) && isGroup157(lp2)) return 88;
  if (isGroup248(lp1) && isGroup248(lp2)) return 90;

  const pair = [lp1, lp2].sort((a,b) => a - b);
  
  if (pair[0] === 1 && pair[1] === 8) return 55;
  if (pair[0] === 4 && pair[1] === 5) return 42;
  if (pair[0] === 1 && pair[1] === 5) return 68;
  if (pair[0] === 7 && pair[1] === 1) return 60;
  if (pair[0] === 3 && pair[1] === 4) return 48;
  if (pair[0] === 2 && pair[1] === 7) return 50;
  if (pair[0] === 6 && pair[1] === 5) return 52;

  return 65;
}
