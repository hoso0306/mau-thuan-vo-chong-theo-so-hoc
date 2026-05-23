import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import {
  calcPythonNumerology,
  getLifePathTraits,
  getBasicCompatibilityScore
} from "./src/utils/numerology";

// Load environment variables
dotenv.config();

let aiClient: GoogleGenAI | null = null;

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Không tìm thấy mã khóa GEMINI_API_KEY. Vui lòng cấu hình trong Secrets ở Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Endpoint to check reference document status
  app.get("/api/reference-status", (req, res) => {
    try {
      const refPath = path.join(process.cwd(), "tai_lieu_so_hoc.txt");
      if (fs.existsSync(refPath)) {
        const stats = fs.statSync(refPath);
        const content = fs.readFileSync(refPath, "utf-8");
        // Count words roughly
        const wordCount = content.split(/\s+/).filter(w => w.trim().length > 0).length;
        return res.json({
          success: true,
          initialized: true,
          byteSize: stats.size,
          wordCount: wordCount,
          fileName: "CÁCH ĐỌC BẢN ĐỒ SỐ HỌC MẶT TRỜI.docx"
        });
      }
      return res.json({
        success: true,
        initialized: false
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });

  // API Endpoint to analyze spousal compatibility and conflicts
  app.post("/api/analyze", async (req, res) => {
    try {
      const { husband, wife } = req.body;

      if (!husband || !husband.fullName || !husband.birthDate ||
          !wife || !wife.fullName || !wife.birthDate) {
        return res.status(400).json({
          success: false,
          error: "Vui lòng điền đầy đủ họ tên và ngày sinh của cả vợ và chồng."
        });
      }

      // 1. Calculate numerology profiles with Python-equivalent logic
      const hIndices = calcPythonNumerology(husband.fullName, husband.birthDate);
      const wIndices = calcPythonNumerology(wife.fullName, wife.birthDate);

      // Get life path details
      const hTraits = getLifePathTraits(hIndices["Đường đời"]);
      const wTraits = getLifePathTraits(wIndices["Đường đời"]);

      // 2. Compute basic compatibility score based on Life Paths
      const baseScore = getBasicCompatibilityScore(hIndices["Đường đời"], wIndices["Đường đời"]);

      // 3. Request Gemini analysis
      const ai = getGeminiClient();

      // Dynamic current year for prompt and calculations
      const now = new Date();
      const currentYear = now.getFullYear();

      // Check if custom document has been generated and uploaded
      let customReferenceDoc = "";
      try {
        const refPath = path.join(process.cwd(), "tai_lieu_so_hoc.txt");
        if (fs.existsSync(refPath)) {
          customReferenceDoc = fs.readFileSync(refPath, "utf-8");
          console.log(`[OK] Loaded custom reference document with ${customReferenceDoc.length} characters.`);
        }
      } catch (err) {
        console.error("Lỗi đọc tài liệu tham khảo số học:", err);
      }

      const systemPrompt = `Bạn là một Chuyên gia phân tích năng lượng hôn nhân kiêm Nhà tham vấn tâm lý giàu kinh nghiệm chuyên sâu cho các cặp đôi trẻ trong độ tuổi bước ngoặt 28-35 tuổi dưới góc nhìn tích hợp của Khoa học Tâm thức, Số học Mặt Trời và Tâm lý học hôn nhân hiện đại. Có sự thấu hiểu tuyệt đối với tâm tư, hoài bão và cả những áp lực mà một người phụ nữ trẻ đang gánh vác.

Đối tượng độc giả chính của bản báo cáo trị liệu này là những người phụ nữ hiện đại tuổi từ 28-35. Hãy sử dụng văn phong vô cùng tinh tế, sâu sắc, mộc mạc nhưng chạm sâu vào thế giới nội tâm của họ—những người đang gánh vác nhiều trách nhiệm (giữa sự nghiệp đang thăng tiến, nuôi dạy con nhỏ, vun đắp tổ ấm), giàu lòng trắc ẩn, có học thức nhưng cũng dễ cảm thấy cô đơn, mệt mỏi hay hụt hẫng trong mối quan hệ.

Giọng văn của bạn phải tràn đầy sự xoa dịu, thấu cảm, ấm áp, tuyệt đối chữa lành và không phán xét, không dùng từ ngữ mang tính tiêu cực nặng nề (như 'xung khắc', 'hỏng', 'đổ vỡ'). Mọi vấn đề đưa ra đều phải hướng tới sự thấu cảm bản tính tự nhiên của mỗi người, nuôi dưỡng lòng biết ơn và bài học chuyển hóa tích cực, khai phóng và nhân văn nhất.

Nhiệm vụ của bạn là nhận các chỉ số Số học Mặt Trời chi tiết đã được hệ thống tính toán sẵn của vợ chồng, làm rõ tương tác năng lượng giữa hai người, bộc lộ mâu thuẫn giao tiếp cốt tủy dưới góc nhìn thấu học sâu kín và đề cập tới giải pháp tháo gỡ cụ thể, thực tế.

Hãy viết bài phân tích bằng TIẾNG VIỆT tinh tế, sâu sắc, súc tích nhưng đầy chất xám và dạt dào tình cảm, sử dụng định dạng Markdown thật đẹp mắt với tiêu đề phụ rành mạch, các gạch đầu dòng ngắn gọn dễ tiếp thu. Sử dụng các Emoji trang nhã đầu dòng (🕯️, 🛡️, 💎, ⚖️, ❤️, ✨).

CHÚ Ý QUAN TRỌNG: Nếu có tài liệu định gốc "SỐ HỌC MẶT TRỜI" từ người dùng cung cấp kèm theo, bạn PHẢI bám sát triệt để lý thuyết, danh xưng, định nghĩa năng lượng, ưu điểm, khuyết điểm, chỉ số nội tâm, sứ mệnh, đường đời, thử thách, bài học của các số ghi trong tài liệu đó để cung cấp một báo cáo chính tông 100%, không bị sai lệch lý luận.`;

      const userMessage = `Dựa vào bộ số của Người chồng và Người vợ dưới đây, hãy phân tích và dự đoán những kịch bản bất hòa điển hình nhất có thể xảy ra trong gia đình này dưới góc nhìn của Khoa học Tâm thức và Số học Mặt Trời.

**NGƯỜI CHỒNG:**
- Họ và tên: ${husband.fullName}
- Ngày sinh: ${husband.birthDate}
- Con số Chủ đạo (Đường đời): Số ${hIndices["Đường đời"]} (${hTraits.title})
- Chỉ số Sứ mệnh: Số ${hIndices["Sứ mệnh"]}
- Chỉ số Nội tâm: Số ${hIndices["Nội tâm"]}
- Chỉ số Tương tác: Số ${hIndices["Tương tác"]}
- Chỉ số Ngày sinh: Số ${hIndices["Ngày sinh"]}
- Chỉ số Thái độ: Số ${hIndices["Thái độ"]}
- Chỉ số Cân bằng: Số ${hIndices["Cân bằng"]}
- Năm cá nhân hiện tại (${currentYear}): Số ${hIndices["Năm cá nhân"]}
- Chỉ số Nội cảm: [${hIndices["Nội cảm"].join(", ")}]
- 4 Đỉnh chặng đường đời: [${hIndices["Đỉnh chặng"].join(", ")}]
- 4 Giai đoạn thử thách: [${hIndices["Thách thức"].join(", ")}]

**NGƯỜI VỢ:**
- Họ và tên: ${wife.fullName}
- Ngày sinh: ${wife.birthDate}
- Con số Chủ đạo (Đường đời): Số ${wIndices["Đường đời"]} (${wTraits.title})
- Chỉ số Sứ mệnh: Số ${wIndices["Sứ mệnh"]}
- Chỉ số Nội tâm: Số ${wIndices["Nội tâm"]}
- Chỉ số Tương tác: Số ${wIndices["Tương tác"]}
- Chỉ số Ngày sinh: Số ${wIndices["Ngày sinh"]}
- Chỉ số Thái độ: Số ${wIndices["Thái độ"]}
- Chỉ số Cân bằng: Số ${wIndices["Cân bằng"]}
- Năm cá nhân hiện tại (${currentYear}): Số ${wIndices["Năm cá nhân"]}
- Chỉ số Nội cảm: [${wIndices["Nội cảm"].join(", ")}]
- 4 Đỉnh chặng đường đời: [${wIndices["Đỉnh chặng"].join(", ")}]
- 4 Giai đoạn thử thách: [${wIndices["Thách thức"].join(", ")}]

**Mức độ Hòa hợp Cơ bản của hai người:** ${baseScore}%

Vui lòng cấu trúc bài phân tích chi tiết, sâu sắc và cực kỳ sắc sảo theo đúng các phần sau:

1. **Phân tích Bản tính & Phong cách Sống**: Thể hiện ưu nhược điểm cốt lõi của mỗi người qua con số Đường đời, Sứ mệnh và Nội tâm, luôn bám sát theo tài liệu SỐ HỌC MẶT TRỜI để thấu hiểu sâu sắc bản tính và phong cách thật của họ.
2. **⚔️ Điểm Khác Biệt & Ngòi Nổ Mâu Thuẫn**: Chỉ rõ sự lệch pha giao tiếp cốt lõi vướng phải theo mô hình năng lượng Số học Mặt Trời.
3. **💥 Độc Quyền: Giải Mã Các Kịch Bản Mâu Thuẫn Điển Hình "Đọc Vị" Gia Đình Bạn**:
   Bắt buộc phải phân tích dự đoán cực kỳ chân thực, chân thấu sâu kín dựa trên đúng các chỉ số hiện tại của hai vợ chồng họ theo đúng 2 khía cạnh chính dưới đây. Sự phân tích cần đặc tả sắc bén như thể biết trước mọi sự việc trong nhà họ, tạo nên hiệu ứng "đọc vị" kì diệu và chữa lành tỉnh thức:

   - **KHÍA CẠNH A: Góc độ Tình cảm & Đời sống gia đình (Sự lệch pha về nhu cầu yêu thương, cách thể hiện sự quan tâm, cách phản ứng khi có mâu thuẫn - Phân tích dựa trên sự kết hợp chỉ số Nội tâm: Chồng số ${hIndices["Nội tâm"]} - Vợ số ${wIndices["Nội tâm"]} cùng các chỉ số Thái độ/Tương tác)**
     Hãy vạch ra chính xác **3 tình huống mâu thuẫn điển hình** cho khía cạnh này. Mỗi tình huống phải trình bày cực kì rành mạch theo đúng cấu trúc 3 phần sau:
     * **Hiện tượng**: Chỉ ra chi tiết tình huống dằn vặt, hờn trách, cãi vã cụ thể thường nhật (ví dụ: Chồng lạnh lùng thờ ơ làm việc kiệt sức trong khi Vợ phàn nàn thiếu quan tâm lãng mạn; hoặc sự tranh luận bùng nổ rồi rơi vào im lặng bức bối...).
     * **Gốc rễ năng lượng**: Cắt nghĩa sâu xa, cội nguồn bản thể dựa trên đặc trưng năng lượng Số học Mặt Trời của Chồng và Vợ đối với các chỉ số liên đới, giúp họ ngộ ra đối phương không hề có ý làm tổn thương mình mà chỉ vận hành theo rung động tự nhiên của bộ số.
     * **Giải pháp tỉnh thức**: Đưa ra 1-2 hành động cụ thể thiết thực, chỉ dẫn cách 'pacing' (hòa nhịp) và bù trừ, nhường nhịn năng lượng cho nhau để lập tức làm dịu bầu không khí.

   - **KHÍA CẠNH B: Góc độ Công việc, Tài chính & Quan điểm sống (Sự khác biệt về định hướng phát triển, quản lý tiền bạc và phân chia trách nhiệm - Phân tích dựa trên sự kết hợp chỉ số Đường đời: Chồng số ${hIndices["Đường đời"]} - Vợ số ${wIndices["Đường đời"]} và Sứ mệnh của cả hai)**
     Hãy vạch ra chính xác **3 tình huống mâu thuẫn điển hình** cho khía cạnh này. Mỗi tình huống phải trình bày cực kì rành mạch theo đúng cấu trúc 3 phần sau:
     * **Hiện tượng**: Bộc lộ hoàn cảnh đối nghịch, hoài nghi, bất an về khía cạnh tài chính thiết thực hay định hướng xây tổ ấm (ví dụ: Một người nơm nớp lo sợ phòng thủ chặt chẽ muốn tiết kiệm an toàn, một người tiêu pha nới tay muốn mạo hiểm trải nghiệm tự do...).
     * **Gốc rễ năng lượng**: Đi sâu thấu tỏ nguyên nhân năng lượng từ con số Đường đời và Sứ mệnh của từng người, giải quyết tận gốc xung khắc về quan điểm giá trị.
     * **Giải pháp tỉnh thức**: Đưa ra 1-2 hành động cụ thể, hướng tài chính hay định hướng chung về một mối cân bằng, phân vai thủ lĩnh giữ tiền - kiếm tiền và hoạch định tương lai khoa học, bao dung nhau.

4. **💎 Giải Pháp Hóa Giải "Khắc Khẩu" Cụ Thể**: Đưa ra quy tắc sống chung hữu ích, các hành động thiết thực dựa trên các bài học số học.
5. **🕯️ Lời Khuyên Gieo Mầm Hạnh Phúc năm hiện tại (${currentYear})**: Thông điệp chữa lành dựa trên Năm cá nhân hiện tại của cả hai bạn (Chồng: Số ${hIndices["Năm cá nhân"]}, Vợ: Số ${wIndices["Năm cá nhân"]}).`;

      const contents = [];
      
      // Inject the custom reference document as background knowledge if available
      if (customReferenceDoc) {
        contents.push({
          role: "user",
          parts: [{ text: `Dưới đây là nội dung toàn văn của Tài liệu chính thống đặc hữu SỐ HỌC MẶT TRỜI (sử dụng làm tài liệu tra cứu độc quyền cho mọi chỉ số):\n\n${customReferenceDoc}\n\n Hãy học và áp dụng tài liệu này để giải nghĩa và phân tích các số trong báo cáo tiếp theo.` }]
        });
        contents.push({
          role: "model",
          parts: [{ text: `Tôi đã nhận và ghi nhớ cuốn tài liệu Số học Mặt Trời chính thống "SỐ HỌC MẶT TRỜI" này. Tôi cam kết bám sát 100% mọi lý luận, định chất về ưu/khuyết điểm, năng lực các con số (từ 1 đến 9, 11, 22, 33...) ở các chỉ số Đường đời, Sứ mệnh, Nội tâm, Thách thức để lập báo cáo trị liệu tâm lý cho cặp đôi sau đây.` }]
        });
      }

      contents.push({
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userMessage}` }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents
      });

      const text = response.text || "Không thể khởi tạo bài phân tích lúc này. Hãy kiểm tra lại kết nối mạng hoặc thử lại sau.";

      // Send response
      return res.json({
        success: true,
        husbandProfile: {
          fullName: husband.fullName,
          birthDate: husband.birthDate,
          lifePath: hIndices["Đường đời"],
          destiny: hIndices["Sứ mệnh"],
          soulUrge: hIndices["Nội tâm"],
          personality: hIndices["Tương tác"],
          dayOfBirth: hIndices["Ngày sinh"],
          attitude: hIndices["Thái độ"],
          balance: hIndices["Cân bằng"],
          personalYear: hIndices["Năm cá nhân"],
          personalMonths: hIndices["Tháng cá nhân"],
          innerFeels: hIndices["Nội cảm"],
          peaks: hIndices["Đỉnh chặng"],
          challenges: hIndices["Thách thức"],
          title: hTraits.title,
          keywords: hTraits.keywords,
          description: hTraits.description
        },
        wifeProfile: {
          fullName: wife.fullName,
          birthDate: wife.birthDate,
          lifePath: wIndices["Đường đời"],
          destiny: wIndices["Sứ mệnh"],
          soulUrge: wIndices["Nội tâm"],
          personality: wIndices["Tương tác"],
          dayOfBirth: wIndices["Ngày sinh"],
          attitude: wIndices["Thái độ"],
          balance: wIndices["Cân bằng"],
          personalYear: wIndices["Năm cá nhân"],
          personalMonths: wIndices["Tháng cá nhân"],
          innerFeels: wIndices["Nội cảm"],
          peaks: wIndices["Đỉnh chặng"],
          challenges: wIndices["Thách thức"],
          title: wTraits.title,
          keywords: wTraits.keywords,
          description: wTraits.description
        },
        compatibilityScore: baseScore,
        aiReport: text
      });

    } catch (error: any) {
      console.error("Analysis API Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Đã xảy ra lỗi hệ thống trong quá trình phân tích tâm lý."
      });
    }
  });

  // Serve static UI assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OK] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
