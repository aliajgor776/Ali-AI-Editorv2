const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fileInput = document.getElementById("fileInput");
const fileInput2 = document.getElementById("fileInput2");
const emptyState = document.getElementById("emptyState");
const fileName = document.getElementById("fileName");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

let img = new Image();
let originalSrc = "";
let state = { brightness:100, contrast:100, saturation:100, blur:0, rotate:0, flipX:1, flipY:1 };

function loadFile(file){
  if(!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = e => {
    originalSrc = e.target.result;
    img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      emptyState.style.display = "none";
      canvas.style.display = "block";
      fileName.textContent = `${file.name} · ${img.naturalWidth}×${img.naturalHeight}`;
      downloadBtn.disabled = false;
      resetBtn.disabled = false;
      render();
    };
    img.src = originalSrc;
  };
  reader.readAsDataURL(file);
}

fileInput.addEventListener("change", e => loadFile(e.target.files[0]));
fileInput2.addEventListener("change", e => loadFile(e.target.files[0]));

function render(){
  if(!img.src) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.rotate(state.rotate * Math.PI/180);
  ctx.scale(state.flipX, state.flipY);
  const rotated = Math.abs(state.rotate) % 180 === 90;
  const w = rotated ? canvas.height : canvas.width;
  const h = rotated ? canvas.width : canvas.height;
  ctx.filter = `brightness(${state.brightness}%) contrast(${state.contrast}%) saturate(${state.saturation}%) blur(${state.blur}px)`;
  ctx.drawImage(img, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height);
  ctx.restore();
}

function setAdjustment(key, value){
  state[key] = Number(value);
  document.getElementById(key+"Value").textContent =
    key === "blur" ? `${value}px` : `${value}%`;
  render();
}
["brightness","contrast","saturation","blur"].forEach(id=>{
  document.getElementById(id).addEventListener("input", e=>setAdjustment(id,e.target.value));
});

const presets = {
  original:{brightness:100,contrast:100,saturation:100,blur:0},
  vivid:{brightness:108,contrast:115,saturation:145,blur:0},
  bw:{brightness:105,contrast:115,saturation:0,blur:0},
  warm:{brightness:105,contrast:108,saturation:125,blur:0},
  cool:{brightness:100,contrast:108,saturation:118,blur:0},
  soft:{brightness:108,contrast:92,saturation:92,blur:0}
};
document.querySelectorAll("[data-preset]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const p=presets[btn.dataset.preset];
    Object.assign(state,p);
    syncControls();
    render();
  });
});

function syncControls(){
  ["brightness","contrast","saturation","blur"].forEach(id=>{
    document.getElementById(id).value=state[id];
    document.getElementById(id+"Value").textContent=id==="blur"?`${state[id]}px`:`${state[id]}%`;
  });
}

document.getElementById("rotateLeft").onclick=()=>{state.rotate-=90;render()};
document.getElementById("rotateRight").onclick=()=>{state.rotate+=90;render()};
document.getElementById("flipX").onclick=()=>{state.flipX*=-1;render()};
document.getElementById("flipY").onclick=()=>{state.flipY*=-1;render()};

document.getElementById("enhance").onclick=()=>{
  Object.assign(state,{brightness:108,contrast:112,saturation:118,blur:0});
  syncControls(); render();
};
document.getElementById("portrait").onclick=()=>{
  Object.assign(state,{brightness:106,contrast:108,saturation:112,blur:0.35});
  syncControls(); render();
};

resetBtn.onclick=()=>{
  state={brightness:100,contrast:100,saturation:100,blur:0,rotate:0,flipX:1,flipY:1};
  syncControls(); render();
};

downloadBtn.onclick=()=>{
  if(!img.src) return;
  const a=document.createElement("a");
  a.download="pixelai-edited-photo.png";
  a.href=canvas.toDataURL("image/png");
  a.click();
};
