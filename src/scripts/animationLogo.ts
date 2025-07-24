import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// === Добавлено для поддержки кастомного scrollY ===
let getCustomScrollY = () => window.scrollY; // по умолчанию
let setCustomScrollY = (y: number) => window.scrollTo(0, y);

export function setSmoothScrollProxy(getY: () => number, setY: (y: number) => void) {
  getCustomScrollY = getY;
  setCustomScrollY = setY;
}
// === конец блока ===

export class LogoAnimation {
  private container: HTMLElement | null = null;
  private particles: HTMLElement[] = [];
  private isAnimated = false;
  private timeline: gsap.core.Timeline | null = null;
  private scrollTrigger: ScrollTrigger | null = null;
  private logoContainer: HTMLElement | null = null;
  private centerX = 0;
  private centerY = 0;
  private isScrollAnimationActive = false;
  private rafId: number | null = null;
  private lastScrollY = 0;
  private isDestroyed = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupElements());
    } else {
      this.setupElements();
    }
  }

  private setupElements(): void {
    this.container = document.querySelector(".hero-logo-container");

    if (this.container) {
      // Скрываем контент изначально
      gsap.set(".hero-content", { opacity: 0, y: 30 });

      // Предотвращаем скролл во время анимации
      document.body.classList.add("animating");
      this.startAnimation();
    }
  }

  private getLogoPath(): string {
    return `M24.0092 6.74575V15.9029C24.0092 16.4367 23.3707 16.7037 22.9965 16.3258L18.1732 11.4548C17.7278 11.0049 17.4783 10.393 17.4783 9.75712V0.60002C17.4783 0.0661305 18.1168 -0.200814 18.491 0.177107L21.8352 3.55441L22.1322 3.85435L23.3172 5.0511C23.7627 5.50101 24.0122 6.11288 24.0122 6.74875L24.0092 6.74575Z M30.8399 13.6441V16.7514C30.8399 17.0814 30.5726 17.3513 30.2459 17.3513H25.494C24.8376 17.3513 24.306 16.8144 24.306 16.1515V7.50134C24.306 6.96745 24.9445 6.7005 25.3188 7.07843L28.6629 10.4557L28.9599 10.7557L30.145 11.9524C30.5904 12.4023 30.8399 13.0142 30.8399 13.6501V13.6441Z M34.06 17.6515C34.5886 17.6515 34.853 18.2964 34.4788 18.6743L31.1346 22.0516L30.8376 22.3515L29.6526 23.5483C29.2071 23.9982 28.6012 24.2501 27.9716 24.2501H18.9043C18.3756 24.2501 18.1113 23.6053 18.4855 23.2274L23.3087 18.3564C23.7542 17.9065 24.3601 17.6545 24.9897 17.6545H34.057L34.06 17.6515Z M27.2294 24.5499C27.758 24.5499 28.0223 25.1947 27.6481 25.5727L24.304 28.95L24.007 29.2499L22.8219 30.4467C22.3764 30.8966 21.7706 31.1485 21.1409 31.1485H18.0641C17.7374 31.1485 17.4701 30.8786 17.4701 30.5486V25.7496C17.4701 25.0868 18.0017 24.5499 18.658 24.5499H27.2234H27.2294Z M17.177 25.2429V34.4C17.177 34.9339 16.5385 35.2008 16.1643 34.8229L11.341 29.9519C10.8955 29.502 10.6461 28.8901 10.6461 28.2543V19.0971C10.6461 18.5633 11.2846 18.2963 11.6588 18.6742L16.482 23.5452C16.9275 23.9951 17.177 24.607 17.177 25.2429Z M10.348 18.8514V27.5016C10.348 28.0355 9.70949 28.3025 9.33528 27.9246L5.99407 24.5502L4.50908 23.0506C4.06359 22.6007 3.81411 21.9888 3.81411 21.3529V18.2486C3.81411 17.9186 4.08141 17.6487 4.4081 17.6487H9.16005C9.81641 17.6487 10.348 18.1856 10.348 18.8484V18.8514Z M16.1627 11.7757L11.3395 16.6467C10.894 17.0966 10.2881 17.3485 9.65847 17.3485H0.594136C0.065482 17.3485 -0.198845 16.7036 0.175371 16.3257L3.51658 12.9514L3.81358 12.6515L5.00156 11.4517C5.44706 11.0018 6.05293 10.7499 6.68256 10.7499H15.7469C16.2755 10.7499 16.5399 11.3947 16.1657 11.7727L16.1627 11.7757Z M17.1805 4.45421V9.25322C17.1805 9.91608 16.6488 10.453 15.9925 10.453H7.43008C6.90142 10.453 6.63709 9.8081 7.01131 9.43018L10.3525 6.05288L11.8345 4.55619C12.28 4.10629 12.8859 3.85434 13.5155 3.85434H16.5924C16.9191 3.85434 17.1864 4.12428 17.1864 4.45421H17.1805Z`;
  }

  private getPathPoints(
    pathData: string,
    numPoints: number = 600 // Уменьшаем количество точек для производительности
  ): Array<{ x: number; y: number }> {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    svg.appendChild(path);
    document.body.appendChild(svg);

    const points: Array<{ x: number; y: number }> = [];
    const pathLength = path.getTotalLength();
    const bbox = path.getBBox();

    // Получаем точки контура
    for (let i = 0; i < numPoints; i++) {
      const point = path.getPointAtLength((i / numPoints) * pathLength);
      points.push({ x: point.x, y: point.y });
    }

    // Уменьшаем плотность заполнения для производительности
    const fillDensity = 1.2;
    const maxFillPoints = 1000;
    let fillPointsCount = 0;

    for (
      let x = bbox.x;
      x <= bbox.x + bbox.width && fillPointsCount < maxFillPoints;
      x += fillDensity
    ) {
      for (
        let y = bbox.y;
        y <= bbox.y + bbox.height && fillPointsCount < maxFillPoints;
        y += fillDensity
      ) {
        const point = svg.createSVGPoint();
        point.x = x;
        point.y = y;

        if (path.isPointInFill(point)) {
          const randomOffset = 0.8;
          points.push({
            x: x + (Math.random() - 0.5) * randomOffset,
            y: y + (Math.random() - 0.5) * randomOffset,
          });
          fillPointsCount++;
        }
      }
    }

    document.body.removeChild(svg);
    return points;
  }

  private createParticles(): void {
    const points = this.getPathPoints(this.getLogoPath());
    const section = document.querySelector('.hero-section') as HTMLElement;
    const sectionRect = section.getBoundingClientRect();
    const sectionWidth = section.offsetWidth;
    const sectionHeight = section.offsetHeight;
    this.centerX = sectionWidth / 2;
    this.centerY = sectionHeight / 2;

    const scale = 15;

    this.logoContainer = document.createElement('div');
    this.logoContainer.className = 'logo-container';
    gsap.set(this.logoContainer, {
      position: 'absolute',
      left: 0,
      top: 0,
      width: sectionWidth,
      height: sectionHeight,
      zIndex: 1,
      pointerEvents: 'none',
      // Добавляем оптимизацию для рендеринга
      transform: 'translateZ(0)',
      willChange: 'transform',
    });
    this.container?.appendChild(this.logoContainer);

    const offsetX = -(35 * scale) / 2 + this.centerX;
    const offsetY = -(35 * scale) / 2 + this.centerY;

    const fragment = document.createDocumentFragment();

    // Уменьшаем количество частиц для производительности
    const maxParticles = Math.min(points.length, 1000);
    const step = Math.max(1, Math.floor(points.length / maxParticles));

    for (let i = 0; i < points.length; i += step) {
      const point = points[i];
      const particle = document.createElement('div');
      particle.className = 'logo-particle';

      const finalX = offsetX + point.x * scale;
      const finalY = offsetY + point.y * scale;

      const edge = Math.floor(Math.random() * 4);
      let startX: number, startY: number;
      switch (edge) {
        case 0:
          startX = Math.random() * sectionWidth;
          startY = -30;
          break;
        case 1:
          startX = sectionWidth + 30;
          startY = Math.random() * sectionHeight;
          break;
        case 2:
          startX = Math.random() * sectionWidth;
          startY = sectionHeight + 30;
          break;
        case 3:
          startX = -30;
          startY = Math.random() * sectionHeight;
          break;
        default:
          startX = 0;
          startY = 0;
      }

      gsap.set(particle, {
        position: "absolute",
        width: "2px",
        height: "2px",
        backgroundColor: "rgba(135, 82, 250, 0.8)",
        borderRadius: "50%",
        left: startX,
        top: startY,
        opacity: 0,
        scale: 0,
        pointerEvents: "none",
        boxShadow: "0 0 3px rgba(135, 82, 250, 0.6)",
        // Оптимизация для рендеринга
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
      });

      particle.dataset.finalX = finalX.toString();
      particle.dataset.finalY = finalY.toString();
      particle.dataset.startX = startX.toString();
      particle.dataset.startY = startY.toString();

      fragment.appendChild(particle);
      this.particles.push(particle);
    }
    this.logoContainer?.appendChild(fragment);
  }

  private animateParticles(): void {
    this.timeline = gsap.timeline({
      onComplete: () => {
        this.showContent();
        this.setupScrollAnimation();
      },
    });

    this.particles.forEach((particle, index) => {
      const finalX = parseFloat(particle.dataset.finalX!);
      const finalY = parseFloat(particle.dataset.finalY!);
      const delay = index * 0.001;

      this.timeline?.to(
        particle,
        {
          opacity: 1,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        },
        delay
      );

      this.timeline?.to(
        particle,
        {
          left: finalX,
          top: finalY,
          duration: 0.8 + Math.random() * 0.3,
          ease: "power2.inOut",
        },
        delay
      );
    });
  }

  private setupScrollAnimation(): void {
    if (this.isScrollAnimationActive || this.isDestroyed) return;
    this.isScrollAnimationActive = true;

    const heroSection = document.querySelector(".hero-section");
    if (!heroSection) return;

    // Добавляем scrollerProxy для поддержки кастомного скролла
    ScrollTrigger.scrollerProxy(window, {
      scrollTop(value) {
        if (arguments.length) {
          setCustomScrollY(value!);
        }
        return getCustomScrollY();
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight
        };
      }
    });

    // Оптимизированный ScrollTrigger с лучшими настройками производительности
    this.scrollTrigger = ScrollTrigger.create({
      trigger: heroSection,
      start: "top top",
      end: "bottom top",
      // Убираем scrub для лучшей производительности и используем callbacks
      onUpdate: (self) => {
        if (this.isDestroyed) return;
        
        // Throttling для уменьшения количества вызовов
        const currentScrollY = getCustomScrollY();
        if (Math.abs(currentScrollY - this.lastScrollY) < 5) return;
        this.lastScrollY = currentScrollY;

        // Используем requestAnimationFrame для плавности
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
        }
        
        this.rafId = requestAnimationFrame(() => {
          if (!this.isDestroyed) {
            this.animateParticlesByProgress(self.progress);
          }
        });
      },
      onLeave: () => {
        // Полностью скрываем частицы при выходе из области
        this.particles.forEach(particle => {
          gsap.set(particle, { opacity: 0, scale: 0 });
        });
      },
      onEnterBack: () => {
        // Возвращаем частицы при возврате в область
        this.particles.forEach(particle => {
          gsap.set(particle, { opacity: 1, scale: 1 });
        });
      }
    });
  }

  private animateParticlesByProgress(progress: number): void {
    if (this.isDestroyed) return;

    const threshold = 0.05;
    let realProgress = Math.max(0, (progress - threshold) / (1 - threshold));
    realProgress = Math.min(1, realProgress);

    const section = document.querySelector('.hero-section') as HTMLElement;
    if (!section) return;

    const sectionWidth = section.offsetWidth;
    const sectionHeight = section.offsetHeight;

    // Батчинг анимаций для лучшей производительности
    const batchSize = 50;
    let batchIndex = 0;

    const animateBatch = () => {
      if (this.isDestroyed) return;

      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, this.particles.length);

      for (let i = startIndex; i < endIndex; i++) {
        const particle = this.particles[i];
        if (!particle) continue;

        const startX = parseFloat(particle.dataset.startX!);
        const startY = parseFloat(particle.dataset.startY!);
        const finalX = parseFloat(particle.dataset.finalX!);
        const finalY = parseFloat(particle.dataset.finalY!);

        const particleDelay = (i / this.particles.length) * 0.1;
        const adjustedProgress = Math.max(
          0,
          Math.min(1, (realProgress - particleDelay) / (1 - particleDelay))
        );

        let currentX = finalX + (startX - finalX) * adjustedProgress;
        let currentY = finalY + (startY - finalY) * adjustedProgress;

        currentX = Math.max(0, Math.min(sectionWidth, currentX));
        currentY = Math.max(0, Math.min(sectionHeight, currentY));

        const opacity = Math.max(0.1, 1 - adjustedProgress * 0.5);
        const scale = Math.max(0.3, 1 - adjustedProgress * 0.7);

        // Используем более быстрый способ установки стилей
        gsap.set(particle, {
          left: currentX,
          top: currentY,
          opacity: opacity,
          scale: scale,
        });
      }

      batchIndex++;
      if (batchIndex * batchSize < this.particles.length) {
        requestAnimationFrame(animateBatch);
      }
    };

    batchIndex = 0;
    animateBatch();
  }

  private showContent(): void {
    document.body.classList.remove("animating");

    gsap.to(".hero-content", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.1,
    });
  }

  public startAnimation(): void {
    if (this.isAnimated || this.isDestroyed) return;
    this.isAnimated = true;

    this.createParticles();

    setTimeout(() => {
      if (!this.isDestroyed) {
        this.animateParticles();
      }
    }, 200);
  }

  public destroy(): void {
    this.isDestroyed = true;
    this.isScrollAnimationActive = false;

    // Отменяем все активные анимации
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Убираем ScrollTrigger
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
      this.scrollTrigger = null;
    }

    // Останавливаем все остальные ScrollTrigger связанные с этим классом
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.trigger === document.querySelector(".hero-section")) {
        trigger.kill();
      }
    });

    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }

    // Очищаем все анимации частиц
    this.particles.forEach((particle) => {
      gsap.killTweensOf(particle);
    });

    // Удаляем DOM элементы
    if (this.logoContainer) {
      gsap.killTweensOf(this.logoContainer);
      this.logoContainer.remove();
      this.logoContainer = null;
    }

    // Очищаем массивы
    this.particles = [];
    this.isAnimated = false;
    document.body.classList.remove("animating");
  }
}

export default LogoAnimation;