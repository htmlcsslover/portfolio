export interface PortfolioData {
  hero: {
    badges: string[];
    typingPhrases: string[];
    title: {
      line1: string;
      line2: string;
      highlight: string;
    };
    description: string[];
    currentLane: string;
    socialLinks: {
      linkedin: string;
      github: string;
      email: string;
    };
  };
  discovery: {
    kicker: string;
    title: string;
    paragraphs: string[];
  };
  skills: {
    kicker: string;
    title: string;
    categories: {
      name: string;
      items: string[];
    }[];
  };
  journey: {
    education: {
      kicker: string;
      items: {
        period: string;
        title: string;
        subtitle: string;
      }[];
    };
    experience: {
      kicker: string;
      items: {
        period: string;
        title: string;
        subtitle: string;
      }[];
    };
  };
  contact: {
    kicker: string;
    title: string;
    description: string;
  };
  projects: {
    kicker: string;
    title: string;
    items: {
      title: string;
      description: string;
      techStack: string[];
      image: string;
      screenshots: string[];
      link: string;
    }[];
  };
}

export interface Project {
  title: string;
  description: string;
  techStack: string[];
  image: string;
  screenshots: string[];
  link: string;
}
