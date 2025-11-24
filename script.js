const visualiser = document.getElementById('visualiser');
const sizeRange = document.getElementById('size-range');
const sizeLabel = document.getElementById('size-label');
const speedRange = document.getElementById('speed-range');
const speedLabel = document.getElementById('speed-label');
const generateBtn = document.getElementById('generate-btn');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const algorithmSelect = document.getElementById('algorithm-select');

let array = [];
let speed = 50;

sizeLabel.textContent = sizeRange.value;
speedLabel.textContent = speedRange.value;

sizeRange.oninput = () => { sizeLabel.textContent = sizeRange.value; };
speedRange.oninput = () => { speedLabel.textContent = speedRange.value; speed = 1000 / speedRange.value; };

function randomArray(n) {
  const arr = [];
  for(let i=0;i<n;i++) arr.push(Math.floor(Math.random()*100)+1);
  return arr;
}

function renderArray(arr) {
  visualiser.innerHTML = '';
  arr.forEach(val => {
    const bar = document.createElement('div');
    bar.classList.add('bar');
    bar.style.height = val + '%';
    visualiser.appendChild(bar);
  });
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function bubbleSort(arr) {
  const bars = document.querySelectorAll('.bar');
  for(let i=0;i<arr.length;i++){
    for(let j=0;j<arr.length-i-1;j++){
      if(arr[j] > arr[j+1]){
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
        renderArray(arr);
        await sleep(speed);
      }
    }
  }
}

generateBtn.onclick = () => {
  array = randomArray(parseInt(sizeRange.value));
  renderArray(array);
};

startBtn.onclick = async () => {
  if(algorithmSelect.value === 'bubble') await bubbleSort(array.slice());
  else alert('Other algorithms not implemented yet');
};

resetBtn.onclick = () => {
  array = randomArray(parseInt(sizeRange.value));
  renderArray(array);
};

// initial render
array = randomArray(parseInt(sizeRange.value));
renderArray(array);
