type TweenVars = Record<string, any> & {
  duration?: number;
  delay?: number;
  onComplete?: () => void;
};

type TimelineEntry = {
  timer: ReturnType<typeof setTimeout>;
};

function toElements(target: any): HTMLElement[] {
  if (!target) {
    return [];
  }

  if (Array.isArray(target)) {
    return target.filter(Boolean) as HTMLElement[];
  }

  if (typeof target.length === 'number' && typeof target !== 'string' && !('style' in target)) {
    return Array.from(target).filter(Boolean) as HTMLElement[];
  }

  return [target as HTMLElement];
}

function formatTransform(vars: TweenVars) {
  const transforms: string[] = [];

  if (vars.x != null) transforms.push(`translateX(${typeof vars.x === 'number' ? `${vars.x}px` : vars.x})`);
  if (vars.y != null) transforms.push(`translateY(${typeof vars.y === 'number' ? `${vars.y}px` : vars.y})`);
  if (vars.scale != null) transforms.push(`scale(${vars.scale})`);
  if (vars.rotateX != null) transforms.push(`rotateX(${vars.rotateX}deg)`);
  if (vars.rotateY != null) transforms.push(`rotateY(${vars.rotateY}deg)`);
  if (vars.rotateZ != null) transforms.push(`rotateZ(${vars.rotateZ}deg)`);

  return transforms.join(' ');
}

function applyVars(element: HTMLElement, vars: TweenVars) {
  if (vars.opacity != null) {
    element.style.opacity = String(vars.opacity);
  }

  const transform = formatTransform(vars);
  if (transform) {
    element.style.transform = transform;
    element.style.transformStyle = 'preserve-3d';
  }
}

function set(target: any, vars: TweenVars) {
  toElements(target).forEach((element) => applyVars(element, vars));
}

function fromTo(target: any, fromVars: TweenVars, toVars: TweenVars) {
  const elements = toElements(target);
  elements.forEach((element) => applyVars(element, fromVars));

  const timer = setTimeout(() => {
    elements.forEach((element) => {
      element.style.transition = `all ${(toVars.duration || 0.6)}s ease`;
      applyVars(element, toVars);
    });
    toVars.onComplete?.();
  }, 16);

  return {
    kill: () => clearTimeout(timer),
  };
}

function to(target: any, vars: TweenVars) {
  const elements = toElements(target);
  const timer = setTimeout(() => {
    elements.forEach((element) => {
      element.style.transition = `all ${(vars.duration || 0.6)}s ease`;
      applyVars(element, vars);
    });
    vars.onComplete?.();
  }, (vars.delay || 0) * 1000);

  return {
    kill: () => clearTimeout(timer),
  };
}

function timeline(config: { onComplete?: () => void } = {}) {
  const entries: TimelineEntry[] = [];
  let maxTime = 0;
  let completionTimer: ReturnType<typeof setTimeout> | null = null;

  return {
    to(target: any, vars: TweenVars, position = 0) {
      const startMs = Math.max(0, position) * 1000 + (vars.delay || 0) * 1000;
      const timer = setTimeout(() => {
        to(target, vars);
      }, startMs);
      entries.push({ timer });
      maxTime = Math.max(maxTime, startMs + (vars.duration || 0) * 1000);
      if (completionTimer) {
        clearTimeout(completionTimer);
      }
      completionTimer = setTimeout(() => {
        config.onComplete?.();
      }, maxTime + 16);
      return this;
    },
    kill() {
      entries.forEach(({ timer }) => clearTimeout(timer));
      if (completionTimer) {
        clearTimeout(completionTimer);
      }
    },
  };
}

const utils = {
  clamp(min: number, max: number, value: number) {
    return Math.min(max, Math.max(min, value));
  },
  unitize(transform: (value: number) => number | string) {
    return (value: number) => transform(value);
  },
};

const gsap = {
  set,
  fromTo,
  to,
  timeline,
  utils,
};

export default gsap;
