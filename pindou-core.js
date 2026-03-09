// pindou-core.js
// 拼豆图纸生成核心算法模块 (Lab颜色匹配 + 全自动后处理)

// -------------------- RGB 转 Lab 辅助函数 --------------------
function rgbToXyz(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    r *= 100; g *= 100; b *= 100;
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return [x, y, z];
}

function xyzToLab(x, y, z) {
    const refX = 95.047, refY = 100.000, refZ = 108.883;
    x /= refX; y /= refY; z /= refZ;
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    const L = (116 * y) - 16;
    const a = 500 * (x - y);
    const b_ = 200 * (y - z);
    return [L, a, b_];
}

export function rgbToLab(r, g, b) {
    const [x, y, z] = rgbToXyz(r, g, b);
    return xyzToLab(x, y, z);
}

// -------------------- 色板数据 --------------------
export const perlerColors = [
    { code: 'P01', name: 'Black', r: 0, g: 0, b: 0 },
    { code: 'P02', name: 'White', r: 255, g: 255, b: 255 },
    { code: 'P03', name: 'Red', r: 255, g: 0, b: 0 },
    { code: 'P04', name: 'Yellow', r: 255, g: 255, b: 0 },
    { code: 'P05', name: 'Green', r: 0, g: 128, b: 0 },
    { code: 'P06', name: 'Blue', r: 0, g: 0, b: 255 },
    { code: 'P07', name: 'Orange', r: 255, g: 165, b: 0 },
    { code: 'P08', name: 'Purple', r: 128, g: 0, b: 128 },
    { code: 'P09', name: 'Pink', r: 255, g: 192, b: 203 },
    { code: 'P10', name: 'Light Blue', r: 173, g: 216, b: 230 },
    { code: 'P11', name: 'Brown', r: 165, g: 42, b: 42 },
    { code: 'P12', name: 'Grey', r: 128, g: 128, b: 128 },
    { code: 'P13', name: 'Dark Green', r: 0, g: 100, b: 0 },
    { code: 'P14', name: 'Dark Blue', r: 0, g: 0, b: 139 },
    { code: 'P15', name: 'Light Green', r: 144, g: 238, b: 144 },
    { code: 'P16', name: 'Light Pink', r: 255, g: 182, b: 193 },
    { code: 'P17', name: 'Peach', r: 255, g: 218, b: 185 },
    { code: 'P18', name: 'Lavender', r: 230, g: 230, b: 250 },
    { code: 'P19', name: 'Cream', r: 255, g: 253, b: 208 },
    { code: 'P20', name: 'Turquoise', r: 64, g: 224, b: 208 },
    { code: 'P21', name: 'Violet', r: 238, g: 130, b: 238 },
    { code: 'P22', name: 'Magenta', r: 255, g: 0, b: 255 },
    { code: 'P23', name: 'Cyan', r: 0, g: 255, b: 255 },
    { code: 'P24', name: 'Lime', r: 50, g: 205, b: 50 },
    { code: 'P25', name: 'Beige', r: 245, g: 245, b: 220 },
    { code: 'P26', name: 'Light Yellow', r: 255, g: 255, b: 224 },
    { code: 'P27', name: 'Light Grey', r: 211, g: 211, b: 211 },
    { code: 'P28', name: 'Dark Grey', r: 64, g: 64, b: 64 },
    { code: 'P29', name: 'Dark Red', r: 139, g: 0, b: 0 },
    { code: 'P30', name: 'Dark Orange', r: 255, g: 140, b: 0 },
    { code: 'P31', name: 'Dark Purple', r: 75, g: 0, b: 130 },
    { code: 'P32', name: 'Teal', r: 0, g: 128, b: 128 },
    { code: 'P33', name: 'Mint', r: 152, g: 251, b: 152 },
    { code: 'P34', name: 'Coral', r: 255, g: 127, b: 80 },
    { code: 'P35', name: 'Gold', r: 255, g: 215, b: 0 },
    { code: 'P36', name: 'Silver', r: 192, g: 192, b: 192 },
    { code: 'P37', name: 'Bronze', r: 205, g: 127, b: 50 },
    { code: 'P38', name: 'Rose', r: 255, g: 0, b: 127 },
    { code: 'P39', name: 'Sky Blue', r: 135, g: 206, b: 235 },
    { code: 'P40', name: 'Olive', r: 128, g: 128, b: 0 },
    { code: 'P41', name: 'Navy', r: 0, g: 0, b: 128 },
    { code: 'P42', name: 'Maroon', r: 128, g: 0, b: 0 },
    { code: 'P43', name: 'Fuchsia', r: 255, g: 0, b: 255 },
    { code: 'P44', name: 'Aqua', r: 0, g: 255, b: 255 },
    { code: 'P45', name: 'Lime Green', r: 0, g: 255, b: 0 },
];

