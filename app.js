document.getElementById('add-descriptor').addEventListener('click', addDescriptor);
document.getElementById('add-variant').addEventListener('click', addVariants);

let descriptors = [];

// Function to handle adding a descriptor
function addDescriptor() {
  console.log('Add Descriptor button clicked'); // Check if button works
  const descriptorName = document.getElementById('descriptor-name').value;
  
  if (!descriptorName) {
    alert('Please enter a descriptor name.');
    return;
  }

  // Create a descriptor object and add it to the list
  const descriptor = { name: descriptorName, variants: [] };
  descriptors.push(descriptor);
  document.getElementById('descriptor-name').value = ''; // Clear input field

  document.getElementById('variant-section').style.display = 'block'; // Show variant section
  updateDescriptorList();
}

// Function to handle adding variants to the latest descriptor
function addVariants() {
  console.log('Add Variants button clicked'); // Check if button works
  const variantsInput = document.getElementById('manual-variants').value.trim();
  
  if (!variantsInput) {
    alert('Please enter at least one variant.');
    return;
  }

  // Split the variant input and add to the latest descriptor
  const latestDescriptor = descriptors[descriptors.length - 1];
  const variants = variantsInput.split(',').map(v => v.trim());
  variants.forEach(variant => latestDescriptor.variants.push({ name: variant }));

  document.getElementById('manual-variants').value = ''; // Clear input field
  updateVariantList();
}

// Function to update the descriptor list
function updateDescriptorList() {
  const descriptorList = document.getElementById('descriptor-list');
  descriptorList.innerHTML = ''; // Clear existing list
  
  descriptors.forEach((descriptor, index) => {
    const descriptorDiv = document.createElement('div');
    descriptorDiv.textContent = `Descriptor ${index + 1}: ${descriptor.name}`;
    descriptorList.appendChild(descriptorDiv);
  });
}

// Function to update the variant list
function updateVariantList() {
  const variantList = document.getElementById('variant-list');
  variantList.innerHTML = ''; // Clear existing list
  
  const latestDescriptor = descriptors[descriptors.length - 1];
  latestDescriptor.variants.forEach((variant, index) => {
    const variantDiv = document.createElement('div');
    variantDiv.textContent = `Variant ${index + 1}: ${variant.name}`;
    variantList.appendChild(variantDiv);
  });
}
