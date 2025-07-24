import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export class GradientTextAnimation {
  private textElement: HTMLElement | null = null;
  private section: HTMLElement | null = null;
  private isActive = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupAnimation());
    } else {
      this.setupAnimation();
    }
  }

  private setupAnimation(): void {
    this.textElement = document.getElementById("gradient-text");
    this.section = document.querySelector(".protect-section");

    if (!this.textElement || !this.section) {
      return;
    }

    // Создаем ScrollTrigger для градиентного эффекта
    ScrollTrigger.create({
      trigger: this.section,
      start: "top bottom", // Когда верх секции достигает низа экрана
      end: "bottom top",   // Когда низ секции достигает верха экрана
      scrub: 1,
      onUpdate: (self) => {
        this.updateGradient(self.progress);
      },
      onToggle: (self) => {
        if (!self.isActive) {
          // Возвращаем белый цвет когда ScrollTrigger неактивен
          this.resetText();
        }
      }
    });
  }

  private updateGradient(progress: number): void {
    if (!this.textElement) return;

    // progress: 0 = секция внизу экрана, 1 = секция вверху экрана
    
    // Определяем зону действия градиента (центральная часть скролла)
    const startZone = 0.4;   // Начало действия градиента
    const endZone = 0.6;     // Конец действия градиента
    
    // Нормализуем progress в зоне действия градиента (0 до 1)
    const normalizedProgress = Math.max(0, Math.min(1, (progress - startZone) / (endZone - startZone)));
    
    // Вычисляем позицию центра "окна" градиента
    // 0 = окно внизу текста, 1 = окно вверху текста
    const windowCenter = 100 - (normalizedProgress * 100); // От 100% до 0%
    const windowSize = 50; // Размер окна через которое виден градиент
    
    // Вычисляем границы окна
    const windowTop = Math.max(0, windowCenter - windowSize / 2);
    const windowBottom = Math.min(100, windowCenter + windowSize / 2);
    
    // Создаем плавные границы окна
    const fadeSize = 20; // Размер плавного перехода на границах
    const fadeTop = Math.max(0, windowTop - fadeSize);
    const fadeBottom = Math.min(100, windowBottom + fadeSize);
    
    // Применяем белый цвет как основной
    this.textElement.style.color = '#ffffff';
    this.textElement.style.webkitTextFillColor = '#ffffff';
    
    // Убираем все градиенты и маски
    this.textElement.style.background = 'none';
    this.textElement.style.backgroundClip = 'unset';
    this.textElement.style.webkitBackgroundClip = 'unset';
    this.textElement.style.mask = 'none';
    this.textElement.style.webkitMask = 'none';
    
    // Создаем единый градиент который сочетает вертикальное позиционирование 
    // и горизонтальные цвета
    const combinedGradient = `
      linear-gradient(180deg, 
        #ffffff 0%, 
        #ffffff ${fadeTop}%, 
        #FCCDFF ${windowTop}%, 
        #8752FA ${windowBottom}%, 
        #ffffff ${fadeBottom}%, 
        #ffffff 100%
      )
    `;
    
    this.textElement.style.background = combinedGradient;
    this.textElement.style.backgroundClip = 'text';
    this.textElement.style.webkitBackgroundClip = 'text';
    this.textElement.style.webkitTextFillColor = 'transparent';
    
    this.isActive = true;
  }

  private resetText(): void {
    if (!this.textElement) return;
    
    // Сбрасываем все градиентные стили и маски
    this.textElement.style.background = 'none';
    this.textElement.style.backgroundClip = 'unset';
    this.textElement.style.webkitBackgroundClip = 'unset';
    this.textElement.style.mask = 'none';
    this.textElement.style.webkitMask = 'none';
    this.textElement.style.color = '#ffffff';
    this.textElement.style.webkitTextFillColor = '#ffffff';
    
    this.isActive = false;
  }

  public destroy(): void {
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.trigger === this.section) {
        trigger.kill();
      }
    });
    
    this.resetText();
  }
}

export default GradientTextAnimation;