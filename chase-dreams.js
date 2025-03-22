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
    if (!window.gsap || !window.SplitText) {
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
    const fontSizeRaw = parseFloat(this.getAttribute('font-size')) || 45; // 0-100, default 45 ≈ 4.5vw
    const fontFamily = this.getAttribute('font-family') || 'Poppins';
    const fontColor = this.getAttribute('font-color') || '#00FFFF'; // Bright cyan
    const textAlignment = this.getAttribute('text-alignment') || 'center';
    const backgroundColor = this.getAttribute('background-color') || '#2A1B3D'; // Deep purple
    const animationDurationRaw = parseFloat(this.getAttribute('animation-duration')) || 20; // 0-100, default 20 ≈ 0.2s
    const animationDelayRaw = parseFloat(this.getAttribute('animation-delay')) || 10; // 0-100, default 10 ≈ 0.05s
    const animationAngleRaw = parseFloat(this.getAttribute('animation-angle')) || 50; // 0-100, default 50 ≈ 180°
    const animationEase = this.getAttribute('animation-ease') || 'back';

    // Rescale 0-100 to actual ranges
    const fontSize = 2 + (fontSizeRaw / 100) * (10 - 2); // 0-100 -> 2-10 vw
    const animationDuration = 0.1 + (animationDurationRaw / 100) * (1 - 0.1); // 0-100 -> 0.1-1 s
    const animationDelay = (animationDelayRaw / 100) * 0.5; // 0-100 -> 0-0.5 s
    const animationAngle = (animationAngleRaw / 100) * 360; // 0-100 -> 0-360°

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
    const words = mySplitText.words;

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
