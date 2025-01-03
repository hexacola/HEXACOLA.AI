// JavaScript Code for Hexacola AI Image Generator

// Global Variables
let timerInterval;
let autoMode = false;
let totalImages = 0;
let generatedImagesCount = 0;

// Comprehensive List of Camera Features
const cameraFeaturesList = [
  "DSLR",
  "Wide-angle lens",
  "Ultra-wide lens",
  "Telephoto lens",
  "Macro lens",
  "Fisheye lens",
  "Tilt-shift lens",
  "Pinhole camera",
  "360-degree panorama",
  "Satellite imagery",
  "Super-resolution microscopy",
  "Infrared photography",
  "Black-and-white film",
  "Vintage film camera",
  "Polaroid/instant camera",
  "Action camera (e.g., GoPro)",
  "Low-light/night photography lens",
  "Portrait lens (e.g., 85mm f/1.4)",
  "Large-format camera",
  "Medium-format camera",
  "Smartphone lens simulation",
  "Cinematic anamorphic lens",
  "Experimental lens effects (e.g., lens flare, kaleidoscope)"
];

// Comprehensive List of Color Schemes based on Color Theory
const colorSchemesList = [
  "Complementary",
  "Analogous",
  "Triadic",
  "Tetradic",
  "Split-Complementary",
  "Monochromatic"
];

// Descriptions for Camera Features
const cameraFeatureDescriptions = {
  "DSLR": "Digital Single-Lens Reflex cameras are known for their versatility, high image quality, and interchangeable lenses.",
  "Wide-angle lens": "A lens with a shorter focal length that captures a wider field of view than standard lenses.",
  "Ultra-wide lens": "A lens with an extremely wide field of view, ideal for capturing expansive landscapes and architecture.",
  "Telephoto lens": "A lens with a long focal length that allows photographers to capture distant subjects with magnification.",
  "Macro lens": "A lens designed for extreme close-up photography, allowing you to capture fine details of small subjects.",
  "Fisheye lens": "An ultra wide-angle lens that creates a spherical, distorted view, often used for creative and artistic photography.",
  "Tilt-shift lens": "A lens that allows for tilting and shifting to control the plane of focus and perspective distortion.",
  "Pinhole camera": "A simple camera without glass lenses, using a tiny aperture to create images with unique depth and focus characteristics.",
  "360-degree panorama": "A camera feature that allows capturing a full 360-degree panoramic view.",
  "Satellite imagery": "Images of Earth or other planets captured by satellites, used for mapping, weather forecasting, and more.",
  "Super-resolution microscopy": "Advanced microscopy techniques that surpass the diffraction limit to reveal finer details of specimens.",
  "Infrared photography": "Capturing images using infrared light, revealing details not visible to the naked eye.",
  "Black-and-white film": "Photography using monochromatic film, emphasizing contrast, texture, and composition.",
  "Vintage film camera": "Classic cameras known for their unique build and photographic characteristics, often used for nostalgic imagery.",
  "Polaroid/instant camera": "Cameras that produce instant prints, offering a tangible and immediate photographic experience.",
  "Action camera (e.g., GoPro)": "Compact and durable cameras designed for capturing action and adventure footage.",
  "Low-light/night photography lens": "Lenses optimized for capturing clear images in low-light or nighttime conditions.",
  "Portrait lens (e.g., 85mm f/1.4)": "Lenses with focal lengths ideal for capturing flattering portraits with shallow depth of field.",
  "Large-format camera": "Cameras that use large film or digital sensors, providing high resolution and detail.",
  "Medium-format camera": "Cameras that use medium-sized film or sensors, balancing quality and portability.",
  "Smartphone lens simulation": "Lens effects that mimic the capabilities of smartphone cameras, such as wide-angle and macro.",
  "Cinematic anamorphic lens": "Lenses that provide a wide aspect ratio and distinctive lens flares, used in filmmaking.",
  "Experimental lens effects (e.g., lens flare, kaleidoscope)": "Creative lens effects that add unique visual elements to images."
};

// Descriptions for Color Schemes
const colorSchemeDescriptions = {
  "Complementary": "A color scheme using colors opposite each other on the color wheel, creating high contrast and vibrant look.",
  "Analogous": "A color scheme using colors next to each other on the color wheel, providing harmony and pleasing aesthetics.",
  "Triadic": "A color scheme using three colors evenly spaced around the color wheel, offering balanced and vibrant combinations.",
  "Tetradic": "A color scheme using four colors arranged into two complementary pairs, providing rich and varied color palettes.",
  "Split-Complementary": "A color scheme using one base color and two adjacent complementary colors, offering high contrast with less tension.",
  "Monochromatic": "A color scheme using variations in lightness and saturation of a single color, creating a cohesive and elegant look."
};

// Add these new functions after the existing global variables

const loadingMessages = [
  "Channeling creative energies...",
  "Mixing digital paint...",
  "Consulting the AI muses...",
  "Weaving pixels together...",
  "Calibrating artistic parameters...",
  "Brewing visual magic...",
  "Crafting your masterpiece...",
  "Adding finishing touches..."
];

let loadingMessageInterval;
let thinkingStepTimeout;

function updateLoadingMessage() {
  const loadingMessageEl = document.getElementById('loadingMessage');
  loadingMessageEl.textContent = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
}