// 预计算调色板颜色的 Lab 值
perlerColors.forEach(color => {
    color.lab = rgbToLab(color.r, color.g, color.b);
});

// 构建代码到颜色的快速映射
const codeToColor = {};
perlerColors.forEach(color => codeToColor[color.code] = color);

// -------------------- 核心算法函数 --------------------

export function resizeEdgeMap(edgeMap, srcWidth, srcHeight, dstWidth, dstHeight) {
    const resized = new Uint8ClampedArray(dstWidth * dstHeight);
    const xScale = srcWidth / dstWidth;
    const yScale = srcHeight / dstHeight;
    for (let y = 0; y < dstHeight; y++) {
        for (let x = 0; x < dstWidth; x++) {
            const srcX = Math.floor(x * xScale);
            const srcY = Math.floor(y * yScale);
            resized[y * dstWidth + x] = edgeMap[srcY * srcWidth + srcX];
        }
    }
    return resized;
}

export function sobelEdgeDetection(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const edgeData = new Uint8ClampedArray(width * height);

    const gx = [
        [-3, 0, 3],
        [-10, 0, 10],
        [-3, 0, 3]
    ];
    const gy = [
        [-3, -10, -3],
        [0, 0, 0],
        [3, 10, 3]
    ];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sumX = 0, sumY = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    const gray = 0.299 * data[idx] + 0.587 * data[idx+1] + 0.114 * data[idx+2];
                    sumX += gray * gx[ky+1][kx+1];
                    sumY += gray * gy[ky+1][kx+1];
                }
            }
            const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
            edgeData[y * width + x] = Math.min(255, magnitude * 1.5);
        }
    }
    return edgeData;
}

export function blendWithEdge(pixelData, width, height, edgeMap, strength = 0.5) {
    const result = new Uint8ClampedArray(pixelData.length);
    const center = 128;

    for (let i = 0; i < pixelData.length; i += 4) {
        const edgeIdx = i / 4;
        let edgeStrength = edgeMap[edgeIdx] / 255;
        edgeStrength = edgeStrength * edgeStrength * (2 - edgeStrength);

        const r = pixelData[i];
        const g = pixelData[i + 1];
        const b = pixelData[i + 2];

        const devR = r - center;
        const devG = g - center;
        const devB = b - center;

        const enhancementFactor = 1 + (edgeStrength * strength * 2.5);

        result[i] = Math.min(255, Math.max(0, center + devR * enhancementFactor));
        result[i + 1] = Math.min(255, Math.max(0, center + devG * enhancementFactor));
        result[i + 2] = Math.min(255, Math.max(0, center + devB * enhancementFactor));
        result[i + 3] = 255;
    }
    return result;
}

export function enhanceContrast(data, factor) {
    const result = new Uint8ClampedArray(data.length);
    const intercept = 128 * (1 - factor);
    for (let i = 0; i < data.length; i += 4) {
        result[i] = Math.min(255, Math.max(0, (data[i] * factor) + intercept));
        result[i + 1] = Math.min(255, Math.max(0, (data[i + 1] * factor) + intercept));
        result[i + 2] = Math.min(255, Math.max(0, (data[i + 2] * factor) + intercept));
        result[i + 3] = 255;
    }
    return result;
}

