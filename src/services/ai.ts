import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../types/music';

// Initialize Gemini API if key is available
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface AIResponse {
  reply: string;
  searchQuery: string;
  extractedMoods: string[];
}

// Highly realistic Local NLP engine for beautiful Vietnamese responses offline
function getMockAIResponse(userMessage: string, chatHistory: Message[]): AIResponse {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('buồn') || msg.includes('mưa') || msg.includes('sad') || msg.includes('cô đơn') || msg.includes('khóc')) {
    return {
      reply: 'Mình hiểu cảm giác của bạn lúc này. Những lúc tâm trạng có chút trùng xuống, để âm nhạc làm người bạn đồng hành vỗ về tâm hồn nhé. Mình đã chọn cho bạn một vài giai điệu ballad nhẹ nhàng và lofi da diết để lắng lòng lại.',
      searchQuery: 'melancholic lofi acoustic sad',
      extractedMoods: ['sad', 'rainy', 'buồn']
    };
  }
  
  if (msg.includes('học') || msg.includes('tập trung') || msg.includes('làm việc') || msg.includes('study') || msg.includes('focus') || msg.includes('đọc sách')) {
    return {
      reply: 'Tuyệt vời, chúc bạn có một phiên làm việc và học tập thật hiệu quả nhé. Mình đã chuẩn bị sẵn những giai điệu Lofi không lời và Ambient êm nhẹ, giúp tối ưu hóa sóng não và tăng độ tập trung tối đa.',
      searchQuery: 'lofi study focus deep ambient instrument',
      extractedMoods: ['focus', 'study', 'tập trung']
    };
  }

  if (msg.includes('gym') || msg.includes('thể thao') || msg.includes('workout') || msg.includes('chạy') || msg.includes('năng lượng') || msg.includes('sung')) {
    return {
      reply: 'Lên nhạc thôi nào! Hãy cùng bùng nổ năng lượng và vượt qua các giới hạn của bản thân hôm nay nhé. Dưới đây là những giai điệu EDM, Synthwave và Rock vô cùng bốc để đốt cháy calo cùng bạn!',
      searchQuery: 'synthwave workout energetic electronic rock edm',
      extractedMoods: ['workout', 'energetic', 'tập gym']
    };
  }

  if (msg.includes('ngủ') || msg.includes('sleep') || msg.includes('mệt') || msg.includes('stress') || msg.includes('căng thẳng') || msg.includes('thư giãn') || msg.includes('chill')) {
    return {
      reply: 'Sau một ngày dài mệt mỏi, hãy thả lỏng cơ thể, nhắm mắt lại và để âm nhạc đưa bạn vào trạng thái thư thái nhất. Chúc bạn có một giấc ngủ thật ngon hoặc những phút giây thư giãn bình yên bên những giai điệu acoustic mộc mạc và ambient này.',
      searchQuery: 'relaxing acoustic sleep deep ambient lullaby',
      extractedMoods: ['relax', 'chill', 'sleep', 'thư giãn']
    };
  }

  if (msg.includes('vui') || msg.includes('happy') || msg.includes('tiệc') || msg.includes('party') || msg.includes('chơi')) {
    return {
      reply: 'Tuyệt quá, năng lượng tích cực này cần được lan tỏa ngay thôi! Hãy cùng lắc lư theo những giai điệu Pop, Disco sôi động và vui tươi này nhé. Chúc bạn có một ngày thật nhiều tiếng cười!',
      searchQuery: 'happy indie pop tropical house disco upbeat',
      extractedMoods: ['happy', 'energetic', 'vui vẻ']
    };
  }

  if (msg.includes('game') || msg.includes('chơi game') || msg.includes('gaming')) {
    return {
      reply: 'Sẵn sàng chiến game chưa bạn ơi! Những bản nhạc Synthwave nhịp điệu dồn dập này sẽ tăng thêm 200% độ tập trung và kịch tính cho trận đấu của bạn đấy.',
      searchQuery: 'synthwave cyberpunk darksynth gaming beat',
      extractedMoods: ['gaming', 'energetic']
    };
  }

  // Default response
  return {
    reply: 'Chào bạn, mình là Trợ lý Âm nhạc Thông minh Smart Music AI! Mình ở đây để trò chuyện và lắng nghe bạn chia sẻ cảm xúc hoặc hoạt động hiện tại (như làm việc, đi chơi, buồn, vui, khó ngủ...). Hãy nói cho mình biết tâm trạng lúc này của bạn để mình tìm những bài hát thật sự phù hợp nhất nhé.',
    searchQuery: 'chill acoustic lofi popular pop',
    extractedMoods: ['chill', 'happy']
  };
}