function animateThinkingProcess() {
  const steps = document.querySelectorAll('.thinking-step');
  let currentStep = 0;

  function activateStep(index) {
    steps.forEach((step, i) => {
      if (i < index) {
        step.classList.add('complete', 'active');
      } else if (i === index) {
        step.classList.add('active');
        step.classList.remove('complete');
      } else {
        step.classList.remove('active', 'complete');
      }
    });
  }

  function nextStep() {
    if (currentStep < steps.length) {
      activateStep(currentStep);
      currentStep++;
      thinkingStepTimeout = setTimeout(nextStep, 2000); // Advance to next step every 2 seconds
    }
  }

  nextStep();
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
  const backgroundPrompt = document.getElementById('backgroundPrompt').value;
  const characterPrompt = document.getElementById('characterPrompt').value;
  const negativePrompt = document.getElementById('negativePrompt').value;
  const model = document.getElementById('model').value;
  const width = document.getElementById('width').value;
  const height = document.getElementById('height').value;
  const seed = document.getElementById('seed').value;
  const imageOptions = document.getElementById('imageOptions').value;
  const style = document.getElementById('style').value;

  // Collect additional character descriptions
  const additionalCharacterDescriptions = [];
  const additionalGroups = document.querySelectorAll('.additional-character-group textarea');
  additionalGroups.forEach(textarea => {
    const desc = textarea.value.trim();
    if (desc) {
      additionalCharacterDescriptions.push(desc);
    }
  });

  // Collect selected camera features
  const selectedCameraFeatures = Array.from(document.querySelectorAll('#cameraFeaturesToggles button.active')).map(btn => btn.textContent);

  // Collect selected color schemes
  const selectedColorSchemes = Array.from(document.querySelectorAll('#colorSchemesToggles button.active')).map(btn => btn.textContent);

  localStorage.setItem('backgroundPrompt', backgroundPrompt);
  localStorage.setItem('characterPrompt', characterPrompt);
  localStorage.setItem('negativePrompt', negativePrompt);
  localStorage.setItem('model', model);
  localStorage.setItem('width', width);
  localStorage.setItem('height', height);
  localStorage.setItem('seed', seed);
  localStorage.setItem('imageOptions', imageOptions);
  localStorage.setItem('style', style);
  localStorage.setItem('autoMode', autoMode);
  localStorage.setItem('additionalCharacterDescriptions', JSON.stringify(additionalCharacterDescriptions));
  localStorage.setItem('selectedCameraFeatures', JSON.stringify(selectedCameraFeatures));
  localStorage.setItem('selectedColorSchemes', JSON.stringify(selectedColorSchemes));
}

/**
 * Load settings from localStorage
 */
function loadSettings() {
  const backgroundPrompt = localStorage.getItem('backgroundPrompt');
  const characterPrompt = localStorage.getItem('characterPrompt');
  const negativePrompt = localStorage.getItem('negativePrompt');
  const model = localStorage.getItem('model');
  const width = localStorage.getItem('width');
  const height = localStorage.getItem('height');
  const seed = localStorage.getItem('seed');
  const imageOptions = localStorage.getItem('imageOptions');
  const style = localStorage.getItem('style');
  const savedAutoMode = localStorage.getItem('autoMode');
  const additionalCharacterDescriptions = JSON.parse(localStorage.getItem('additionalCharacterDescriptions') || '[]');
  const selectedCameraFeatures = JSON.parse(localStorage.getItem('selectedCameraFeatures') || '[]');
  const selectedColorSchemes = JSON.parse(localStorage.getItem('selectedColorSchemes') || '[]');

  if (backgroundPrompt) document.getElementById('backgroundPrompt').value = backgroundPrompt;
  if (characterPrompt) document.getElementById('characterPrompt').value = characterPrompt;
  if (negativePrompt) document.getElementById('negativePrompt').value = negativePrompt;
  if (model) document.getElementById('model').value = model;
  if (width) document.getElementById('width').value = width;
  if (height) document.getElementById('height').value = height;
  if (seed) document.getElementById('seed').value = seed;
  if (imageOptions) document.getElementById('imageOptions').value = imageOptions;
  if (style) document.getElementById('style').value = style;

  if (savedAutoMode === 'true') {
    autoMode = true;
    document.getElementById('autoToggleBtn').classList.add('active');
    document.getElementById('autoToggleBtn').innerHTML = '<i class="fas fa-robot"></i> AUTO ON';
    document.getElementById('autoToggleBtn').setAttribute('aria-pressed', 'true');
  } else {
    autoMode = false;
    document.getElementById('autoToggleBtn').classList.remove('active');
    document.getElementById('autoToggleBtn').innerHTML = '<i class="fas fa-robot"></i> AUTO OFF';
    document.getElementById('autoToggleBtn').setAttribute('aria-pressed', 'false');
  }

  // Load additional character descriptions
  additionalCharacterDescriptions.forEach(desc => {
    addCharacterDescription(desc);
  });

  // Load selected camera features
  selectedCameraFeatures.forEach(feature => {
    toggleFeature('cameraFeaturesToggles', feature);
  });

  // Load selected color schemes
  selectedColorSchemes.forEach(scheme => {
    toggleFeature('colorSchemesToggles', scheme);
  });

  // Update dynamic descriptions
  updateDynamicDescription();
}

/**
 * Initial load and setup
 */
document.addEventListener('DOMContentLoaded', () => {
  populateCameraFeatureToggles();
  populateColorSchemeToggles();
  loadSettings();
  loadDarkMode();
  setupModal();
  initializeNegativePrompt();
  loadLibraryImages();
  disableImageDownload();
  addEventListeners();
});

/**
 * Populate Camera Features Toggles
 */
function populateCameraFeatureToggles() {
  const container = document.getElementById('cameraFeaturesToggles');
  cameraFeaturesList.forEach(feature => {
    const btn = document.createElement('button');
    btn.textContent = feature;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', feature);
    btn.onclick = () => {
      btn.classList.toggle('active');
      btn.setAttribute('aria-pressed', btn.classList.contains('active'));
      updateDynamicDescription();
      saveSettings();
    };
    container.appendChild(btn);
  });
}

/**
 * Populate Color Schemes Toggles
 */
function populateColorSchemeToggles() {
  const container = document.getElementById('colorSchemesToggles');
  colorSchemesList.forEach(scheme => {
    const btn = document.createElement('button');
    btn.textContent = scheme;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', scheme);
    btn.onclick = () => {
      btn.classList.toggle('active');
      btn.setAttribute('aria-pressed', btn.classList.contains('active'));
      updateDynamicDescription();
      saveSettings();
    };
    container.appendChild(btn);
  });
}

/**
 * Toggle feature in a specific toggle group
 * @param {string} groupId - ID of the toggle group
 * @param {string} feature - Feature name to toggle
 */
function toggleFeature(groupId, feature) {
  const container = document.getElementById(groupId);
  const button = Array.from(container.children).find(btn => btn.textContent === feature);
  if (button && !button.classList.contains('active')) {
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
  }
}