function findClosestColor(r, g, b, palette) {
    const targetLab = rgbToLab(r, g, b);
    let minDistSq = Infinity;
    let closestColor = palette[0];
    for (const color of palette) {
        const lab = color.lab;
        const dL = targetLab[0] - lab[0];
        const da = targetLab[1] - lab[1];
        const db = targetLab[2] - lab[2];
        const distSq = dL*dL + da*da + db*db;
        if (distSq < minDistSq) {
            minDistSq = distSq;
            closestColor = color;
        }
    }
    return [closestColor.r, closestColor.g, closestColor.b];
}

export function applyColorQuantization(data, palette) {
    const result = new Uint8ClampedArray(data.length);
    for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = findClosestColor(data[i], data[i + 1], data[i + 2], palette);
        result[i] = r;
        result[i + 1] = g;
        result[i + 2] = b;
        result[i + 3] = 255;
    }
    return result;
}

export function findClosestColorIndex(r, g, b, palette) {
    const targetLab = rgbToLab(r, g, b);
    let minDistSq = Infinity;
    let closestIndex = 0;
    for (let i = 0; i < palette.length; i++) {
        const color = palette[i];
        const lab = color.lab;
        const dL = targetLab[0] - lab[0];
        const da = targetLab[1] - lab[1];
        const db = targetLab[2] - lab[2];
        const distSq = dL*dL + da*da + db*db;
        if (distSq < minDistSq) {
            minDistSq = distSq;
            closestIndex = i;
        }
    }
    return closestIndex;
}

export function createGridData(data, width, height, palette) {
    const grid = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            row.push(findClosestColorIndex(r, g, b, palette));
        }
        grid.push(row);
    }
    return grid;
}

export function getContrastColor(r, g, b) {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
}

// -------------------- 自动估算函数 --------------------

/**
 * 估算图像适合的最大颜色数量（基于图像复杂度）
 */
function estimateColorCount(image, gridWidth, gridHeight) {
    // 缩小到 80x80 快速分析
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, 80, 80);
    const data = ctx.getImageData(0, 0, 80, 80).data;
    
    // 计算灰度方差
    let sum = 0, sumSq = 0;
    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        sum += gray;
        sumSq += gray * gray;
    }
    const n = data.length / 4;
    const variance = (sumSq / n) - (sum / n) ** 2;
    
    // 映射到颜色数范围 12-40
    let nColors = Math.round(12 + (variance - 500) * 28 / 3500);
    nColors = Math.max(12, Math.min(40, nColors));
    
    // 根据网格尺寸微调
    const gridCells = gridWidth * gridHeight;
    if (gridCells > 48 * 48) {
        nColors = Math.min(40, nColors + 5);
    } else if (gridCells < 29 * 29) {
        nColors = Math.max(12, nColors - 3);
    }
    return nColors;
}

/**
 * 估算合适的相似颜色合并阈值（基于颜色数量）
 */
function estimateSimilarityThreshold(image, gridWidth, gridHeight) {
    const nColors = estimateColorCount(image, gridWidth, gridHeight);
    // 颜色越多，阈值越小（避免过度合并）
    let threshold = Math.round(40 - nColors * 0.5);
    threshold = Math.max(8, Math.min(30, threshold));
    return threshold;
}

// -------------------- 后处理函数 --------------------

