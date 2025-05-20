class ChaseDreams extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.animationPlayed = false;
    this.observer = null;
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
    this.setupIntersectionObserver();
    this.handleResize = () => this.render();
    window.addEventListener('resize', this.handleResize);
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  setupIntersectionObserver() {
    // Create an IntersectionObserver to watch when the element enters the viewport
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animationPlayed) {
          this.startAnimation();
          this.animationPlayed = true;
          
          // Optional: If you want the animation to play only once
          // this.observer.disconnect();
          // this.observer = null;
        }
      });
    }, {
      root: null, // Use the viewport as the root
      rootMargin: '0px',
      threshold: 0.25 // Trigger when at least 25% of the element is visible
    });
    
    // Start observing the element
    this.observer.observe(this);
  }

  startAnimation() {
    const elem = this.shadowRoot.querySelector('.text');
    
    // Check if GSAP and SplitText are available
    if (window.gsap && window.SplitText) {
      console.log('Element in viewport. GSAP and SplitText detected, starting animation');
      gsap.set(elem, { perspective: 400 });

      const mySplitText = new SplitText(elem, { type: "words", delimiter: " " });
      const words = mySplitText.words;
      console.log('Split words:', words.length);

      const animationAngle = parseFloat(this.getAttribute('animation-angle')) || 180;
      const animationDurationRaw = parseFloat(this.getAttribute('animation-duration')) || 20;
      const animationDelayRaw = parseFloat(this.getAttribute('animation-delay')) || 10;
      const animationEase = this.getAttribute('animation-ease') || 'back';
      
      // Rescale values
      const animationDuration = 0.1 + (animationDurationRaw / 100) * (1 - 0.1); // 0-100 -> 0.1-1 s
      const animationDelay = (animationDelayRaw / 100) * 0.5; // 0-100 -> 0-0.5 s

      gsap.set(words, { opacity: 0, scale: 0, y: 80, rotationX: animationAngle });

      const tl = gsap.timeline();
      words.forEach((word, index) => {
        word.classList.add('word');
        tl.to(word, {
          duration: animationDuration,
          opacity: 1,
          scale: 1,
          y: 0,
          rotationX: 0,
          transformOrigin: "0% 50% -50",
          ease: animationEase
        }, index * animationDelay);
      });
    } else {
      console.warn('GSAP or SplitText not loaded, applying simple fade-in animation');
      // Simple CSS animation as fallback when GSAP isn't available
      elem.style.animation = 'fadeIn 1s ease forwards';
    }
  }

  render() {
    const text = this.getAttribute('text') || 'Chase Your Dreams';
    const headingTag = this.getAttribute('heading-tag') || 'h1';
    const fontSizeRaw = parseFloat(this.getAttribute('font-size')) || 45; // 0-100
    const fontFamily = this.getAttribute('font-family') || 'Poppins';
    const fontColor = this.getAttribute('font-color') || '#00FFFF'; // Bright cyan
    const textAlignment = this.getAttribute('text-alignment') || 'center';
    const backgroundColor = this.getAttribute('background-color') || '#2A1B3D'; // Deep purple

    // Rescale 0-100 to actual ranges
    const fontSize = 2 + (fontSizeRaw / 100) * (10 - 2); // 0-100 -> 2-10 vw

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

        .word {
          display: inline-block;
          padding: 0 5px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
      <div class="base">
        <${headingTag} class="text">${text}</${headingTag}>
      </div>
    `;
    
    // Reset animation state if the content is re-rendered
    if (this.animationPlayed) {
      // If in viewport already and content changes, re-run animation
      const isInViewport = this.isElementInViewport();
      if (isInViewport) {
        requestAnimationFrame(() => {
          this.startAnimation();
        });
      } else {
        this.animationPlayed = false;
      }
    }
  }
  
  isElementInViewport() {
    const rect = this.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
  }
}

customElements.define('chase-dreams', ChaseDreams);