/**
 * Update Dynamic Description based on selected toggles
 */
function updateDynamicDescription() {
  const selectedCameraFeatures = Array.from(document.querySelectorAll('#cameraFeaturesToggles button.active')).map(btn => btn.textContent);
  const selectedColorSchemes = Array.from(document.querySelectorAll('#colorSchemesToggles button.active')).map(btn => btn.textContent);
  let description = '';

  if (selectedCameraFeatures.length > 0) {
    description += `<strong>Camera Features:</strong> ${selectedCameraFeatures.join(', ')}<br>`;
  }

  if (selectedColorSchemes.length > 0) {
    description += `<strong>Color Schemes:</strong> ${selectedColorSchemes.join(', ')}<br>`;
  }

  // Include additional character descriptions
  const additionalGroups = document.querySelectorAll('.additional-character-group textarea');
  if (additionalGroups.length > 0) {
    let additionalDescriptions = [];
    additionalGroups.forEach(textarea => {
      const desc = textarea.value.trim();
      if (desc) {
        additionalDescriptions.push(desc);
      }
    });
    if (additionalDescriptions.length > 0) {
      description += `<strong>Additional Character Descriptions:</strong> ${additionalDescriptions.join('; ')}<br>`;
    }
  }

  document.getElementById('dynamicDescription').innerHTML = description;
}

/**
 * Dark Mode Toggle
 */
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const toggleBtn = document.querySelector('.dark-mode-toggle');
  if (document.body.classList.contains('dark-mode')) {
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i> ☀️';
    toggleBtn.setAttribute('aria-label', 'Perjungti į šviesų režimą');
    toggleBtn.setAttribute('aria-pressed', 'true');
  } else {
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i> 🌙';
    toggleBtn.setAttribute('aria-label', 'Perjungti į tamsųjį režimą');
    toggleBtn.setAttribute('aria-pressed', 'false');
  }
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

/**
 * Load Dark Mode settings
 */
function loadDarkMode() {
  const darkMode = localStorage.getItem('darkMode');
  if (darkMode === 'true') {
    document.body.classList.add('dark-mode');
    const toggleBtn = document.querySelector('.dark-mode-toggle');
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i> ☀️';
    toggleBtn.setAttribute('aria-label', 'Perjungti į šviesų režimą');
    toggleBtn.setAttribute('aria-pressed', 'true');
  } else {
    const toggleBtn = document.querySelector('.dark-mode-toggle');
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i> 🌙';
    toggleBtn.setAttribute('aria-label', 'Perjungti į tamsųjį režimą');
    toggleBtn.setAttribute('aria-pressed', 'false');
  }
}

/**
 * Auto Mode Toggle
 */
function toggleAutoMode() {
  autoMode = !autoMode;
  const toggleBtn = document.getElementById('autoToggleBtn');
  if (autoMode) {
    toggleBtn.classList.add('active');
    toggleBtn.innerHTML = '<i class="fas fa-robot"></i> AUTO ON';
    toggleBtn.setAttribute('aria-pressed', 'true');
  } else {
    toggleBtn.classList.remove('active');
    toggleBtn.innerHTML = '<i class="fas fa-robot"></i> AUTO OFF';
    toggleBtn.setAttribute('aria-pressed', 'false');
  }
  localStorage.setItem('autoMode', autoMode);
}

/**
 * Add Additional Character Description
 * @param {string} description - Optional pre-filled description
 */
function addCharacterDescription(description = '') {
  const container = document.getElementById('additionalCharacterDescriptions');
  
  const descriptionCount = container.children.length;
  if (descriptionCount >= 5) { // Limit to 5 additional descriptions
    alert('Galite pridėti iki 5 papildomų personažo aprašymų.');
    return;
  }

  const newGroup = document.createElement('div');
  newGroup.classList.add('input-group', 'additional-character-group');

  const label = document.createElement('label');
  label.textContent = `Papildomas personažo aprašymas ${descriptionCount + 1}:`;
  label.setAttribute('for', `additionalCharacterPrompt${descriptionCount + 1}`);

  const textarea = document.createElement('textarea');
  textarea.id = `additionalCharacterPrompt${descriptionCount + 1}`;
  textarea.placeholder = 'Pvz., juodi plaukai, mėlynos akys, dėvintis raudoną šaliką ir baltus marškinėlius.';
  textarea.value = description;
  textarea.setAttribute('aria-label', `Papildomas personažo aprašymas ${descriptionCount + 1}`);
  textarea.oninput = updateDynamicDescription;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '–'; // Remove button
  removeBtn.title = 'Remove discription';
  removeBtn.setAttribute('aria-label', 'Remove discription');
  removeBtn.onclick = () => {
    container.removeChild(newGroup);
    updateDynamicDescription();
    saveSettings(); // Save changes
  };

  newGroup.appendChild(label);
  newGroup.appendChild(textarea);
  newGroup.appendChild(removeBtn);

  container.appendChild(newGroup);
  updateDynamicDescription();
}

/**
 * Show Library
 */
function showLibrary() {
  document.getElementById('generatorContainer').classList.remove('active');
  document.getElementById('libraryContainer').classList.add('active');
  disableImageDownload(); // Ensure new images have download disabled
}

/**
 * Show Generator
 */
function showGenerator() {
  document.getElementById('libraryContainer').classList.remove('active');
  document.getElementById('generatorContainer').classList.add('active');
  disableImageDownload(); // Ensure new images have download disabled
}

/**
 * Add Image to Library Gallery
 * @param {string} url - Image URL
 * @param {string} prompt - Image prompt
 * @param {string} model - Model used
 * @param {string} width - Image width
 * @param {string} height - Image height
 * @param {string|number} seed - Seed used
 * @param {string} mimeType - Image MIME type
 */
