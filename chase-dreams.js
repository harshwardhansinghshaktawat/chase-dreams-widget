class ChaseDreams extends HTMLElement {
 constructor() {
 super();
 this.attachShadow({ mode: 'open' });
 }

 static get observedAttributes() {
 return [
 'text', 'heading-tag', 'font-size', 'font-family', 'font-color', 
 'text-alignment', 'background-color', 'animation-duration', 
 'animation-delay', 'animation-angle', 'animation-ease'
 ];
 }

 attributeChangedCallback(name, oldValue, newValue) {
 if (oldValue !== newValue) {
 this.render();
 }
 }

 connectedCallback() {
 this.render();
 this.handleResize = () => this.render();
 window.addEventListener('resize', this.handleResize);
 }

 disconnectedCallback() {
 window.removeEventListener('resize', this.handleResize);
 }

 async loadDependencies() {
 if (!window.gsap || !window.SplitText ) {
 await Promise.all([
 this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'),
 this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/SplitText.min.js')
 ]);
 }
 }

 loadScript(src) {
 return new Promise((resolve, reject) => {
 const script = document.createElement('script');
 script.src = src;
 script.onload = resolve;
 script.onerror = reject;
 document.head.appendChild(script);
 });
 }

 async render() {
 const text = this.getAttribute('text') || 'Chase Your Dreams';
 const headingTag = this.getAttribute('heading-tag') || 'h1';
 const fontSize = parseFloat(this.getAttribute('font-size')) || 4; // In vw
 const fontFamily = this.getAttribute('font-family') || 'Poppins';
 const fontColor = this.getAttribute('font-color') || '#00FFFF'; // Bright cyan
 const textAlignment = this.getAttribute('text-alignment') || 'center';
 const backgroundColor = this.getAttribute('background-color') || '#2A1B3D'; // Deep purple
 const animationDuration = parseFloat(this.getAttribute('animation-duration')) || 0.2; // Seconds
 const animationDelay = parseFloat(this.getAttribute('animation-delay')) || 0.05; // Seconds
 const animationAngle = parseFloat(this.getAttribute('animation-angle')) * 10 || 180; // Scaled up by 10
 const animationEase = this.getAttribute('animation-ease') || 'back';

 await this.loadDependencies();

 this.shadowRoot.innerHTML = `
 <style>
 @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');

 :host {
 width: 100vw;
 height: 100vh;
 margin: 0;
 display: flex;
 align-items: center;
 justify-content: center;
 background: ${backgroundColor};
 overflow: hidden;
 }

 .base {
 display: flex;
 align-items: center;
 justify-content: center;
 max-width: 80vw;
 }

 .text {
 font-family: ${fontFamily}, sans-serif;
 font-size: ${fontSize}vw;
 font-weight: bold;
 color: ${fontColor};
 text-align: ${textAlignment};
 word-wrap: break-word;
 overflow-wrap: break-word;
 white-space: normal;
 line-height: 1.2;
 }
 </style>
 <div class="base">
 <${headingTag} class="text">${text}</${headingTag}>
 </div>
 `;

 const elem = this.shadowRoot.querySelector('.text');
 gsap.set(elem, { perspective: 400 });

 const mySplitText = new SplitText(elem, { type: "words", delimiter: " " });
 const words = my SplitText.words;

 const tl = gsap.timeline();
 words.forEach((word, index) => {
 tl.from(word, {
 duration: animationDuration,
 opacity: 0,
 scale: 0,
 y: 80,
 rotationX: animationAngle,
 transformOrigin: "0% 50% -50",
 ease: animationEase
 }, `+=${index === 0 ? 0 : animationDelay}`);
 });

 tl.play();
 }
}

customElements.define('chase-dreams', ChaseDreams);
