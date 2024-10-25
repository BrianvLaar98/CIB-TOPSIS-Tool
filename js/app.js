document.getElementById('add-descriptor').addEventListener('click', addDescriptor);
let descriptors = [];
let matrix = [];

// Function to handle adding descriptors
function addDescriptor() {
  const name = document.getElementById('descriptor-name').value;
  const useRange = document.getElementById('use-range').checked;

  if (!name) {
    alert('Please provide a descriptor name.');
    return;
  }

  let descriptor = {
    name: name,
    variants: []
  };

  if (useRange) {
    const minValue = parseFloat(document.getElementById('min-value').value);
    const maxValue = parseFloat(document.getElementById('max-value').value);
    const numVariants = parseInt(document.getElementById('num-variants').value);

    if (isNaN(minValue) || isNaN(maxValue) || numVariants <= 0) {
      alert('Please provide valid range values and number of variants.');
      return;
    }

    for (let i = 0; i < numVariants; i++) {
      const variantValue = minValue + (maxValue - minValue) * (i / (numVariants - 1));
      descriptor.variants.push(variantValue.toFixed(2));
    }
  } else {
    const variantsInput = document.getElementById('manual-variants').value.trim();
    if (!variantsInput) {
      alert('Please enter at least one variant.');
      return;
    }

    descriptor.variants = variantsInput.split(',').map(variant => variant.trim());
  }

  descriptors.push(descriptor);
  updateDescriptorList();
  updateMatrix();
  clearFormFields();
}

// Function to clear form fields after adding a descriptor
function clearFormFields() {
  document.getElementById('descriptor-name').value = '';
  document.getElementById('min-value').value = '';
  document.getElementById('max-value').value = '';
  document.getElementById('num-variants').value = 5;
  document.getElementById('manual-variants').value = '';
}

// Function to update the displayed descriptor list
function updateDescriptorList() {
  const list = document.getElementById('descriptor-list');
  list.innerHTML = '';
  descriptors.forEach(descriptor => {
    const li = document.createElement('li');
    li.textContent = `${descriptor.name}: Variants [${descriptor.variants.join(', ')}]`;
    list.appendChild(li);
  });
}

// Function to update the cross-impact balance matrix
function updateMatrix() {
  const matrixEditor = document.getElementById('matrix-editor');
  matrixEditor.innerHTML = '';

  if (matrix.length !== descriptors.length) {
    matrix = Array.from({ length: descriptors.length }, () => Array(descriptors.length).fill(0));
  }

  const table = document.createElement('table');
  descriptors.forEach((_, i) => {
    const row = document.createElement('tr');
    descriptors.forEach((_, j) => {
      const cell = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.value = matrix[i][j];
      input.addEventListener('input', function () {
        matrix[i][j] = parseFloat(this.value);
      });
      cell.appendChild(input);
      row.appendChild(cell);
    });
    table.appendChild(row);
  });
  matrixEditor.appendChild(table);
}

// Event listener for generating scenarios
document.getElementById('generate-scenarios').addEventListener('click', generateScenarios);

function generateScenarios() {
  const scenarioList = document.getElementById('scenario-list');
  scenarioList.innerHTML = '';

  descriptors.forEach((descriptor, index) => {
    const scenario = `${descriptor.name}: ${descriptor.variants[0]} (Min), ${descriptor.variants[descriptor.variants.length - 1]} (Max)`;
    const consistencyValue = calculateConsistency(index);
    const li = document.createElement('li');
    li.textContent = `${scenario} - Consistency: ${consistencyValue.toFixed(2)}`;
    scenarioList.appendChild(li);
  });
}

// Function to calculate consistency based on the CIB cross-impact matrix
function calculateConsistency(descriptorIndex) {
  let consistencySum = 0;

  descriptors.forEach((_, otherIndex) => {
    if (descriptorIndex !== otherIndex) {
      consistencySum += matrix[descriptorIndex][otherIndex];
    }
  });

  const maxPossibleSum = descriptors.length * 3;
  const normalizedConsistency = (consistencySum + maxPossibleSum) / (2 * maxPossibleSum);
  return normalizedConsistency * 100;
}

// Event listener for ranking scenarios
document.getElementById('rank-scenarios').addEventListener('click', rankScenarios);

function rankScenarios() {
  const rankedScenarios = document.getElementById('ranked-scenarios');
  rankedScenarios.innerHTML = '';

  const scenarios = ['Scenario 1', 'Scenario 2', 'Scenario 3'];
  const sortedScenarios = scenarios.sort();

  sortedScenarios.forEach(scenario => {
    const li = document.createElement('li');
    li.textContent = scenario;
    rankedScenarios.appendChild(li);
  });
}

// Show or hide manual entry fields depending on the chosen option
document.getElementById('use-range').addEventListener('change', toggleVariantInput);
document.getElementById('use-manual').addEventListener('change', toggleVariantInput);

function toggleVariantInput() {
  const useRange = document.getElementById('use-range').checked;
  document.getElementById('range-inputs').style.display = useRange ? 'block' : 'none';
  document.getElementById('manual-inputs').style.display = useRange ? 'none' : 'block';
}