function addImageToLibraryGallery(url, prompt, model, width, height, seed, mimeType) {
  const libraryImagesDiv = document.getElementById('libraryImages');
  const imageContainer = document.createElement('div');
  imageContainer.classList.add('image-container');

  const imgElement = document.createElement('img');
  imgElement.src = url;
  imgElement.alt = 'Generated Image';
  imgElement.title = 'Press to enlarge';
  imgElement.dataset.type = mimeType; // Store MIME type for correct file extension
  imageContainer.appendChild(imgElement);

  // Add caption
  const caption = document.createElement('div');
  caption.classList.add('caption');
  caption.innerHTML = `
    <strong>Prompt:</strong> ${sanitizeHTML(prompt)}<br>
    <strong>Model:</strong> ${sanitizeHTML(model)}<br>
    <strong>Dimensions:</strong> ${sanitizeHTML(width)}px x ${sanitizeHTML(height)}px<br>
    <strong>Seed:</strong> ${sanitizeHTML(seed)}
  `;
  imageContainer.appendChild(caption);

  // Add download options
  const downloadOptions = document.createElement('div');
  downloadOptions.classList.add('download-options');

  const formatSelect = document.createElement('select');
  formatSelect.innerHTML = `
    <option value="png">PNG</option>
    <option value="jpg">JPG</option>
    <option value="webp">WEBP</option>
  `;
  downloadOptions.appendChild(formatSelect);

  const downloadBtn = document.createElement('button');
  downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
  downloadBtn.setAttribute('aria-label', 'Atsisiųsti vaizdą');
  downloadBtn.onclick = () => {
    const format = formatSelect.value;
    downloadImage(url, `hexacola_image_${sanitizeFileName(seed)}.${format}`, format);
  };
  downloadOptions.appendChild(downloadBtn);

  imageContainer.appendChild(downloadOptions);

  libraryImagesDiv.appendChild(imageContainer);
}

/**
 * Download Image in Selected Format
 * @param {string} url - Image URL
 * @param {string} filename - Desired filename
 * @param {string} format - Image format
 */
async function downloadImage(url, filename, format) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Nepavyko atsisiųsti vaizdo.');
    const blob = await response.blob();
    let convertedBlob = blob;

    if (format !== blob.type.split('/')[1]) {
      const imageBitmap = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageBitmap, 0, 0);
      convertedBlob = await new Promise(resolve => canvas.toBlob(resolve, `image/${format}`));
      if (!convertedBlob) throw new Error('Nepavyko konvertuoti vaizdo formato.');
    }

    const a = document.createElement('a');
    a.href = URL.createObjectURL(convertedBlob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href); // Revoke the object URL after download
  } catch (error) {
    console.error('Atsisiuntimo klaida:', error);
    alert('Klaida atsisiunčiant vaizdą. Bandykite dar kartą.');
  }
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} str - Input string
 * @returns {string} - Sanitized string
 */
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Sanitize File Name
 * @param {string|number} seed - Seed used
 * @returns {string} - Sanitized file name
 */
