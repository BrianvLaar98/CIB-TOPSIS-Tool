document.getElementById('add-descriptor').addEventListener('click', addDescriptor);
document.getElementById('add-variant').addEventListener('click', addVariants);

let descriptors = [];

function addDescriptor() {
  const descriptorName = document.getElementById('descriptor-name').value;
  if (!descriptorName) {
    alert('Please enter a descriptor name.');
    return;
  }

  const descriptor = { name: descriptorName, variants: [] };
  descriptors.push(descriptor);
  document.getElementById('descriptor-name').value = '';
  document.getElementById('variant-section').style.display = 'block';
  updateDescriptorList();
}

function addVariants() {
  const variantsInput = document.getElementById('manual-variants').value.trim();
  if (!variantsInput) {
    alert('Please enter at least one variant.');
    return;
  }

  const latestDescriptor = descriptors[descriptors.length - 1];
  const variants = variantsInput.split(',').map(v => v.trim());
  variants.forEach(variant => latestDescriptor.variants.push({ name: variant }));

  document.getElementById('manual-variants').value = '';
  updateVariantList();
}

function updateDescriptorList() {
  const descriptorList = document.getElementById('descriptor-list');
  descriptorList.innerHTML = '';
  descriptors.forEach((descriptor, index) => {
    const descriptorDiv = document.createElement('div');
    descriptorDiv.textContent = `Descriptor ${index + 1}: ${descriptor.name}`;
    descriptorList.appendChild(descriptorDiv);
  });
}

function updateVariantList() {
  const variantList = document.getElementById('variant-list');
  variantList.innerHTML = '';
  const latestDescriptor = descriptors[descriptors.length - 1];
  latestDescriptor.variants.forEach((variant, index) => {
    const variantDiv = document.createElement('div');
    variantDiv.textContent = `Variant ${index + 1}: ${variant.name}`;
    variantList.appendChild(variantDiv);
  });
}
