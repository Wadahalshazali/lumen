import axios from 'axios';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Function to detect if text is Arabic
const isArabic = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

export const askAgent = async (question: string): Promise<string> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('sk-p***')) {
    return 'Please configure your OpenAI API key in the .env file to use this feature.\n\nيرجى تكوين مفتاح OpenAI API في ملف .env لاستخدام هذه الميزة.';
  }

  try {
    // Detect the language of the question
    const questionLanguage = isArabic(question) ? 'Arabic' : 'English';
    
    const systemMessage = questionLanguage === 'Arabic' 
      ? 'You are a helpful educational assistant. The user is asking in Arabic, so respond only in Arabic.'
      : 'You are a helpful educational assistant. The user is asking in English, so respond only in English.';

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);

    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 429 && error.response.data?.error?.code === 'insufficient_quota') {
        return 'You have exceeded your OpenAI API quota. Please check your plan and billing details.\n\nلقد تجاوزت حصتك من OpenAI API. يرجى التحقق من خطتك وتفاصيل الفوترة.';
      }
    }

    return isArabic(question) 
      ? 'عذراً، واجهت خطأ في معالجة سؤالك.'
      : 'Sorry, I encountered an error processing your question.';
  }
};