function sanitizeFileName(seed) {
  return String(seed).replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

/**
 * Load Library Images from localStorage
 */
function loadLibraryImages() {
  let images = JSON.parse(localStorage.getItem('generatedImages')) || [];
  images.forEach(image => {
    addImageToLibraryGallery(image.url, image.prompt, image.model, image.width, image.height, image.seed, image.mimeType);
  });
}

/**
 * Clear Library
 */
function clearLibrary() {
  if (confirm('Ar tikrai norite išvalyti visus vaizdus iš bibliotekos?')) {
    localStorage.removeItem('generatedImages');
    document.getElementById('libraryImages').innerHTML = '';
    alert('Library sėkmingai išvalyta.');
  }
}

/**
 * Generate Image
 */
async function generateImage() {
  const generateButton = document.querySelector('.generate');
  generateButton.disabled = true; // Disable button during generation

  const backgroundPrompt = document.getElementById('backgroundPrompt').value.trim();
  const characterPrompt = document.getElementById('characterPrompt').value.trim();
  const negativePrompt = document.getElementById('negativePrompt').value.trim();
  const model = document.getElementById('model').value;
  const width = parseInt(document.getElementById('width').value, 10);
  const height = parseInt(document.getElementById('height').value, 10);
  const seedInput = document.getElementById('seed').value.trim();
  const seed = seedInput ? parseInt(seedInput, 10) : null;
  const imageOptions = parseInt(document.getElementById('imageOptions').value, 10);
  const style = document.getElementById('style').value;

  // Collect additional character descriptions
  const additionalCharacterDescriptions = [];
  const additionalGroups = document.querySelectorAll('.additional-character-group textarea');
  additionalGroups.forEach(textarea => {
    const desc = textarea.value.trim();
    if (desc) {
      additionalCharacterDescriptions.push(desc);
    }
  });

  // Collect selected camera features
  const selectedCameraFeatures = Array.from(document.querySelectorAll('#cameraFeaturesToggles button.active')).map(btn => btn.textContent);

  // Collect selected color schemes
  const selectedColorSchemes = Array.from(document.querySelectorAll('#colorSchemesToggles button.active')).map(btn => btn.textContent);

  // Check if no prompts are provided
  const noPrompts = !backgroundPrompt && !characterPrompt && additionalCharacterDescriptions.length === 0;

  let backgroundCombinedPrompt = '';
  let characterCombinedPrompt = '';

  if (noPrompts) {
    // Generate both background and character prompts if none provided
    try {
      [backgroundCombinedPrompt, characterCombinedPrompt] = await Promise.all([
        generateRandomPromptFunction('background', style, selectedCameraFeatures, selectedColorSchemes),
        generateRandomPromptFunction('character', style, selectedCameraFeatures, selectedColorSchemes)
      ]);
      // Assign generated prompts
      document.getElementById('backgroundPrompt').value = backgroundCombinedPrompt;
      document.getElementById('characterPrompt').value = characterCombinedPrompt;
    } catch (error) {
      console.error(error);
      alert('Nepavyko sugeneruoti atsitiktinio aprašymo. Bandykite dar kartą.');
      generateButton.disabled = false;
      return;
    }
  } else {
    // If at least one prompt is provided, use them as is
    backgroundCombinedPrompt = backgroundPrompt;
    characterCombinedPrompt = characterPrompt;
  }

  // Ensure at least one prompt is present
  if ((!backgroundCombinedPrompt && !characterCombinedPrompt)) {
    alert('Write atleast one character and background prompt');
    generateButton.disabled = false;
    return;
  }

  saveSettings();

  let optimizedBackgroundPrompt = backgroundCombinedPrompt;
  let optimizedCharacterPrompt = characterCombinedPrompt;
  let optimizedNegativePrompt = "low quality, blurry, bad anatomy, out of focus, noise, duplicate, watermark, text, ugly, messy, " + negativePrompt;

  if (autoMode) {
    try {
      // Optimize background prompt with style, camera features, and color schemes
      if (backgroundCombinedPrompt) {
        optimizedBackgroundPrompt = await optimizePrompt(`Optimize the following background prompt for high-quality image generation in ${style} style with camera features ${selectedCameraFeatures.join(', ')} and color schemes ${selectedColorSchemes.join(', ')}: "${backgroundCombinedPrompt}"`);
      }

      // Optimize character prompt with style, camera features, and color schemes
      if (characterCombinedPrompt) {
        optimizedCharacterPrompt = await optimizePrompt(`Optimize the following character prompt for high-quality image generation in ${style} style with camera features ${selectedCameraFeatures.join(', ')} and color schemes ${selectedColorSchemes.join(', ')}: "${characterCombinedPrompt}"`);
      }

      // Optimize each additional character description
      for (let i = 0; i < additionalCharacterDescriptions.length; i++) {
        additionalCharacterDescriptions[i] = await optimizePrompt(`Optimize the following character description to match the ${style} style with camera features ${selectedCameraFeatures.join(', ')} and color schemes ${selectedColorSchemes.join(', ')}: "${additionalCharacterDescriptions[i]}"`);
      }

      // Optimize negative prompt
      if (negativePrompt) {
        optimizedNegativePrompt = "low quality, blurry, bad anatomy, out of focus, noise, duplicate, watermark, text, ugly, messy, " + await optimizePrompt(`Optimize the following negative prompt to exclude unwanted elements: "${negativePrompt}"`);
      }
    } catch (error) {
      console.error(error);
      alert('Klaida optimizuojant aprašymus su AI. Bandykite dar kartą.');
      generateButton.disabled = false;
      return;
    }
  }

  // Integrate additional character descriptions
  let fullCharacterPrompt = optimizedCharacterPrompt;
  if (additionalCharacterDescriptions.length > 0) {
    fullCharacterPrompt += ' ' + additionalCharacterDescriptions.join(' ');
    fullCharacterPrompt += ' Ensure that all characters maintain the same style, face structure, and clothing as described above.';
  }

  // Integrate camera features and color schemes into the combined prompt
  let combinedPrompt = '';
  if (optimizedBackgroundPrompt && fullCharacterPrompt) {
    combinedPrompt = `${optimizedBackgroundPrompt}, ${fullCharacterPrompt}, with correct proportions, good perspective, and excellent composition.`;
  } else if (optimizedBackgroundPrompt) {
    combinedPrompt = `${optimizedBackgroundPrompt}, with correct proportions, good perspective, and excellent composition.`;
  } else if (fullCharacterPrompt) {
    combinedPrompt = `${fullCharacterPrompt}, with correct proportions, good perspective, and excellent composition.`;
  }

  // Append style
  if (style === 'Mix') {
    combinedPrompt = appendMixStyleToPrompt(combinedPrompt);
  } else if (style !== 'None') {
    combinedPrompt = appendStyleToPrompt(combinedPrompt, style);
  }

  // Append camera features and color schemes descriptions at the beginning for top priority
  if (selectedCameraFeatures.length > 0) {
    combinedPrompt = `${selectedCameraFeatures.join(', ')}, ${combinedPrompt}`;
  }
  if (selectedColorSchemes.length > 0) {
    combinedPrompt = `${selectedColorSchemes.join(', ')}, ${combinedPrompt}`;
  }

  // Create API URL
  let urlBase = `https://image.pollinations.ai/prompt/${encodeURIComponent(combinedPrompt)}?model=${encodeURIComponent(model)}&width=${encodeURIComponent(width)}&height=${encodeURIComponent(height)}&nologo=true`;

  // Remove 'negative' parameter as it's not part of the API specification
  // If you have a different method to handle negative prompts, implement it accordingly
  // For now, we will exclude the negative prompt from the URL

  try {
    // Show loading overlay and start animations
    const overlay = document.getElementById('overlay');
    const timer = document.getElementById('timer');
    overlay.style.display = 'flex';
    
    // Initialize loading animations
    let seconds = 0;
    timer.textContent = `Generation time: ${seconds}s`;
    timerInterval = setInterval(() => {
      seconds++;
      timer.textContent = `Generation time: ${seconds}s`;
    }, 1000);

    // Start message rotation
    updateLoadingMessage();
    loadingMessageInterval = setInterval(updateLoadingMessage, 3000);

    // Start thinking process animation
    animateThinkingProcess();

    // Initialize progress bar
    totalImages = imageOptions;
    generatedImagesCount = 0;
    updateProgressBar();

    // Clear previous generated images
    const generatedImageDiv = document.getElementById('generatedImage');
    generatedImageDiv.innerHTML = '';

    // Generate images concurrently with unique seeds
    const promises = [];
    for (let i = 0; i < imageOptions; i++) {
      let uniqueSeed;
      if (seed) {
        uniqueSeed = seed + i; // Increment seed
      } else {
        uniqueSeed = Math.floor(Math.random() * 100000); // Random seed
      }
      const url = `${urlBase}&seed=${encodeURIComponent(uniqueSeed)}`;
      promises.push(fetch(url).then(response => {
        if (!response.ok) {
          throw new Error('Nepavyko sugeneruoti vaizdo.');
        }
        return response.blob();
      }).catch(error => {
        console.error(`Vaizdo generavimo klaida (Seed: ${uniqueSeed}):`, error);
        return null;
      }));
    }

    const blobs = await Promise.all(promises);
    blobs.forEach((blob, index) => {
      if (blob) {
        const imgUrl = URL.createObjectURL(blob);
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');

        const imgElement = document.createElement('img');
        imgElement.src = imgUrl;
        imgElement.alt = 'Generated Image';
        imgElement.title = 'press to enlarge';
        imgElement.dataset.type = blob.type; // Store MIME type
        imageContainer.appendChild(imgElement);

        // Add caption
        const caption = document.createElement('div');
        caption.classList.add('caption');
        caption.innerHTML = `
          <strong>Prompt:</strong> ${sanitizeHTML(combinedPrompt)}<br>
          <strong>Model:</strong> ${sanitizeHTML(model)}<br>
          <strong>Dimensions:</strong> ${sanitizeHTML(width)}px x ${sanitizeHTML(height)}px<br>
          <strong>Seed:</strong> ${sanitizeHTML(seed ? uniqueSeed : 'Random')}
        `;
        imageContainer.appendChild(caption);

        // Add download options
        const downloadOptions = document.createElement('div');
        downloadOptions.classList.add('download-options');

        const formatSelect = document.createElement('select');
        formatSelect.innerHTML = `
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
          <option value="webp">WEBP</option>
        `;
        downloadOptions.appendChild(formatSelect);

        const downloadBtn = document.createElement('button');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        downloadBtn.setAttribute('aria-label', 'Atsisiųsti vaizdą');
        downloadBtn.onclick = () => {
          const format = formatSelect.value;
          downloadImage(imgUrl, `hexacola_image_${sanitizeFileName(seed ? uniqueSeed : index + 1)}.${format}`, format);
        };
        downloadOptions.appendChild(downloadBtn);

        imageContainer.appendChild(downloadOptions);

        generatedImageDiv.appendChild(imageContainer);

        // Save image to localStorage and add to library
        saveImage(imgUrl, combinedPrompt, model, width, height, seed ? uniqueSeed : `Random_${Date.now()}`, blob.type);
        addImageToLibraryGallery(imgUrl, combinedPrompt, model, width, height, seed ? uniqueSeed : `Random_${Date.now()}`, blob.type);

        // Update progress bar
        generatedImagesCount++;
        updateProgressBar();
      } else {
        // Even if image generation failed, update progress
        generatedImagesCount++;
        updateProgressBar();
      }
    });
  } catch (error) {
    console.error(error);
    alert('Klaida generuojant vaizdą. Bandykite dar kartą.');
    document.getElementById('generatedImage').innerHTML = '';
  } finally {
    // Clean up all animations
    clearInterval(timerInterval);
    clearInterval(loadingMessageInterval);
    clearTimeout(thinkingStepTimeout);
    const steps = document.querySelectorAll('.thinking-step');
    steps.forEach(step => step.classList.remove('active', 'complete'));
    
    document.getElementById('overlay').style.display = 'none';
    generateButton.disabled = false;
    document.getElementById('progressOverlay').style.display = 'none';
  }
}

/**
 * Download All Library Images
 */
async function downloadAllLibraryImages() {
  const images = document.querySelectorAll('#libraryImages img');
  if (images.length === 0) {
    alert('Nėra vaizdų atsisiuntimui.');
    return;
  }
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const mimeType = img.dataset.type || 'image/png'; // Default to png if type not found
    const extension = mimeType.split('/')[1] || 'png';
    const seed = img.parentElement.querySelector('.caption strong:nth-child(4)').nextSibling.textContent.trim();
    const filename = `hexacola_image_${sanitizeFileName(seed)}.${extension}`;
    await downloadImage(img.src, filename, extension);
  }
}