function cleanupRareColors(codeMatrix, totalPixels, minRatio = 0.003) {
    const h = codeMatrix.length;
    const w = codeMatrix[0].length;
    
    const freq = {};
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const code = codeMatrix[y][x];
            freq[code] = (freq[code] || 0) + 1;
        }
    }

    const minCount = Math.max(2, Math.floor(totalPixels * minRatio));
    const keptCodes = new Set();
    const rareCodes = new Set();
    for (const [code, cnt] of Object.entries(freq)) {
        if (cnt >= minCount) keptCodes.add(code);
        else rareCodes.add(code);
    }

    if (rareCodes.size === 0) return codeMatrix;

    const keptLabs = {};
    keptCodes.forEach(code => {
        const color = codeToColor[code];
        if (color) keptLabs[code] = color.lab;
    });

    if (Object.keys(keptLabs).length === 0) return codeMatrix;

    const remap = {};
    rareCodes.forEach(code => {
        const color = codeToColor[code];
        if (!color) return;
        let bestCode = null;
        let bestDist = Infinity;
        for (const [kc, kl] of Object.entries(keptLabs)) {
            const dL = color.lab[0] - kl[0];
            const da = color.lab[1] - kl[1];
            const db = color.lab[2] - kl[2];
            const dist = dL*dL + da*da + db*db;
            if (dist < bestDist) {
                bestDist = dist;
                bestCode = kc;
            }
        }
        if (bestCode) remap[code] = bestCode;
    });

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const code = codeMatrix[y][x];
            if (remap[code]) {
                codeMatrix[y][x] = remap[code];
            }
        }
    }
    return codeMatrix;
}

function mergeSimilarColors(codeMatrix, threshold) {
    if (threshold <= 0) return codeMatrix;

    const h = codeMatrix.length;
    const w = codeMatrix[0].length;

    const freq = {};
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const code = codeMatrix[y][x];
            freq[code] = (freq[code] || 0) + 1;
        }
    }

    const sortedCodes = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);

    const labCache = {};
    sortedCodes.forEach(code => {
        const color = codeToColor[code];
        if (color) labCache[code] = color.lab;
    });

    const replaced = new Set();
    const mergeMap = {};

    for (let i = 0; i < sortedCodes.length; i++) {
        const current = sortedCodes[i];
        if (replaced.has(current)) continue;
        if (!labCache[current]) continue;

        for (let j = i + 1; j < sortedCodes.length; j++) {
            const lower = sortedCodes[j];
            if (replaced.has(lower)) continue;
            if (!labCache[lower]) continue;

            const lab1 = labCache[current];
            const lab2 = labCache[lower];
            const dL = lab1[0] - lab2[0];
            const da = lab1[1] - lab2[1];
            const db = lab1[2] - lab2[2];
            const dist = dL*dL + da*da + db*db;
            if (dist < threshold * threshold) {
                replaced.add(lower);
                mergeMap[lower] = current;
            }
        }
    }

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const code = codeMatrix[y][x];
            if (mergeMap[code]) {
                codeMatrix[y][x] = mergeMap[code];
            }
        }
    }
    return codeMatrix;
}

function capMaxColors(codeMatrix, maxColors) {
    if (maxColors <= 0) return codeMatrix;

    const h = codeMatrix.length;
    const w = codeMatrix[0].length;

    const freq = {};
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const code = codeMatrix[y][x];
            freq[code] = (freq[code] || 0) + 1;
        }
    }

    const uniqueColors = Object.keys(freq).length;
    if (uniqueColors <= maxColors) return codeMatrix;

    const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
    const topCodes = new Set(sorted.slice(0, maxColors));
    const removedCodes = sorted.slice(maxColors);

    const topLabs = {};
    topCodes.forEach(code => {
        const color = codeToColor[code];
        if (color) topLabs[code] = color.lab;
    });

    const remap = {};
    removedCodes.forEach(code => {
        const color = codeToColor[code];
        if (!color) return;
        let bestCode = null;
        let bestDist = Infinity;
        for (const [tc, tl] of Object.entries(topLabs)) {
            const dL = color.lab[0] - tl[0];
            const da = color.lab[1] - tl[1];
            const db = color.lab[2] - tl[2];
            const dist = dL*dL + da*da + db*db;
            if (dist < bestDist) {
                bestDist = dist;
                bestCode = tc;
            }
        }
        if (bestCode) remap[code] = bestCode;
    });

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const code = codeMatrix[y][x];
            if (remap[code]) {
                codeMatrix[y][x] = remap[code];
            }
        }
    }
    return codeMatrix;
}

