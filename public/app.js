const badge = document.getElementById("detectBadge")
const micBtn = document.getElementById("micBtn")
const text = document.getElementById("text")
const translateBtn = document.getElementById("translateBtn")
const output = document.getElementById("output")
const lang = document.getElementById("lang")
const swapBtn = document.getElementById("swapBtn")
const bars = document.getElementById("bars")
const historyBox = document.getElementById("history")
const micWave = document.getElementById("micWave")

let recognition
let voices = []

/* ===== LOAD VOICES ===== */

speechSynthesis.onvoiceschanged = ()=>{
voices = speechSynthesis.getVoices()
}

/* ===== SPEECH RECOGNITION ===== */

if ('webkitSpeechRecognition' in window){

recognition = new webkitSpeechRecognition()
recognition.continuous = false
recognition.interimResults = true
recognition.lang = "en-US"

micBtn.onclick = ()=>{
micBtn.classList.add("active")
bars.classList.add("active")
micWave.classList.add("active")
recognition.start()
}

recognition.onresult = (e)=>{
let transcript = ""
for(let i=0;i<e.results.length;i++){
transcript += e.results[i][0].transcript
}
text.value = transcript
}

recognition.onend = ()=>{
micBtn.classList.remove("active")
bars.classList.remove("active")
micWave.classList.remove("active")
}

}

/* ===== SMART LANGUAGE SWAP ===== */

swapBtn.onclick = ()=>{

if(lang.value === "hi"){
lang.value = "en"
recognition.lang = "hi-IN"
}else{
lang.value = "hi"
recognition.lang = "en-US"
}

}

/* ===== AUTO LIVE TRANSLATE ===== */

let timer

text.addEventListener("input", ()=>{
clearTimeout(timer)
timer = setTimeout(()=>{
translateNow()
},700)
})

translateBtn.onclick = ()=> translateNow()

/* ===== MAIN TRANSLATE ===== */

async function translateNow(){

let msg = text.value.trim()
if(!msg) return

let originalMsg = msg

addUserBubble(originalMsg)

/* ⭐ detecting badge ON */
if(badge) badge.classList.add("active")

let res = await fetch("/translate",{
method:"POST",
headers:{'Content-Type':'application/json'},
body:JSON.stringify({
text: originalMsg,
target: lang.value
})
})

let data = await res.json()
let translated = data.translated || "Translation failed"

/* ⭐ detecting badge OFF */
if(badge) badge.classList.remove("active")

typeAI(originalMsg , translated)

text.value = ""

}

/* ===== USER BUBBLE ===== */

function addUserBubble(msg){

let b = document.createElement("div")
b.className="bubble userBubble"
b.innerText = msg

output.appendChild(b)
scrollBottom()

}

/* ===== ⭐ NEW AI THINKING + TYPING BUBBLE ===== */

function typeAI(original , translated){

/* thinking dots */

let thinking = document.createElement("div")
thinking.className="thinking"
thinking.innerHTML =
'<div class="dot"></div><div class="dot"></div><div class="dot"></div>'

output.appendChild(thinking)
scrollBottom()

setTimeout(()=>{

thinking.remove()

let b = document.createElement("div")
b.className="bubble aiBubble"
output.appendChild(b)

let i=0

let typing = setInterval(()=>{

b.innerText += translated.charAt(i)
i++

scrollBottom()

if(i>=translated.length){

clearInterval(typing)

/* ⭐ speaking pulse animation */

b.classList.add("speaking")

speak(translated)
saveHistory(original , translated)

setTimeout(()=>{
b.classList.remove("speaking")
},2000)

}

},18)

},900)

}

/* ===== SCROLL FIX ===== */

function scrollBottom(){
output.scrollTop = output.scrollHeight
}

/* ===== VOICE ENGINE ===== */

function speak(t){

let u = new SpeechSynthesisUtterance(t)

let v = voices.find(x =>
x.lang.toLowerCase().includes(lang.value.toLowerCase())
)

if(v) u.voice = v

u.rate = .95
speechSynthesis.cancel()
speechSynthesis.speak(u)

}

/* ===== HISTORY ===== */

function saveHistory(original , translated){

if(!historyBox) return

let item = document.createElement("div")
item.innerText = original + "  →  " + translated

historyBox.prepend(item)

}

/* ===== PREMIUM GLOW CURSOR ===== */

const cursor = document.createElement("div")
cursor.classList.add("glowCursor")
document.body.appendChild(cursor)

document.addEventListener("mousemove",(e)=>{
cursor.style.left = e.clientX - 14 + "px"
cursor.style.top = e.clientY - 14 + "px"
})

/* ⭐ EXPORT CHAT IMAGE */

document.getElementById("exportBtn").onclick = async ()=>{

let btn = document.getElementById("exportBtn")
btn.classList.add("loading")

const canvas = await html2canvas(output)

const ctx = canvas.getContext("2d")

/* ⭐ gradient watermark */

let gradient = ctx.createLinearGradient(0,0,canvas.width,0)
gradient.addColorStop(0,"#3b82f6")
gradient.addColorStop(1,"#8b5cf6")

ctx.font = "28px Inter"
ctx.fillStyle = gradient
ctx.globalAlpha = .18
ctx.fillText("AI Voice Translator", 30, canvas.height - 40)

let link = document.createElement("a")
link.download = "translation.png"
link.href = canvas.toDataURL()
link.click()

setTimeout(()=>{
btn.classList.remove("loading")
},1200)

}