/**
 * Update Progress Bar
 */
function updateProgressBar() {
  const progressBar = document.getElementById('progressOverlayBar');
  const progressPercentage = (generatedImagesCount / totalImages) * 100;
  progressBar.style.width = `${progressPercentage}%`;
  if (progressPercentage >= 100) {
    progressBar.style.backgroundColor = '#4caf50'; // Green when complete
  }
}

/**
 * Optimize Prompt using Pollinations.AI API
 * @param {string} prompt - Prompt to optimize
 * @returns {string} - Optimized prompt
 */
async function optimizePrompt(prompt) {
  try {
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      mode: 'cors', // Changed from default to explicit cors
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are hexacola background and character generator for AI art' },
          { role: 'user', content: prompt }
        ],
        model: 'openai',
        seed: Math.floor(Math.random() * 100000),
        jsonMode: false
      }),
    });

    // If the response is opaque (no-cors mode), return the original prompt
    if (!response.ok) {
      console.warn('API response not ok, using original prompt');
      return prompt;
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    }
    return prompt;
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    return prompt; // Return original prompt if optimization fails
  }
}

/**
 * Generate Random Prompt Function
 * @param {string} target - 'background' or 'character'
 * @param {string} style - Selected style
 * @param {Array} cameraFeatures - Selected camera features
 * @param {Array} colorSchemes - Selected color schemes
 * @returns {string} - Generated prompt
 */
async function generateRandomPromptFunction(target, style, cameraFeatures, colorSchemes) {
  let basePrompt = '';
  if (target === 'background') {
    basePrompt = 'Generate a completely random background, ensuring each response is unique and unpredictable. The setting should always feel fresh, with no repetition in themes, elements, or style for ai image generation.';
  } else if (target === 'character') {
    basePrompt = 'Create a fully random character, making sure every response is entirely distinct. The design, personality, and features must always change to keep the outcomes varied and imaginative for ai image generation';
  } else {
    throw new Error('Invalid target for prompt generation.');
  }

  // Integrate camera features and color schemes for top priority
  let enhancedPrompt = '';
  if (cameraFeatures.length > 0) {
    enhancedPrompt += `${cameraFeatures.join(', ')}, `;
  }
  if (colorSchemes.length > 0) {
    enhancedPrompt += `${colorSchemes.join(', ')}, `;
  }
  enhancedPrompt += basePrompt;

  const response = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are hexacola background and character generator for AI art' },
        { role: 'user', content: enhancedPrompt }
      ],
      model: 'openai', // Pollinations.AI default model
      seed: Math.floor(Math.random() * 100000),
      jsonMode: false
    }),
  });

  if (!response.ok) {
    throw new Error('Nepavyko susisiekti su AI paslauga.');
  }

  const data = await response.json();
  if (data.choices && data.choices.length > 0 && data.choices[0].message) {
    let generatedPrompt = data.choices[0].message.content;
    generatedPrompt = generatedPrompt.trim();

    // Apply style if selected
    if (style && style !== 'None') {
      generatedPrompt = appendStyleToPrompt(generatedPrompt, style);
    }

    return generatedPrompt;
  } else {
    throw new Error('Neteisingas AI atsakymas.');
  }
}

