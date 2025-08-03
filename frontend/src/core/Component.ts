export interface ComponentOptions {
  className?: string;
  id?: string;
  tag?: string;
}

export class Component {
  protected element: HTMLElement;
  private children: Component[] = [];

  constructor(options: ComponentOptions = {}) {
    this.element = this.createElement(options);
    this.init();
  }

  // Element oluşturma
  protected createElement(options: ComponentOptions): HTMLElement {
    const element = document.createElement(options.tag || 'div');
    if (options.className) element.className = options.className;
    if (options.id) element.id = options.id;
    return element;
  }

  // Başlangıç setup'ı - override edilebilir
  protected init(): void {
    // Override in child components
  }

  // Element döndürme
  getElement(): HTMLElement {
    return this.element;
  }

  // HTML içeriği set etme
  setHTML(html: string): Component {
    this.element.innerHTML = html;
    return this;
  }

  // Text içeriği set etme
  setText(text: string): Component {
    this.element.textContent = text;
    return this;
  }

  // CSS class ekleme
  addClass(className: string): Component {
    const classes = className.split(' ').filter(cls => cls.trim() !== '');
    classes.forEach(cls => this.element.classList.add(cls));
    return this;
  }

  // CSS class kaldırma
  removeClass(className: string): Component {
    const classes = className.split(' ').filter(cls => cls.trim() !== '');
    classes.forEach(cls => this.element.classList.remove(cls));
    return this;
  }

  // Event listener ekleme
  on(event: string, handler: EventListener): Component {
    this.element.addEventListener(event, handler);
    return this;
  }

  // Child component ekleme
  append(child: Component | HTMLElement): Component {
    if (child instanceof Component) {
      this.children.push(child);
      this.element.appendChild(child.getElement());
    } else {
      this.element.appendChild(child);
    }
    return this;
  }

  // Component kaldırma
  remove(): void {
    this.element.remove();
  }

  // Temizlik
  destroy(): void {
    this.children.forEach(child => child.destroy());
    this.children = [];
    this.remove();
  }
}
