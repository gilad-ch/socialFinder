export async function translateText(text) {
    try {
      const encodedText = encodeURIComponent(text);
      
      const response = await fetch(`/api/translate/?text=${encodedText}`);
  
      if (!response.ok) {
        throw new Error(`Translation API error: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.translated_text;
    } catch (error) {
      console.error("Translation error:", error);
      return null;
    }
  }
  