/**
 * Generate Random Prompt
 * @param {string} target - 'background' or 'character'
 */
async function generateRandomPrompt(target) {
  const style = document.getElementById('style').value;
  const selectedCameraFeatures = Array.from(document.querySelectorAll('#cameraFeaturesToggles button.active')).map(btn => btn.textContent);
  const selectedColorSchemes = Array.from(document.querySelectorAll('#colorSchemesToggles button.active')).map(btn => btn.textContent);
  const generateButtons = document.querySelectorAll('.generate-prompt');
  generateButtons.forEach(button => button.disabled = true); // Disable all prompt buttons during generation

  try {
    const prompt = await generateRandomPromptFunction(target, style, selectedCameraFeatures, selectedColorSchemes);
    if (target === 'background') {
      document.getElementById('backgroundPrompt').value = prompt;
    } else if (target === 'character') {
      document.getElementById('characterPrompt').value = prompt;
    }
    alert(`Sėkmingai sugeneruotas ${target} aprašymas!`);
  } catch (error) {
    console.error(error);
    alert('Klaida generuojant aprašymą. Bandykite dar kartą.');
  } finally {
    generateButtons.forEach(button => button.disabled = false); // Re-enable buttons after generation
  }
}

/**
 * Append Style to Prompt
 * @param {string} prompt - Original prompt
 * @param {string} style - Selected style
 * @returns {string} - Prompt with appended style
 */
function appendStyleToPrompt(prompt, style) {
  const styleDescriptions = {
    'Film': `${prompt}, cinematic masterpiece, shot with an anamorphic 35mm lens, ultra-wide aspect ratio, natural film grain, rich and moody cinematic color palette, deep contrast, dynamic range, soft and detailed lighting, natural bokeh, shallow depth of field, evocative storytelling, authentic vintage film aesthetics, timeless Hollywood style`,
    'Pixel Art': `${prompt}, in classic pixel art style, inspired by retro games like Final Fantasy and Chrono Trigger, 16-bit aesthetic, carefully crafted pixel details, balanced color palette, nostalgic and vibrant tones, smooth shading, and authentic retro charm`,
    'Anime': `${prompt}, in anime style inspired by classics like Attack on Titan and Demon Slayer, vivid and dynamic compositions, vibrant yet harmonious color schemes, expressive and detailed character designs, dramatic lighting, intricate line work, fluid motion elements, and a cinematic anime atmosphere`,
    'Realistic': `${prompt}, in hyper-realistic style, photorealistic details, meticulously rendered textures, lifelike proportions, dynamic and natural lighting, realistic depth of field, authentic environments, nuanced color grading, and true-to-life materials`,
    'Storyboard': `${prompt}, in hand-drawn black-and-white storyboard style, rough pencil sketch aesthetic, emphasizing composition, perspective, and dynamic camera angles, clear character blocking, cinematic framing, sequential flow, and annotations for action and dialogue cues`,
    'Film Noir': `${prompt}, in classic film noir style, high contrast black-and-white imagery, dramatic chiaroscuro lighting, deep shadows, atmospheric fog, urban backdrops, vintage aesthetics, fedoras and trench coats, suspenseful mood, and intense character expressions`,
    'Vintage': `${prompt}, in vintage style, muted and earthy color palette, soft film grain, faded textures, timeless composition, delicate vignetting, nostalgic atmosphere, classic typography, and retro-inspired design elements`,
    'Graphic Design': `${prompt}, in modern graphic design style, clean and balanced layouts, bold typography, striking color palettes, geometric shapes, high contrast, minimalist aesthetics, layered compositions, and visually compelling visuals tailored for branding or digital media`,
    'Cartoon': `${prompt}, in Cartoon Network-inspired style, bold and dynamic outlines, exaggerated yet balanced proportions, quirky character designs, vibrant and contrasting color palettes, playful and expressive animations, simplified but impactful backgrounds, lighthearted tone, and a touch of surreal humor reminiscent of shows like Adventure Time, The Amazing World of Gumball, and Dexter's Laboratory`,
    'Watercolor': `${prompt}, in delicate watercolor painting style, soft brush strokes, pastel and muted tones, organic textures, flowing gradients, and a dreamy, artistic atmosphere reminiscent of classic hand-painted illustrations`,
    'Surrealism': `${prompt}, in surreal style, dreamlike imagery, abstract forms, unconventional compositions, and a blend of reality and imagination, reminiscent of Salvador Dalí's artworks`,
    'Comics Style': `${prompt}, in vibrant comics style, bold black outlines, dynamic panel compositions, expressive character poses, exaggerated proportions, halftone patterns, action-packed scenes, vibrant primary colors, dramatic speech bubbles, and a storytelling aesthetic reminiscent of Marvel and DC classics`,
    'Mix': appendMixStyleToPrompt(prompt)
  };
  return styleDescriptions[style] || prompt;
}

/**
 * Get Random Styles for Mix
 * @returns {string} - Two different random styles
 */
function getRandomStyles() {
  const styles = ['Film', 'Pixel Art', 'Anime', 'Realistic', 'Storyboard', 'Film Noir', 'Vintage', 'Graphic Design', 'Cartoon', 'Watercolor', 'Surrealism', 'Comics Style'];
  let first = styles[Math.floor(Math.random() * styles.length)];
  let second = styles[Math.floor(Math.random() * styles.length)];
  while (second === first) {
    second = styles[Math.floor(Math.random() * styles.length)];
  }
  return `${first} and ${second}`;
}

/**
 * Append Mix Style to Prompt
 * @param {string} prompt - Original prompt
 * @returns {string} - Prompt with mixed styles
 */
function appendMixStyleToPrompt(prompt) {
  const randomStyles = getRandomStyles();
  return `${prompt}, in ${randomStyles} styles, combining elements from both styles for a unique and engaging image`;
}

/**
 * Modal Configuration
 */
