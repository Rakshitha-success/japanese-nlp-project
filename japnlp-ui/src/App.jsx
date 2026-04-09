import { useState, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Activity, BarChart3, AlertCircle,Volume2 } from "lucide-react";

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const examples = [
    "この映画は最高でした！本当に良い作品です。",
    "最低の経験でした。接客が非常に悪いです。",
    "「このペンは黒色で、インクは半分残っています。」"
  ];

  useEffect(() => {
    if (!text.trim()) {
      setResult(null);
      setError("");
      return;
    }

    const delay = setTimeout(() => {
      analyze(text);
    }, 600);

    return () => clearTimeout(delay);
  }, [text]);

  const speakTranslation = (text) => {
    window.speechSynthesis.cancel(); // Stops any currently playing audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // Forces an English accent
    utterance.rate = 0.9;     // Slightly slower for better pronunciation
    window.speechSynthesis.speak(utterance);
  };
  const speakJapanese = (textToSpeak) => {
    if (!textToSpeak.trim()) return; // Don't try to speak if the box is empty
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "ja-JP"; // <-- This forces the native Japanese voice!
    utterance.rate = 0.9;     
    window.speechSynthesis.speak(utterance);
  };

  const analyze = async (input) => {
    try {
      setLoading(true);
      setError("");
      
      // 1. Send the exact format the FastAPI backend expects
      const res = await axios.post("http://localhost:8000/predict", { 
        text: input,
        model: "bert", 
        use_preprocessing: true
      });

      const apiData = res.data;

      // 2. Format the sentiment text so it matches our colors perfectly
      const rawPrediction = apiData.prediction || "Neutral";
      const formattedSentiment = rawPrediction.charAt(0).toUpperCase() + rawPrediction.slice(1).toLowerCase();

      // 3. Combine her tokens array and pos_tags array for the UI
      let formattedTokens = [];
      if (apiData.tokens && apiData.pos_tags) {
        formattedTokens = apiData.tokens.map((word, index) => ({
          surface: word,
          pos: apiData.pos_tags[index] || "N/A"
        }));
      }
     console.log("BACKEND DATA CHECK:", apiData);
      // 4. Set the result!
      setResult({
        sentiment: formattedSentiment,
        confidence: apiData.confidence,
        tokens: formattedTokens,
        translation: apiData.translation
      });

    } catch (err) {
      console.error(err);
      setError("Failed to connect to the FastAPI model.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // UI Helper Functions
  const getColors = (sentiment) => {
    if (sentiment === "Positive") return { text: "text-emerald-400", bg: "bg-emerald-400", card: "bg-emerald-400/10 border-emerald-500/20" };
    if (sentiment === "Negative") return { text: "text-rose-400", bg: "bg-rose-400", card: "bg-rose-400/10 border-rose-500/20" };
    return { text: "text-amber-400", bg: "bg-amber-400", card: "bg-amber-400/10 border-amber-500/20" };
  };

  const getEmoji = (sentiment) => {
    if (sentiment === "Positive") return "✨🤩✨";
    if (sentiment === "Negative") return "🌧️😔🌧️";
    return "🍃😐🍃"; // Neutral
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-12 selection:bg-indigo-500/30">
      
      <header className="max-w-6xl mx-auto mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
          Gengo Rikai
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Advanced sentiment classification and morphological tokenization  by SudachiPy.
        </p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare size={20} className="text-indigo-400"/>
                Source Text
              </h2>
              
              <button
                onClick={() => speakJapanese(text)}
                disabled={!text.trim()}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                title="Listen to Japanese"
              >
                <Volume2 size={16} />
                Listen
              </button>
            </div>
            
            <textarea
              className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none text-lg leading-relaxed"
              placeholder="日本語のテキストを入力してください..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            
            <div className="mt-6">
              <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-3">Test Examples</p>
              <div className="flex flex-col gap-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setText(ex)}
                    className="text-left text-sm text-slate-400 bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-3 rounded-lg transition-colors truncate"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div> 



        {/* Right Output Section */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl min-h-[500px] flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Activity size={20} className="text-indigo-400"/>
              Real-time Inference
            </h2>

            {!result && !loading && !error && (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-500 space-y-4">
                <BarChart3 size={48} className="opacity-20" />
                <p>Waiting for text input to begin analysis...</p>
              </div>
            )}

            {loading && (
              <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-indigo-400 font-medium animate-pulse">Running BERT Inference...</p>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 text-rose-400 items-start">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <div className={`p-6 rounded-2xl border ${getColors(result.sentiment).card} flex flex-col md:flex-row md:items-center justify-between gap-6`}>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl md:text-6xl animate-bounce drop-shadow-lg cursor-default select-none">
                      {getEmoji(result.sentiment)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Sentiment</p>
                      <p className={`text-4xl font-black ${getColors(result.sentiment).text}`}>
                        {result.sentiment}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-grow max-w-xs w-full">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-slate-400">Confidence Score</span>
                      <span className="text-white">{(result.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getColors(result.sentiment).bg}`}
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 flex justify-between items-center gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1">
                      English Translation
                    </h3>
                    <p className="text-lg text-slate-200 font-medium">
                      {result.translation}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => speakTranslation(result.translation)}
                    className="p-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-full transition-colors shrink-0 shadow-sm"
                    title="Listen to Translation"
                  >
                    <Volume2 size={24} />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-4">
                    Morphological Tokenization
                  </h3>
                  
                  <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
                    {result.tokens && result.tokens.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {result.tokens.map((token, i) => (
                          <div key={i} className="group relative flex items-center bg-slate-900 border border-slate-700 hover:border-indigo-500/50 rounded-lg overflow-hidden transition-all cursor-default shadow-sm">
                            <span className="px-3 py-1.5 text-slate-200 font-medium text-sm">
                              {token.surface}
                            </span>
                            <span className="px-2.5 py-1.5 bg-slate-800 text-slate-400 text-xs border-l border-slate-700 font-mono">
                              {token.pos}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm text-center py-4">No tokens extracted.</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
