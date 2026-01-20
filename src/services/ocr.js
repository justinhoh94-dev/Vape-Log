import { createWorker } from 'tesseract.js';
import { CANNABINOIDS, TERPENES } from '../data/constants';

class OCRService {
  constructor() {
    this.worker = null;
  }

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker('eng');
    }
  }

  async parseLabel(imageData) {
    await this.initialize();

    try {
      const { data: { text } } = await this.worker.recognize(imageData);
      return this.extractProductInfo(text);
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to parse label');
    }
  }

  extractProductInfo(text) {
    const info = {
      name: this.extractProductName(text),
      cannabinoids: this.extractCannabinoids(text),
      terpenes: this.extractTerpenes(text),
      strain: this.extractStrain(text),
      thcContent: null,
      cbdContent: null
    };

    // Extract THC/CBD percentages
    const thcMatch = text.match(/THC[:\s]*(\d+(?:\.\d+)?)\s*%/i);
    const cbdMatch = text.match(/CBD[:\s]*(\d+(?:\.\d+)?)\s*%/i);

    if (thcMatch) {
      info.thcContent = parseFloat(thcMatch[1]);
      info.cannabinoids.thc = parseFloat(thcMatch[1]);
    }

    if (cbdMatch) {
      info.cbdContent = parseFloat(cbdMatch[1]);
      info.cannabinoids.cbd = parseFloat(cbdMatch[1]);
    }

    return info;
  }

  extractProductName(text) {
    // Try to find the product name (usually in the first few lines, often capitalized)
    const lines = text.split('\n').filter(line => line.trim().length > 0);

    // Look for a line that might be the product name (longer than 3 chars, not a number)
    for (const line of lines.slice(0, 5)) {
      const cleaned = line.trim();
      if (cleaned.length > 3 && !/^\d+/.test(cleaned) && !/^(THC|CBD|CBN|CBG)/i.test(cleaned)) {
        return cleaned;
      }
    }

    return 'Unknown Product';
  }

  extractCannabinoids(text) {
    const cannabinoids = {};
    const upperText = text.toUpperCase();

    CANNABINOIDS.forEach(({ id, name }) => {
      // Look for patterns like "THC: 25.5%" or "THC 25.5%" or "THC - 25.5%"
      const patterns = [
        new RegExp(`${name}[:\\s-]*([\\d.]+)\\s*%`, 'i'),
        new RegExp(`${name}[:\\s-]*([\\d.]+)\\s*MG`, 'i'),
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          cannabinoids[id] = parseFloat(match[1]);
          break;
        }
      }
    });

    return cannabinoids;
  }

  extractTerpenes(text) {
    const terpenes = {};
    const lowerText = text.toLowerCase();

    TERPENES.forEach(({ id, name }) => {
      const lowerName = name.toLowerCase();

      // Look for terpene name followed by percentage or mg
      const patterns = [
        new RegExp(`${lowerName}[:\\s-]*([\\d.]+)\\s*%`, 'i'),
        new RegExp(`${lowerName}[:\\s-]*([\\d.]+)\\s*mg`, 'i'),
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          terpenes[id] = parseFloat(match[1]);
          break;
        }
      }

      // Also just check if the terpene name is mentioned
      if (!terpenes[id] && lowerText.includes(lowerName)) {
        terpenes[id] = 1; // Default value if mentioned but no amount specified
      }
    });

    return terpenes;
  }

  extractStrain(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('sativa') && lowerText.includes('indica')) {
      return 'hybrid';
    } else if (lowerText.includes('sativa')) {
      return 'sativa';
    } else if (lowerText.includes('indica')) {
      return 'indica';
    }

    return null;
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

const ocrService = new OCRService();
export default ocrService;