function setupModal() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeBtn = document.getElementsByClassName("close")[0];

  // Close modal
  closeBtn.onclick = function() { 
    modal.style.display = "none";
  }

  // Close modal when clicking outside the image
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  // Open modal on image click (Generator)
  document.getElementById('generatedImage').addEventListener('click', function(event) {
    if(event.target.tagName === 'IMG') {
      modal.style.display = "block";
      modalImg.src = event.target.src;
    }
  });

  // Open modal on image click (Library)
  document.getElementById('libraryImages').addEventListener('click', function(event) {
    if(event.target.tagName === 'IMG') {
      modal.style.display = "block";
      modalImg.src = event.target.src;
    }
  });
}

/**
 * Save Image to localStorage
 * @param {string} url - Image URL
 * @param {string} prompt - Image prompt
 * @param {string} model - Model used
 * @param {string} width - Image width
 * @param {string} height - Image height
 * @param {string|number} seed - Seed used
 * @param {string} mimeType - Image MIME type
 */
function saveImage(url, prompt, model, width, height, seed, mimeType) {
  let images = JSON.parse(localStorage.getItem('generatedImages')) || [];
  images.push({ url, prompt, model, width, height, seed, mimeType });
  localStorage.setItem('generatedImages', JSON.stringify(images));
}

/**
 * Load Generated Images from localStorage
 */
function loadGeneratedImages() {
  let images = JSON.parse(localStorage.getItem('generatedImages')) || [];
  images.forEach(image => {
    addImageToGallery(image.url, image.prompt, image.model, image.width, image.height, image.seed, image.mimeType);
  });
}

/**
 * Add Image to Gallery
 * @param {string} url - Image URL
 * @param {string} prompt - Image prompt
 * @param {string} model - Model used
 * @param {string} width - Image width
 * @param {string} height - Image height
 * @param {string|number} seed - Seed used
 * @param {string} mimeType - Image MIME type
 */
function addImageToGallery(url, prompt, model, width, height, seed, mimeType) {
  const generatedImageDiv = document.getElementById('generatedImage');
  const imageContainer = document.createElement('div');
  imageContainer.classList.add('image-container');

  const imgElement = document.createElement('img');
  imgElement.src = url;
  imgElement.alt = 'Generated Image';
  imgElement.title = 'Press to enlarge';
  imgElement.dataset.type = mimeType; // Store MIME type for correct file extension
  imageContainer.appendChild(imgElement);

  // Add caption
  const caption = document.createElement('div');
  caption.classList.add('caption');
  caption.innerHTML = `
    <strong>Prompt:</strong> ${sanitizeHTML(prompt)}<br>
    <strong>Model:</strong> ${sanitizeHTML(model)}<br>
    <strong>Dimensions:</strong> ${sanitizeHTML(width)}px x ${sanitizeHTML(height)}px<br>
    <strong>Seed:</strong> ${sanitizeHTML(seed)}
  `;
  imageContainer.appendChild(caption);

  // Add download options
  const downloadOptions = document.createElement('div');
  downloadOptions.classList.add('download-options');

  const formatSelect = document.createElement('select');
  formatSelect.innerHTML = `
    <option value="png">PNG</option>
    <option value="jpg">JPG</option>
    <option value="webp">WEBP</option>
  `;
  downloadOptions.appendChild(formatSelect);

  const downloadBtn = document.createElement('button');
  downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
  downloadBtn.setAttribute('aria-label', 'Download Image');
  downloadBtn.onclick = () => {
    const format = formatSelect.value;
    downloadImage(url, `hexacola_image_${sanitizeFileName(seed)}.${format}`, format);
  };
  downloadOptions.appendChild(downloadBtn);

  imageContainer.appendChild(downloadOptions);

  generatedImageDiv.appendChild(imageContainer);
}

/**
 * Chat Functionality
 */
async function sendMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  if (message === '') return;

  appendMessage('user', message);
  chatInput.value = '';

  try {
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      mode: 'cors',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are hexacola background and character generator for AI art'},
          { role: 'user', content: message }
        ],
        model: 'openai', // Pollinations.AI default model
        seed: Math.floor(Math.random() * 100000),
        jsonMode: false
      }),
    });

    if (!response.ok) {
      throw new Error('Could not connect to AI service.');
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      appendMessage('assistant', data.choices[0].message.content);
    } else {
      throw new Error('Invalid AI response.');
    }
  } catch (error) {
    console.error(error);
    appendMessage('assistant', 'Error communicating with HEXACOLA.AI. Please try again.');
  }
}

/**
 * Append Message to Chat
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message content
 */
function appendMessage(role, content) {
  const chat = document.getElementById('chat');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message', role);
  messageDiv.textContent = content;
  chat.appendChild(messageDiv);
  chat.scrollTop = chat.scrollHeight;
}

/**
 * Disable Right-Click and Dragging on Images
 */
function disableImageDownload() {
  const images = document.querySelectorAll('.generated-image img, .library-container img');
  images.forEach(img => {
    img.oncontextmenu = (e) => e.preventDefault();
    img.draggable = false;
  });
}

// Call disableImageDownload after loading images
document.addEventListener('DOMContentLoaded', () => {
  disableImageDownload();
});

/**
 * Initialize Negative Prompt with default text if empty
 */
function initializeNegativePrompt() {
  const negativePrompt = document.getElementById('negativePrompt');
  if (!negativePrompt.value) {
    negativePrompt.value = "low quality, blurry, bad anatomy, out of focus, noise, duplicate, watermark, text, ugly, messy";
  }
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} str - Input string
 * @returns {string} - Sanitized string
 */
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

function addEventListeners() {
    // Image modal events
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close');

    // Close modal when clicking close button
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
        if (e.key === 'Enter' && e.ctrlKey) {
            generateImage();
        }
    });

    // Input validation for width and height
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const imageOptionsInput = document.getElementById('imageOptions');

    [widthInput, heightInput].forEach(input => {
        input.addEventListener('change', () => {
            const value = parseInt(input.value);
            if (value < 64) input.value = 64;
            if (value > 2048) input.value = 2048;
        });
    });

    // Validate number of images
    imageOptionsInput.addEventListener('change', () => {
        const value = parseInt(imageOptionsInput.value);
        if (value < 1) imageOptionsInput.value = 1;
        if (value > 10) imageOptionsInput.value = 10;
    });
}
