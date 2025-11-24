const visualiser = document.getElementById('visualiser');
const sizeRange = document.getElementById('size-range');
const sizeLabel = document.getElementById('size-label');
const speedRange = document.getElementById('speed-range');
const speedLabel = document.getElementById('speed-label');
const generateBtn = document.getElementById('generate-btn');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const algorithmSelect = document.getElementById('algorithm-select');

let array = [];
let bars = [];
let running = false;
let paused = false;
let sleepMs = 50;
let opQueue = [];

sizeLabel.textContent = sizeRange.value;
speedLabel.textContent = speedRange.value;

sizeRange.oninput = () => { sizeLabel.textContent = sizeRange.value; };
speedRange.oninput = () => { speedLabel.textContent = speedRange.value; sleepMs = 1000 / speedRange.value; };

function randomArray(n){
  const arr = [];
  for(let i=0;i<n;i++) arr.push(Math.floor(Math.random()*100)+1);
  return arr;
}

function renderArray(arr){
  visualiser.innerHTML = '';
  bars = [];
  const max = Math.max(...arr);
  arr.forEach((v)=>{
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.flex = (1/arr.length);
    const inner = document.createElement('div');
    inner.className = 'bar-inner';
    inner.style.height = `${(v/max)*100}%`;
    bar.appendChild(inner);
    visualiser.appendChild(bar);
    bars.push({el:inner, value:v});
  });
}

function swap(arr,i,j){
  const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
}

function bubbleSortSteps(arr){
  const a = arr.slice();
  const n = a.length;
  for(let i=0;i<n;i++){
    for(let j=0;j<n-i-1;j++){
      opQueue.push({type:'compare', indices:[j,j+1]});
      if(a[j]>a[j+1]){
        opQueue.push({type:'swap', indices:[j,j+1]});
        swap(a,j,j+1);
      }
    }
    opQueue.push({type:'markSorted', indices:[n-i-1]});
  }
}

function insertionSortSteps(arr){
  const a = arr.slice();
  for(let i=1;i<a.length;i++){
    let j=i;
    while(j>0){
      opQueue.push({type:'compare', indices:[j-1,j]});
      if(a[j-1]>a[j]){
        opQueue.push({type:'swap', indices:[j-1,j]});
        swap(a,j-1,j);
      } else break;
      j--;
    }
  }
  for(let k=0;k<a.length;k++) opQueue.push({type:'markSorted', indices:[k]});
}

function selectionSortSteps(arr){
  const a=arr.slice();
  for(let i=0;i<a.length;i++){
    let min=i;
    for(let j=i+1;j<a.length;j++){
      opQueue.push({type:'compare', indices:[min,j]});
      if(a[j]<a[min]) min=j;
    }
    if(min!==i){
      opQueue.push({type:'swap', indices:[i,min]});
      swap(a,i,min);
    }
    opQueue.push({type:'markSorted', indices:[i]});
  }
}

function mergeSortSteps(arr){
  const a = arr.slice();
  function merge(l,r){
    if(r-l<=1) return;
    const m=Math.floor((l+r)/2);
    merge(l,m); merge(m,r);
    const left=a.slice(l,m);
    const right=a.slice(m,r);
    let i=l, li=0, ri=0;
    while(li<left.length || ri<right.length){
      if(ri>=right.length || (li<left.length && left[li]<=right[ri])){
        opQueue.push({type:'set', indices:[i], value:left[li]});
        a[i++] = left[li++];
      } else {
        opQueue.push({type:'set', indices:[i], value:right[ri]});
        a[i++] = right[ri++];
      }
    }
  }
  merge(0,a.length);
  for(let k=0;k<a.length;k++) opQueue.push({type:'markSorted', indices:[k]});
}

function quickSortSteps(arr){
  const a=arr.slice();
  function qs(l,r){
    if(l>=r) return;
    const pivot = a[Math.floor((l+r)/2)];
    opQueue.push({type:'pivot', indices:[Math.floor((l+r)/2)]});
    let i=l, j=r;
    while(i<=j){
      while(a[i]<pivot){ opQueue.push({type:'compare', indices:[i]}); i++; }
      while(a[j]>pivot){ opQueue.push({type:'compare', indices:[j]}); j--; }
      if(i<=j){
        opQueue.push({type:'compare', indices:[i,j]});
        opQueue.push({type:'swap', indices:[i,j]});
        swap(a,i,j);
        i++; j--;
      }
    }
    if(l<j) qs(l,j);
    if(i<r) qs(i,r);
  }
  qs(0,a.length-1);
  for(let k=0;k<a.length;k++) opQueue.push({type:'markSorted', indices:[k]});
}

async function runAnimation(){
  running = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  generateBtn.disabled = true;
  resetBtn.disabled = true;
  const max = Math.max(...array);

  while(opQueue.length && running){
    if(paused){ await sleep(50); continue; }
    const op = opQueue.shift();
    bars.forEach(b => { b.el.style.boxShadow = ''; });
    if(op.type==='compare'){
      const [i,j] = op.indices;
      if(j!==undefined){
        bars[i].el.style.boxShadow = '0 0 0 3px rgba(96,165,250,0.12)';
        bars[j].el.style.boxShadow = '0 0 0 3px rgba(96,165,250,0.12)';
      } else {
        bars[i].el.style.boxShadow = '0 0 0 3px rgba(96,165,250,0.12)';
      }
    } else if(op.type==='swap'){
      const [i,j] = op.indices;
      const vi = bars[i].value, vj = bars[j].value;
      bars[i].value = vj; bars[j].value = vi;
      bars[i].el.style.height = `${(bars[i].value/max)*100}%`;
      bars[j].el.style.height = `${(bars[j].value/max)*100}%`;
    } else if(op.type==='set'){
      const idx = op.indices[0];
      bars[idx].value = op.value;
      bars[idx].el.style.height = `${(op.value/max)*100}%`;
    } else if(op.type==='pivot'){
      const i = op.indices[0];
      bars[i].el.style.boxShadow = '0 0 0 4px rgba(249,115,22,0.18)';
    } else if(op.type==='markSorted'){
      const i = op.indices[0];
      bars[i].el.style.boxShadow = '0 0 0 4px rgba(34,197,94,0.18)';
    }
    await sleep(sleepMs);
  }

  running = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  generateBtn.disabled = false;
  resetBtn.disabled = false;
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

generateBtn.onclick = ()=>{
  array = randomArray(parseInt(sizeRange.value,10));
  renderArray(array);
  opQueue = [];
};

startBtn.onclick = ()=>{
  if(running) return;
  opQueue = [];
  const algo = algorithmSelect.value;
  if(algo==='bubble') bubbleSortSteps(array);
  else if(algo==='insertion') insertionSortSteps(array);
  else if(algo==='selection') selectionSortSteps(array);
  else if(algo==='merge') mergeSortSteps(array);
  else if(algo==='quick') quickSortSteps(array);
  runAnimation();
};

pauseBtn.onclick = ()=>{ paused = !paused; pauseBtn.textContent = paused ? 'Resume' : 'Pause'; };
resetBtn.onclick = ()=>{
  if(running) return;
  array = randomArray(parseInt(sizeRange.value,10));
  renderArray(array);
};

array = randomArray(parseInt(sizeRange.value,10));
renderArray(array);