// -------------------- 统一处理函数 --------------------
export function processImage(image, targetWidth, targetHeight, options = {}, palette = perlerColors) {
    const {
        contrastFactor = 1.0,
        useEdgeEnhance = false,
        edgeStrength = 0.5,
        // 后处理参数设为0表示自动（用户不干预）
        similarityThreshold = 0,
        maxColors = 0,
    } = options;

    // 1. 最近邻缩放
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    let imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    let pixelData = new Uint8ClampedArray(imageData.data);

    // 2. 边缘增强
    if (useEdgeEnhance) {
        const maxSize = 800;
        const scale = Math.min(1, maxSize / image.width);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.round(image.width * scale);
        tempCanvas.height = Math.round(image.height * scale);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
        const tempImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

        const edgeMap = sobelEdgeDetection(tempImageData);
        const resizedEdge = resizeEdgeMap(edgeMap, tempCanvas.width, tempCanvas.height, targetWidth, targetHeight);
        pixelData = blendWithEdge(pixelData, targetWidth, targetHeight, resizedEdge, edgeStrength);
    }

    // 3. 对比度增强
    if (contrastFactor !== 1.0) {
        pixelData = enhanceContrast(pixelData, contrastFactor);
    }

    // 4. 颜色量化
    pixelData = applyColorQuantization(pixelData, palette);

    // 5. 生成网格数据（索引矩阵）
    let gridData = createGridData(pixelData, targetWidth, targetHeight, palette);

    // 6. 转换为代码矩阵
    let codeMatrix = [];
    for (let y = 0; y < targetHeight; y++) {
        const row = [];
        for (let x = 0; x < targetWidth; x++) {
            const idx = gridData[y][x];
            row.push(palette[idx].code);
        }
        codeMatrix.push(row);
    }

    // 7. 自动估算后处理参数（如果用户没指定）
    const totalPixels = targetWidth * targetHeight;
    const autoMaxColors = maxColors > 0 ? maxColors : estimateColorCount(image, targetWidth, targetHeight);
    const autoSimilarity = similarityThreshold > 0 ? similarityThreshold : estimateSimilarityThreshold(image, targetWidth, targetHeight);

    // 8. 后处理（稀有颜色清理始终启用）
    codeMatrix = cleanupRareColors(codeMatrix, totalPixels, 0.003);
    if (autoSimilarity > 0) {
        codeMatrix = mergeSimilarColors(codeMatrix, autoSimilarity);
    }
    if (autoMaxColors > 0) {
        codeMatrix = capMaxColors(codeMatrix, autoMaxColors);
    }

    // 9. 从代码矩阵重新生成 pixelData 和 gridData
    const newPixelData = new Uint8ClampedArray(targetWidth * targetHeight * 4);
    const newGridData = [];
    for (let y = 0; y < targetHeight; y++) {
        const row = [];
        for (let x = 0; x < targetWidth; x++) {
            const code = codeMatrix[y][x];
            const color = codeToColor[code];
            if (color) {
                const idx = (y * targetWidth + x) * 4;
                newPixelData[idx] = color.r;
                newPixelData[idx+1] = color.g;
                newPixelData[idx+2] = color.b;
                newPixelData[idx+3] = 255;
                row.push(palette.findIndex(c => c.code === code));
            } else {
                // 保底（理论上不会发生）
                const idx = (y * targetWidth + x) * 4;
                newPixelData[idx] = 0;
                newPixelData[idx+1] = 0;
                newPixelData[idx+2] = 0;
                newPixelData[idx+3] = 255;
                row.push(0);
            }
        }
        newGridData.push(row);
    }

    return {
        pixelData: newPixelData,
        gridData: newGridData,
        width: targetWidth,
        height: targetHeight,
        palette
    };
}