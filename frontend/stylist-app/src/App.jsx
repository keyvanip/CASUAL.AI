import { useState, useEffect, useRef } from "react";
import { RotateCcw, Loader2 } from "lucide-react"; // <-- Add Loader2 spinning icon

export default function App() {
  const [selectedUser, setSelectedUser] = useState("");
  const [messages, setMessages] = useState([{ sender: "assistant", text: getHomeIntroMessage() }]);
  const [input, setInput] = useState("");
  const [outfits, setOutfits] = useState([]);
  const [outfitDescriptions, setOutfitDescriptions] = useState([]);
  const [lockedTop, setLockedTop] = useState(null);
  const [lockedBottom, setLockedBottom] = useState(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]); // also scroll when loading changes

  function getHomeIntroMessage() {
    return `Welcome to Casual.AI — your intelligent personal stylist.

This app helps you effortlessly create stylish outfits tailored to your wardrobe, the weather, and your plans for the day.

To get started, select a wardrobe from the dropdown menu above.`;
  }

  function initialGreeting(name) {
    return `Nice to have you back, ${name.charAt(0).toUpperCase() + name.slice(1)}! What's your plan for today?`;
  }

  async function regenerateOutfits(prompt = lastPrompt || "Give me an outfit") {
    if (!selectedUser) return;
    try {
      setLoading(true);
      const response = await fetch("https://stylist-backend-r6hg.onrender.com/generate-outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          gender: "male",
          color: null,
          lock_top: lockedTop,
          lock_bottom: lockedBottom,
          user: selectedUser,
        }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: `🌤️ Temperature detected in ${data.location} on ${data.forecastDate}: ${data.temperature}\n🎯 Occasion detected: ${data.occasion}` },
        { sender: "assistant", text: data.message || "Here are your outfit options!" },
      ]);
      setOutfits(data.outfits || []);
      setOutfitDescriptions(data.outfitDescriptions || []);
    } catch (err) {
      console.error("Error fetching outfit:", err);
      setMessages((prev) => [...prev, { sender: "assistant", text: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setLastPrompt(input);
    regenerateOutfits(input);
    setInput("");
  }

  function getImageUrl(category, filename) {
    const folderMap = { shirt: "shirts", "t-shirt": "t-shirts", pants: "pants", shorts: "shorts" };
    return `/CASUAL.AI/clothes/${selectedUser}/${folderMap[category] || "misc"}/${filename}`;
  }

  function getBackgroundImage() {
    if (!selectedUser) return "/CASUAL.AI/assets/background_image.png";
    return selectedUser === "parsa"
      ? "/CASUAL.AI/assets/male_background.png"
      : "/CASUAL.AI/assets/female_background.png";
  }

  function toggleLockTop(index) {
    const current = outfits[index][0];
    if (lockedTop && lockedTop.filename === current.filename) {
      setLockedTop(null);
      setMessages((prev) => [...prev, { sender: "assistant", text: `🔓 Unlocked top from Outfit ${index + 1}.` }]);
    } else {
      setLockedTop(current);
      setMessages((prev) => [...prev, { sender: "assistant", text: `🔒 Locked top from Outfit ${index + 1}.` }]);
    }
  }

  function toggleLockBottom(index) {
    const current = outfits[index][1];
    if (lockedBottom && lockedBottom.filename === current.filename) {
      setLockedBottom(null);
      setMessages((prev) => [...prev, { sender: "assistant", text: `🔓 Unlocked bottom from Outfit ${index + 1}.` }]);
    } else {
      setLockedBottom(current);
      setMessages((prev) => [...prev, { sender: "assistant", text: `🔒 Locked bottom from Outfit ${index + 1}.` }]);
    }
  }

  return (
    <div className="h-screen flex flex-col" style={{ fontFamily: "'Source Serif Pro', serif", backgroundColor: "#f7e9da" }}>
      <header className="flex justify-between items-center p-4 border-b border-[#cabfb6]" style={{ backgroundColor: "#faefe2" }}>
        <h1 className="text-4xl text-[#2c211e] tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>CASUAL.AI</h1>
        <div className="flex items-center gap-2 text-[#2c211e] text-xl">
          <span>User:</span>
          <select
            className="border border-[#a89d95] rounded px-2 py-1 bg-white text-xl"
            value={selectedUser}
            onChange={(e) => {
              const user = e.target.value;
              setSelectedUser(user);
              setMessages([{ sender: "assistant", text: user ? initialGreeting(user) : getHomeIntroMessage() }]);
              setInput("");
              setOutfits([]);
              setOutfitDescriptions([]);
              setLockedTop(null);
              setLockedBottom(null);
              setLastPrompt("");
            }}
          >
            <option value="">Select Wardrobe</option>
            <option value="parsa">Parsa's Wardrobe</option>
            <option value="vrunda">Vrunda's Wardrobe</option>
            <option value="hannah">Hannah's Wardrobe</option>
          </select>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 p-6 border-r border-[#e4dbd4] flex flex-col justify-between" style={{ backgroundColor: "#f7e9da" }}>
          <div className="overflow-y-auto pr-2 mb-4">
            <h2 className="text-4xl font-semibold mb-4 text-[#3b2d28]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Chat with your stylist</h2>
            {messages.map((msg, i) => (
              <div key={i} className={`mb-3 px-3 py-2 rounded-lg text-2xl whitespace-pre-wrap ${msg.sender === "assistant" ? "bg-[#faefe2] text-[#3b2d28]" : "bg-[#8b897e] text-white self-end"}`}>{msg.text}</div>
            ))}
            {loading && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-2xl bg-[#faefe2] text-[#3b2d28] mb-3">
                <Loader2 className="animate-spin" size={24} />
                Generating Outfit Matches...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {selectedUser && (
            <form onSubmit={handleSend} className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your stylist..."
                className="flex-1 border border-[#a89d95] px-3 py-2 text-xl text-[#2c211e] rounded-l bg-white"
              />
              <button className="bg-[#3b2d28] text-white px-4 py-2 text-xl rounded-r hover:bg-[#2c211e]">Send</button>
            </form>
          )}
        </div>

        <div className="w-3/4 p-8 overflow-y-auto relative" style={{ backgroundImage: `url('${getBackgroundImage()}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
          {outfits.length > 0 && <h2 className="text-4xl font-semibold text-white mb-8 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Recommended Outfits</h2>}
          <div className="grid grid-cols-3 gap-8 justify-items-center">
            {outfits.map((outfit, index) => (
              <div key={index} className="flex flex-col items-center w-full max-w-[400px] mx-auto">
                <div className="bg-white shadow-md border border-[#e6ded6] rounded-lg px-6 pt-6 pb-10 w-full">
                  {outfit.map((item, idx) => (
                    <img key={idx} src={getImageUrl(item.category, item.filename)} alt={`${item.color} ${item.category}`} className="w-full max-h-[280px] object-contain mb-2" />
                  ))}
                </div>
                <div className="bg-[#3b2d28] text-white rounded-b-lg w-full p-4 text-center">
                  <h3 className="text-xl mb-2">Outfit {index + 1}</h3>
                  <div className="flex justify-center gap-3 mb-3">
                    <button onClick={() => toggleLockTop(index)} className="border border-[#a89d95] text-white px-4 py-1 text-sm rounded hover:bg-[#5b4b44] transition">
                      {lockedTop && lockedTop.filename === outfits[index][0].filename ? "Unlock Top" : "Lock Top"}
                    </button>
                    <button onClick={() => toggleLockBottom(index)} className="border border-[#a89d95] text-white px-4 py-1 text-sm rounded hover:bg-[#5b4b44] transition">
                      {lockedBottom && lockedBottom.filename === outfits[index][1].filename ? "Unlock Bottom" : "Lock Bottom"}
                    </button>
                    <button onClick={() => regenerateOutfits()} className="border border-[#a89d95] text-white p-2 rounded hover:bg-[#5b4b44] transition">
                      <RotateCcw size={18} />
                    </button>
                  </div>
                  <p className="text-lg leading-relaxed max-w-[320px] mx-auto">{outfitDescriptions[index]}</p>
                </div>
              </div>
            ))}
          </div>
          <footer className="absolute bottom-4 center text-m text-white opacity-80">© 2025 Casual.AI. Built and designed by Parsa Keyvani. All rights reserved.</footer>
        </div>
      </div>
    </div>
  );
}