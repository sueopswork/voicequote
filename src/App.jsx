import { useState, useEffect, useRef, useCallback } from 'react';
import {
Mic,
Square,
Send,
Share2,
Download,
RotateCcw,
Keyboard,
AlertCircle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// jsPDF is loaded as an npm package.
// Install with: npm install jspdf
// ─────────────────────────────────────────────────────────────────────────────
import { jsPDF } from 'jspdf';

// ─────────────────────────────────────────────────────────────────────────────
// UK Trades Estimator — pure rule-based engine (no external API required)
// ─────────────────────────────────────────────────────────────────────────────
const runTradeEstimator = (speechText) => {
const lowerText = speechText.toLowerCase();
let client = 'Valued Customer';
let job = 'General Trade Works';
let items = [];
let notes =
'Estimates are prepared based on standard UK trades rates and initial verbal brief. Subject to final on-site assessment.';

// Simple name extraction — e.g. "for Mr Smith", "for Sarah", "client Dave"
const namePatterns = [
/for\s+(mr\s+[a-z]+|mrs\s+[a-z]+|miss\s+[a-z]+|[a-z]+)/i,
/client\s+([a-z]+(\s+[a-z]+)?)/i,
/customer\s+([a-z]+(\s+[a-z]+)?)/i,
];
for (const pattern of namePatterns) {
const match = lowerText.match(pattern);
if (match && match[1]) {
client = match[1].replace(/\b\w/g, (l) => l.toUpperCase());
break;
}
}

// Keyword matchers for UK Trades estimation
if (
lowerText.includes('leak') ||
lowerText.includes('plumb') ||
lowerText.includes('tap') ||
lowerText.includes('toilet') ||
lowerText.includes('pipe') ||
lowerText.includes('radiator') ||
lowerText.includes('sink')
) {
job = 'Emergency Plumbing & Repair';
items = [
{ description: 'Emergency call-out fee & system evaluation', cost: 85.0 },
{ description: 'Plumbing repair work & seal replacement', cost: 115.0 },
{ description: 'Premium pipework fittings and consumables', cost: 35.5 },
];
notes =
'Standard plumbing callout rates applied. Work includes a 12-month guarantee on fitted seals.';
} else if (
lowerText.includes('paint') ||
lowerText.includes('decorat') ||
lowerText.includes('wallpaper') ||
lowerText.includes('wall') ||
lowerText.includes('ceiling')
) {
job = 'Interior Decorating & Prep';
items = [
{ description: 'Surface preparation, minor plaster patching & sanding', cost: 120.0 },
{ description: 'Two coats of trade-grade emulsion paint', cost: 180.0 },
{ description: "Painter's sundries, masking tape & floor protection sheet", cost: 45.0 },
];
notes =
'Assumes normal ceiling height. Customer to choose preferred paint brand and colour range.';
} else if (
lowerText.includes('socket') ||
lowerText.includes('wire') ||
lowerText.includes('light') ||
lowerText.includes('electrical') ||
lowerText.includes('switch') ||
lowerText.includes('fuse')
) {
job = 'Electrical Inspection & Fitting';
items = [
{ description: 'Electrical safety testing & isolation safety protocols', cost: 75.0 },
{ description: 'Installation of replacement fixtures & connection rewiring', cost: 130.0 },
{ description: 'High-grade replacement electrical accessories', cost: 40.0 },
];
notes =
'Part P registered work standard. Electrical installation certificate to be issued upon completion.';
} else if (
lowerText.includes('tile') ||
lowerText.includes('tiling') ||
lowerText.includes('grout') ||
lowerText.includes('splashback')
) {
job = 'Wall & Floor Tiling Services';
items = [
{ description: 'Base cleaning, primer application & grid mapping', cost: 140.0 },
{ description: 'Precision tile-cutting and expert placement standard', cost: 240.0 },
{ description: 'Waterproof tile adhesive, grout & corner silicone', cost: 75.0 },
];
notes =
'Does not include cost of tiles. Please ensure correct square footage with 10% waste contingency.';
} else if (
lowerText.includes('door') ||
lowerText.includes('lock') ||
lowerText.includes('shelf') ||
lowerText.includes('carpentry') ||
lowerText.includes('wood')
) {
job = 'Carpentry & Maintenance Works';
items = [
{ description: 'Professional carpentry labor & timber trim shaping', cost: 110.0 },
{ description: 'Mounting brackets, heavy duty rawlplugs & fasteners', cost: 35.0 },
{ description: 'Premium grade structural adhesive & timber elements', cost: 45.0 },
];
notes = 'Materials match existing wood grains wherever possible.';
} else {
const extractedSubject =
speechText.length > 5
? `Work request: "${speechText.slice(0, 35)}..."`
: 'Trade Handyman Assistance';
job = 'General Handyman Maintenance';
items = [
{ description: `Assessment & manual labor for: ${extractedSubject}`, cost: 125.0 },
{ description: 'Standard trade hardware materials & basic fixing kit', cost: 45.0 },
];
notes =
'Standard multi-trade maintenance package. Tailored estimation provided upon closer on-site evaluation.';
}

const total = items.reduce((acc, item) => acc + item.cost, 0);
return { client, job, items, total, notes };
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF generation — uses the jspdf npm package
// ─────────────────────────────────────────────────────────────────────────────
const generatePDFDocument = (quote) => {
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

doc.setFont('Helvetica', 'bold');
doc.setFontSize(22);
doc.setTextColor(7, 94, 84);
doc.text('VOICEQUOTE UK', 20, 25);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10);
doc.setTextColor(100, 100, 100);
doc.text('Professional Instant Trade Estimation Service', 20, 31);

doc.setDrawColor(18, 140, 126);
doc.setLineWidth(1);
doc.line(20, 35, 190, 35);

doc.setFont('Helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(40, 40, 40);
doc.text('CLIENT ESTIMATE SHEET', 20, 47);

doc.setFont('Helvetica', 'normal');
doc.setFontSize(10);
doc.text(`Estimated Client: ${quote.client}`, 20, 54);
doc.text(`Primary Job: ${quote.job}`, 20, 60);
doc.text(`Estimation Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 66);

doc.setDrawColor(220, 220, 220);
doc.setLineWidth(0.3);
doc.line(20, 74, 190, 74);

doc.setFont('Helvetica', 'bold');
doc.text('Service Itemization / Description', 22, 80);
doc.text('Cost (GBP)', 160, 80);
doc.line(20, 83, 190, 83);

doc.setFont('Helvetica', 'normal');
let currentY = 90;
quote.items.forEach((item) => {
doc.text(item.description, 22, currentY);
doc.text(`£${item.cost.toFixed(2)}`, 160, currentY);
currentY += 8;
});

doc.line(20, currentY, 190, currentY);
currentY += 8;

doc.setFont('Helvetica', 'bold');
doc.setFontSize(11);
doc.text('Estimated Total Outline:', 110, currentY);
doc.setFontSize(12);
doc.setTextColor(7, 94, 84);
doc.text(`£${quote.total.toFixed(2)}`, 160, currentY);

currentY += 20;
doc.setDrawColor(230, 230, 230);
doc.rect(20, currentY, 170, 32);
doc.setFont('Helvetica', 'bold');
doc.setFontSize(9);
doc.setTextColor(80, 80, 80);
doc.text('Terms & Estimating Conditions:', 24, currentY + 6);
doc.setFont('Helvetica', 'normal');
doc.setFontSize(8);
doc.setTextColor(110, 110, 110);
const notesLines = doc.splitTextToSize(quote.notes, 160);
doc.text(notesLines, 24, currentY + 12);
doc.text('1. All costs assume normal working conditions and standards.', 24, currentY + 20);
doc.text('2. Formal quotation will supersede this automatic speech estimate.', 24, currentY + 24);

doc.save(`VoiceQuote_Estimate_${quote.client.replace(/\s+/g, '_')}.pdf`);
};

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp share helper
// ─────────────────────────────────────────────────────────────────────────────
const buildWhatsAppURL = (quoteData) => {
const itemsString = quoteData.items
.map((i) => `• _${i.description}_: *£${i.cost.toFixed(2)}*`)
.join('\n');

const rawText =
`*VOICEQUOTE ESTIMATE*\n` +
`-----------------------------------\n` +
`*Client:* ${quoteData.client}\n` +
`*Job Type:* ${quoteData.job}\n\n` +
`*Breakdown:*\n${itemsString}\n\n` +
`*Total Estimated Cost:* *£${quoteData.total.toFixed(2)}*\n` +
`-----------------------------------\n` +
`*Notes:* ${quoteData.notes}\n\n` +
`_Prepared using VoiceQuote App_`;

return `https://api.whatsapp.com/send?text=${encodeURIComponent(rawText)}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main App Component
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
const [isRecording, setIsRecording] = useState(false);
const [transcript, setTranscript] = useState('');
const [manualText, setManualText] = useState('');
const [quote, setQuote] = useState(null);
const [isGenerating, setIsGenerating] = useState(false);
const [errorMessage, setErrorMessage] = useState('');
const [showTextInput, setShowTextInput] = useState(false);

// Store the SpeechRecognition instance in a ref so it is never stale
const recognitionRef = useRef(null);

// ── Process recognised / typed text ──────────────────────────────────────
const processText = useCallback((text) => {
setIsGenerating(true);
setTimeout(() => {
setQuote(runTradeEstimator(text));
setIsGenerating(false);
}, 900);
}, []);

// ── Initialise Web Speech API ─────────────────────────────────────────────
useEffect(() => {
const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
setErrorMessage(
"Built-in Speech Recognition isn't supported by this browser. Type your work below instead."
);
setShowTextInput(true);
return;
}

const rec = new SpeechRecognition();
rec.continuous = false;
rec.interimResults = false;
rec.lang = 'en-GB';

rec.onstart = () => {
setIsRecording(true);
setErrorMessage('');
};

rec.onresult = (event) => {
const resultText = event.results[0][0].transcript;
setTranscript(resultText);
processText(resultText);
};

rec.onerror = (event) => {
console.error('Speech recognition error', event.error);
setErrorMessage(
`Recognition issue: ${event.error}. Feel free to type below instead.`
);
setIsRecording(false);
};

rec.onend = () => setIsRecording(false);

recognitionRef.current = rec;
}, [processText]);

// ── Mic controls ──────────────────────────────────────────────────────────
const startListening = () => {
if (!recognitionRef.current) {
setErrorMessage('Speech detection unavailable. Please type your requirements below.');
return;
}
try {
recognitionRef.current.start();
} catch {
recognitionRef.current.stop();
}
};

const stopListening = () => recognitionRef.current?.stop();

// ── Manual text submit ────────────────────────────────────────────────────
const handleManualSubmit = (e) => {
e.preventDefault();
if (!manualText.trim()) return;
setTranscript(manualText);
setIsGenerating(true);
setTimeout(() => {
setQuote(runTradeEstimator(manualText));
setIsGenerating(false);
setManualText('');
}, 700);
};

// ── Reset ─────────────────────────────────────────────────────────────────
const resetQuote = () => {
setQuote(null);
setTranscript('');
setErrorMessage('');
};

// ── PDF download ──────────────────────────────────────────────────────────
const handleGeneratePDF = () => {
if (!quote) return;
try {
generatePDFDocument(quote);
} catch (err) {
console.error('Could not generate PDF', err);
alert('An issue occurred compiling the PDF document. Please verify your connection.');
}
};

// ── WhatsApp share ────────────────────────────────────────────────────────
const shareOnWhatsApp = () => {
if (!quote) return;
window.open(buildWhatsAppURL(quote), '_blank');
};

// ─────────────────────────────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────────────────────────────
return (
/* Outer page wrapper — dark background, centres the phone card */
<div className="flex items-center justify-center min-h-screen bg-red-500">

{/* Phone / chat card */}
<div className="w-full max-w-md bg-[#efeae2] shadow-2xl rounded-none md:rounded-2xl overflow-hidden flex flex-col h-screen md:h-[840px] border border-gray-800 relative">

{/* ── Status bar ───────────────────────────────────────────────── */}
<div className="bg-[#054c44] text-white px-4 py-1.5 flex justify-between items-center text-xs select-none">
<div className="flex items-center space-x-1.5">
<span className="font-medium">12:45</span>
<span className="text-[10px] bg-white/20 px-1 rounded">5G</span>
</div>
<div className="text-[11px] font-semibold opacity-90">VOICEQUOTE MOBILE ENGINE</div>
<div className="flex items-center space-x-1">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
<span className="text-[10px] opacity-80">Online</span>
</div>
</div>

{/* ── App header ───────────────────────────────────────────────── */}
<div className="bg-[#128C7E] text-white px-4 py-3 shadow-md flex items-center justify-between z-10">
<div className="flex items-center space-x-3">
<div className="relative">
<div className="w-10 h-10 bg-[#075E54] rounded-full flex items-center justify-center font-bold text-white text-base border border-emerald-400 shadow-inner">
VQ
</div>
<span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#25D366] ring-2 ring-[#128C7E]" />
</div>
<div>
<h1 className="font-semibold text-base leading-tight">VoiceQuote Assistant</h1>
<p className="text-xs text-emerald-200">Instant UK Trades Estimator</p>
</div>
</div>

{quote && (
<button
onClick={resetQuote}
className="text-xs bg-[#0b544b] hover:bg-[#083d37] px-3 py-1.5 rounded-full font-medium transition-colors text-emerald-100 flex items-center gap-1"
>
<RotateCcw className="w-3 h-3" />
Clear
</button>
)}
</div>

{/* ── Chat scroll area ─────────────────────────────────────────── */}
<div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 flex flex-col justify-start">

{/* Welcome bubble */}
<div className="max-w-[85%] bg-white rounded-lg rounded-tl-none p-3.5 shadow-sm text-gray-800 text-sm border-l-4 border-[#128C7E] relative self-start">
<p className="font-semibold text-[#128C7E] text-[13px] mb-1">Automatic System Instruction</p>
<p className="leading-relaxed">
Hello! Tap the microphone below or switch to keyboard input to describe the task in standard spoken terms.
</p>
<p className="mt-2 font-medium text-gray-600 text-xs">
Example:{' '}
<span className="italic">"Fix a leaky kitchen basin for Mrs Miller"</span>
{' '}or{' '}
<span className="italic">"Paint the walls in my guest bedroom for Dave"</span>
</p>
{/* Chat tail */}
<span className="absolute top-0 -left-2 text-white overflow-hidden">
<svg className="w-2 h-2" viewBox="0 0 8 8">
<path d="M0,0 L8,0 L8,8 Z" fill="#ffffff" />
</svg>
</span>
<span className="block text-[9px] text-gray-400 text-right mt-1.5">12:45 PM</span>
</div>

{/* User transcript bubble */}
{transcript && (
<div className="max-w-[85%] bg-[#e1ffc7] rounded-lg rounded-tr-none p-3.5 shadow-sm text-gray-800 text-sm relative self-end border-r-4 border-[#25D366]">
<p className="font-semibold text-[#128C7E] text-[13px] mb-1">You Spoke / Entered:</p>
<p className="italic text-gray-800 leading-relaxed">"{transcript}"</p>
<span className="absolute top-0 -right-2 overflow-hidden">
<svg className="w-2 h-2" viewBox="0 0 8 8">
<path d="M8,0 L0,0 L0,8 Z" fill="#e1ffc7" />
</svg>
</span>
<span className="block text-[9px] text-gray-500 text-right mt-1.5">Just now</span>
</div>
)}

{/* Typing / calculating indicator */}
{isGenerating && (
<div className="max-w-[85%] bg-white rounded-lg rounded-tl-none p-4 shadow-sm text-gray-700 text-sm self-start flex items-center space-x-3">
<div className="flex space-x-1">
<div className="w-2.5 h-2.5 bg-[#128C7E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
<div className="w-2.5 h-2.5 bg-[#128C7E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
<div className="w-2.5 h-2.5 bg-[#128C7E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
</div>
<span className="font-medium text-xs text-gray-500">Calculating cost framework...</span>
</div>
)}

{/* Quote result bubble */}
{quote && (
<div className="max-w-[90%] bg-white rounded-lg rounded-tl-none p-4 shadow-md text-gray-800 text-sm relative self-start border-l-4 border-[#25D366] animate-fade-in-up">
<div className="flex items-center justify-between border-b pb-2 mb-3">
<div>
<h3 className="font-bold text-[#128C7E] text-base">{quote.job}</h3>
<p className="text-xs text-gray-500">
Client: <span className="font-semibold text-gray-700">{quote.client}</span>
</p>
</div>
<span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
Estimate Ready
</span>
</div>

<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
Itemized Trade Costing:
</p>

<div className="space-y-2 mb-4">
{quote.items.map((item, index) => (
<div key={index} className="flex justify-between items-start gap-3 bg-gray-50 p-2 rounded">
<span className="text-xs text-gray-700 font-medium leading-relaxed">{item.description}</span>
<span className="text-xs font-bold text-gray-900 whitespace-nowrap">£{item.cost.toFixed(2)}</span>
</div>
))}
</div>

{/* Total */}
<div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-3">
<span className="text-sm font-bold text-[#128C7E]">Estimated Total:</span>
<span className="text-lg font-black text-[#075E54]">£{quote.total.toFixed(2)}</span>
</div>

{/* Notes */}
<div className="bg-amber-50 p-2.5 rounded border border-amber-100 text-[11px] text-amber-800 leading-relaxed mb-1.5">
<strong>Standard Advice:</strong> {quote.notes}
</div>

{/* Chat tail */}
<span className="absolute top-0 -left-2 overflow-hidden">
<svg className="w-2 h-2" viewBox="0 0 8 8">
<path d="M0,0 L8,0 L8,8 Z" fill="#ffffff" />
</svg>
</span>
<span className="block text-[9px] text-gray-400 text-right mt-2">Estimated automatically</span>
</div>
)}
</div>

{/* ── Error banner ─────────────────────────────────────────────── */}
{errorMessage && (
<div className="mx-4 mb-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs flex items-center gap-2">
<AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
<span>{errorMessage}</span>
</div>
)}

{/* ── Footer / action drawer ────────────────────────────────────── */}
<div className="bg-[#f0f2f5] border-t border-gray-200 p-4 flex flex-col items-center space-y-4">

{/* Input mode toggle */}
<div className="w-full flex justify-between items-center text-xs text-gray-500 px-1">
<span>Speech Input Mode</span>
<button
onClick={() => setShowTextInput((v) => !v)}
className="text-[#128C7E] font-semibold hover:underline flex items-center gap-1"
>
<Keyboard className="w-3.5 h-3.5" />
{showTextInput ? 'Hide manual text box' : 'Switch to keyboard input'}
</button>
</div>

{/* Manual text input */}
{showTextInput && (
<form
onSubmit={handleManualSubmit}
className="w-full flex gap-2 items-center bg-white p-1 rounded-full shadow-inner border border-gray-200"
>
<input
type="text"
value={manualText}
onChange={(e) => setManualText(e.target.value)}
placeholder="E.g., Fix tap leak for Mr Thomas"
className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none text-gray-700"
/>
<button
type="submit"
disabled={!manualText.trim()}
className="bg-[#128C7E] text-white p-2 rounded-full hover:bg-[#075E54] transition-all disabled:opacity-40 shrink-0"
>
<Send className="w-4 h-4" />
</button>
</form>
)}

{/* Quote actions OR mic panel */}
{quote ? (
<div className="grid grid-cols-2 gap-3 w-full">
<button
onClick={shareOnWhatsApp}
className="bg-[#25D366] hover:bg-[#1ebe57] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all uppercase tracking-wider"
>
<Share2 className="w-4 h-4" />
Send via WhatsApp
</button>
<button
onClick={handleGeneratePDF}
className="bg-[#128C7E] hover:bg-[#075E54] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all uppercase tracking-wider"
>
<Download className="w-4 h-4" />
Download PDF
</button>
</div>
) : (
<div className="flex flex-col items-center justify-center py-2 w-full">
{isRecording ? (
<div className="flex flex-col items-center space-y-3">
{/* Waveform visualiser */}
<div className="flex items-end justify-center gap-1.5 h-8">
<span className="w-1 bg-[#25D366] h-3 animate-bounce" style={{ animationDelay: '0.1s' }} />
<span className="w-1 bg-[#25D366] h-6 animate-bounce" style={{ animationDelay: '0.3s' }} />
<span className="w-1 bg-[#25D366] h-4 animate-bounce" style={{ animationDelay: '0.5s' }} />
<span className="w-1 bg-[#25D366] h-7 animate-bounce" style={{ animationDelay: '0.2s' }} />
<span className="w-1 bg-[#25D366] h-3 animate-bounce" style={{ animationDelay: '0.4s' }} />
</div>

<button
onClick={stopListening}
className="w-18 h-18 bg-red-500 hover:bg-red-600 rounded-full p-5 flex items-center justify-center text-white shadow-xl transition-all scale-105 active:scale-95 relative"
>
<span className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring" />
<Square className="w-8 h-8 relative z-10" />
</button>

<span className="text-xs font-semibold text-red-500 tracking-wide animate-pulse">
Listening to details... Tap to Finish
</span>
</div>
) : (
<div className="flex flex-col items-center space-y-3">
<button
onClick={startListening}
className="w-20 h-20 bg-[#25D366] hover:bg-[#20ba5a] rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-105 active:scale-95"
>
<Mic className="w-10 h-10" />
</button>
<span className="text-xs font-bold text-gray-600 tracking-wide uppercase">
Tap Mic to Describe Job
</span>
</div>
)}
</div>
)}

<div className="text-[10px] text-gray-400 text-center">
Instant speech translation. Highly optimized for UK Trade Operators.
</div>
</div>

</div>
</div>
);
}