export async function askMusicAssistant(
  userMessage: string,
  chatHistory: Message[]
): Promise<AIResponse> {
  if (!genAI) {
    // If Gemini API is not configured, fall back to our premium Mock NLP
    console.log('Gemini API key missing. Using highly detailed Local Mock NLP Engine.');
    return getMockAIResponse(userMessage, chatHistory);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: `Bạn là Smart Music Assistant - Trợ lý Âm nhạc Thông minh chuyên nghiệp, thấu hiểu cảm xúc và tinh tế.
Nhiệm vụ của bạn là trò chuyện với người dùng bằng TIẾNG VIỆT, đồng hành thấu hiểu tâm sự của họ, sau đó trích xuất ra mood/hoạt động và tạo từ khóa tìm kiếm nhạc phù hợp để tìm kiếm trên Spotify.

Hãy luôn trả về định dạng JSON duy nhất theo cấu trúc sau:
{
  "reply": "Nội dung phản hồi chân thành, ấm áp, đồng cảm bằng tiếng Việt (khoảng 2-3 câu). Tránh nói sáo rỗng.",
  "searchQuery": "Từ khóa tìm kiếm nhạc bằng tiếng Anh để gửi tới Spotify API (ví dụ: 'lofi study focus', 'acoustic sad rain', 'upbeat energetic pop')",
  "extractedMoods": ["danh sách", "các mood tags phù hợp bằng tiếng Việt hoặc tiếng Anh"]
}

Ví dụ ngữ cảnh:
- Người dùng nói: "Hôm nay làm việc mệt mỏi ghê."
  Trả về: { "reply": "Thương bạn. Sau một ngày dài vất vả, hãy tự thưởng cho mình những phút giây bình yên nhé. Để mình bật vài bản nhạc nhẹ nhàng làm dịu đi sự căng thẳng này nha.", "searchQuery": "acoustic chill relax instrumental", "extractedMoods": ["chill", "relax", "thư giãn"] }

- Người dùng nói: "Học bài buồn ngủ quá."
  Trả về: { "reply": "Cố gắng lên nào! Một chút giai điệu lofi không lời tươi tắn sẽ giúp bạn tỉnh táo và khôi phục năng lượng tập trung ngay lập tức đấy.", "searchQuery": "lofi study upbeat focus no vocals", "extractedMoods": ["study", "focus", "tập trung"] }`
    });

    // Format chat history for Gemini API content structure
    const historyPrompts = chatHistory.slice(-6).map((msg) => {
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      };
    });

    // Add current user message
    const chat = model.startChat({
      history: historyPrompts
    });

    const result = await chat.sendMessage(userMessage);
    const textResult = result.response.text();
    
    // Parse JSON safely
    const parsed: AIResponse = JSON.parse(textResult);
    return {
      reply: parsed.reply || 'Mình hiểu rồi. Hãy cùng nghe vài bài hát nhé.',
      searchQuery: parsed.searchQuery || 'chill acoustic lofi',
      extractedMoods: parsed.extractedMoods || ['chill']
    };
  } catch (error) {
    console.error('Gemini API call failed, falling back to Local Mock NLP:', error);
    return getMockAIResponse(userMessage, chatHistory);
  }
}
