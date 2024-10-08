import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AdjustmentValues, hexToRgb, hexToCmyk, getContrastColor } from './colorUtils';

// Add this at the top of the file
export const isBrowser = typeof window !== 'undefined';

export function sharePalette(palette: string[], lockedColors: boolean[], adjustments: AdjustmentValues) {
  const state = { palette, lockedColors, adjustments };
  const stateString = btoa(JSON.stringify(state));
  const url = `${window.location.origin}?s=${stateString}`;
  
  navigator.clipboard.writeText(url).then(() => {
    alert('Share link copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy share link: ', err);
  });

  // Remove focus from the Share button after copying the link
  (document.activeElement as HTMLElement)?.blur();

  // Return false to prevent default behavior
  return false;
}

// Modify the createExportPalette function
const createExportPalette = (palette: string[]) => {
  if (!isBrowser) {
    // Return a mock object for non-browser environments
    return {
      style: {},
      appendChild: jest.fn(),
    } as unknown as HTMLDivElement;
  }

  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.width = '1200px';
  div.style.height = '600px';

  palette.forEach((color) => {
    const colorDiv = document.createElement('div');
    colorDiv.style.flex = '1';
    colorDiv.style.backgroundColor = color;
    colorDiv.style.display = 'flex';
    colorDiv.style.flexDirection = 'column';
    colorDiv.style.justifyContent = 'flex-end';
    colorDiv.style.alignItems = 'center';
    colorDiv.style.padding = '0 0 20px 0';

    const createColorText = (label: string, value: string) => {
      const textDiv = document.createElement('div');
      textDiv.style.color = getContrastColor(color);
      textDiv.style.fontFamily = 'Arial, Helvetica, sans-serif';
      textDiv.style.fontSize = '14px';
      textDiv.style.fontWeight = '600';
      textDiv.style.marginBottom = '5px';
      textDiv.style.textAlign = 'center';
      textDiv.style.letterSpacing = '0.05em';
      textDiv.style.textShadow = `0 0 3px ${getContrastColor(color) === '#FFFFFF' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}`;
      textDiv.innerHTML = `${label}<br>${value}`;
      return textDiv;
    };

    const hexText = createColorText('HEX', color.toUpperCase());
    colorDiv.appendChild(hexText);

    const rgb = hexToRgb(color);
    const rgbText = createColorText('RGB', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    colorDiv.appendChild(rgbText);

    const cmyk = hexToCmyk(color);
    const cmykText = createColorText('CMYK', `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`);
    colorDiv.appendChild(cmykText);

    div.appendChild(colorDiv);
  });

  return div;
};

// Modify the export functions to check for browser environment
export const exportToPNG = async (palette: string[], adjustments: AdjustmentValues, event?: React.MouseEvent | React.KeyboardEvent) => {
  if (!isBrowser) return;
  if (event) {
    event.preventDefault();
  }
  const exportDiv = createExportPalette(palette);
  document.body.appendChild(exportDiv);

  try {
    const canvas = await html2canvas(exportDiv, {
      backgroundColor: null,
      scale: 2,
    });

    const link = document.createElement('a');
    link.download = 'color-palette.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Failed to export PNG:', error);
  } finally {
    document.body.removeChild(exportDiv);
  }

  // Remove focus from the button after exporting
  (document.activeElement as HTMLElement)?.blur();
};

export const exportToJSON = (palette: string[], adjustments: AdjustmentValues, event?: React.MouseEvent | React.KeyboardEvent) => {
  if (!isBrowser) return;
  if (event) {
    event.preventDefault();
  }
  const paletteData = {
    colors: palette.map(color => ({
      hex: color,
      rgb: hexToRgb(color),
      cmyk: hexToCmyk(color)
    })),
    adjustments
  };

  const jsonString = JSON.stringify(paletteData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = 'color-palette.json';
  link.href = URL.createObjectURL(blob);
  link.click();

  // Remove focus from the button after exporting
  (document.activeElement as HTMLElement)?.blur();
};

export const exportToPDF = async (palette: string[], adjustments: AdjustmentValues, event?: React.MouseEvent | React.KeyboardEvent) => {
  if (!isBrowser) return;
  if (event) {
    event.preventDefault();
  }
  const exportDiv = createExportPalette(palette);
  document.body.appendChild(exportDiv);

  try {
    const canvas = await html2canvas(exportDiv, {
      scale: 2,
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save('color-palette.pdf');
  } catch (error) {
    console.error('Failed to export PDF:', error);
  } finally {
    document.body.removeChild(exportDiv);
  }

  // Remove focus from the button after exporting
  (document.activeElement as HTMLElement)?.blur();
};
