let descriptors = [];
let matrixData = [];
let consistencyValue = 0;
let ahpWeights = {};

// Add a new descriptor
document.getElementById('add-descriptor').addEventListener('click', addDescriptor);

function addDescriptor() {
    const descriptorName = prompt('Enter Descriptor Name');
    if (!descriptorName) return;

    descriptors.push({ name: descriptorName, variants: [], minValue: 0, maxValue: 100 });
    updateDescriptorTable();
}

// Update the descriptor table to allow modification
function updateDescriptorTable() {
    const tableBody = document.querySelector('#descriptor-table tbody');
    tableBody.innerHTML = '';
    
    descriptors.forEach((desc, index) => {
        const row = document.createElement('tr');
        
        // Descriptor Name
        const nameCell = document.createElement('td');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = desc.name;
        nameInput.addEventListener('change', (e) => desc.name = e.target.value);
        nameCell.appendChild(nameInput);
        row.appendChild(nameCell);
        
        // Variants
        const variantCell = document.createElement('td');
        const variantInput = document.createElement('input');
        variantInput.type = 'text';
        variantInput.value = desc.variants.join(', ');
        variantInput.placeholder = 'Comma-separated';
        variantInput.addEventListener('change', (e) => desc.variants = e.target.value.split(',').map(v => v.trim()));
        variantCell.appendChild(variantInput);
        row.appendChild(variantCell);

        // Min Value
        const minCell = document.createElement('td');
        const minInput = document.createElement('input');
        minInput.type = 'number';
        minInput.value = desc.minValue;
        minInput.addEventListener('change', (e) => desc.minValue = parseFloat(e.target.value));
        minCell.appendChild(minInput);
        row.appendChild(minCell);

        // Max Value
        const maxCell = document.createElement('td');
        const maxInput = document.createElement('input');
        maxInput.type = 'number';
        maxInput.value = desc.maxValue;
        maxInput.addEventListener('change', (e) => desc.maxValue = parseFloat(e.target.value));
        maxCell.appendChild(maxInput);
        row.appendChild(maxCell);
        
        // Actions
        const actionCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            descriptors.splice(index, 1);
            updateDescriptorTable();
            generateCrossImpactMatrix();
        });
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        
        tableBody.appendChild(row);
    });
    
    generateCrossImpactMatrix();
    generateAHPWeights();
}

// Generate the cross-impact matrix
function generateCrossImpactMatrix() {
    const matrixDiv = document.getElementById('cross-impact-matrix');
    matrixDiv.innerHTML = '';

    if (descriptors.length === 0) return;

    let table = document.createElement('table');
    let headerRow = document.createElement('tr');
    let emptyCell = document.createElement('th');
    headerRow.appendChild(emptyCell);

    // Create headers for columns (variants)
    descriptors.forEach(desc => {
        desc.variants.forEach(variant => {
            let headerCell = document.createElement('th');
            headerCell.innerText = `${desc.name}: ${variant}`;
            headerRow.appendChild(headerCell);
        });
    });
    table.appendChild(headerRow);

    // Create matrix rows (with disabled same descriptor cells)
    descriptors.forEach((descRow, rowIndex) => {
        descRow.variants.forEach(variantRow => {
            let row = document.createElement('tr');
            let rowHeader = document.createElement('th');
            rowHeader.innerText = `${descRow.name}: ${variantRow}`;
            row.appendChild(rowHeader);

            descriptors.forEach((descCol, colIndex) => {
                descCol.variants.forEach(variantCol => {
                    let cell = document.createElement('td');
                    let input = document.createElement('input');
                    input.type = 'number';
                    input.value = 0;

                    if (rowIndex === colIndex) {
                        input.disabled = true;
                        cell.classList.add('cross-impact-disabled');
                    }

                    input.addEventListener('change', (e) => {
                        const value = e.target.value;
                        updateMatrixData(descRow.name, variantRow, descCol.name, variantCol, value);
                    });

                    cell.appendChild(input);
                    row.appendChild(cell);
                });
            });

            table.appendChild(row);
        });
    });

    matrixDiv.appendChild(table);
}

// Store matrix data
function updateMatrixData(descRow, variantRow, descCol, variantCol, value) {
    let existingData = matrixData.find(data => data.descRow === descRow && data.variantRow === variantRow && data.descCol === descCol && data.variantCol === variantCol);
    
    if (existingData) {
        existingData.value = value;
    } else {
        matrixData.push({ descRow, variantRow, descCol, variantCol, value });
    }
}

// Handle consistency value change
document.getElementById('consistency-value').addEventListener('input', (e) => {
    consistencyValue = e.target.value;
});

// Generate consistent scenarios
document.getElementById('generate-scenarios').addEventListener('click', generateConsistentScenarios);

// Generate consistent scenarios based on the matrix and consistency value
function generateConsistentScenarios() {
    let scenarios = [];

    descriptors.forEach(descRow => {
        descRow.variants.forEach(variantRow => {
            let scenario = { descriptor: descRow.name, variant: variantRow, impactSum: 0 };
            
            matrixData.forEach(data => {
                if (data.descRow === descRow.name && data.variantRow === variantRow) {
                    scenario.impactSum += parseInt(data.value);
                }
            });

            if (scenario.impactSum >= consistencyValue) {
                scenarios.push(scenario);
            }
        });
    });

    displayScenarioTable(scenarios);
}

// Display the consistent scenario table
function displayScenarioTable(scenarios) {
    const scenarioTable = document.getElementById('scenario-table');
    scenarioTable.innerHTML = '';

    let headerRow = document.createElement('tr');
    let descHeader = document.createElement('th');
    descHeader.innerText = 'Descriptor';
    let variantHeader = document.createElement('th');
    variantHeader.innerText = 'Variant';
    let impactHeader = document.createElement('th');
    impactHeader.innerText = 'Impact Sum';

    headerRow.appendChild(descHeader);
    headerRow.appendChild(variantHeader);
    headerRow.appendChild(impactHeader);
    scenarioTable.appendChild(headerRow);

    scenarios.forEach(scenario => {
        let row = document.createElement('tr');
        let descCell = document.createElement('td');
        descCell.innerText = scenario.descriptor;
        let variantCell = document.createElement('td');
        variantCell.innerText = scenario.variant;
        let impactCell = document.createElement('td');
        impactCell.innerText = scenario.impactSum;

        row.appendChild(descCell);
        row.appendChild(variantCell);
        row.appendChild(impactCell);
        scenarioTable.appendChild(row);
    });
}

// Generate sliders for weighting descriptors (AHP Method)
function generateAHPWeights() {
    const ahpSlidersDiv = document.getElementById('ahp-sliders');
    ahpSlidersDiv.innerHTML = '';

    descriptors.forEach((desc, index) => {
        let label = document.createElement('label');
        label.innerText = `${desc.name} Weight: `;
        let slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '1';
        slider.step = '0.01';
        slider.value = '0.5';
        slider.addEventListener('input', (e) => {
            ahpWeights[desc.name] = parseFloat(e.target.value);
        });

        ahpWeights[desc.name] = 0.5; // default weight

        label.appendChild(slider);
        ahpSlidersDiv.appendChild(label);
    });
}

// Rank scenarios based on TOPSIS method and AHP weights
document.getElementById('rank-scenarios').addEventListener('click', rankScenarios);

function rankScenarios() {
    // Normalize the data using TOPSIS
    let normalizedScenarios = normalizeScenarios();
    let rankedScenarios = normalizedScenarios.sort((a, b) => b.score - a.score);

    // Display the ranked scenarios
    const rankedScenariosList = document.getElementById('ranked-scenarios');
    rankedScenariosList.innerHTML = '';
    rankedScenarios.forEach((scenario, index) => {
        let li = document.createElement('li');
        li.textContent = `Rank ${index + 1}: ${scenario.descriptor} - ${scenario.variant} (Score: ${scenario.score.toFixed(2)})`;
        rankedScenariosList.appendChild(li);
    });
}

// Normalize scenarios and apply TOPSIS ranking
function normalizeScenarios() {
    let minMaxValues = {};

    // Calculate min and max for each descriptor
    descriptors.forEach(desc => {
        let minVal = Math.min(...desc.variants.map(v => parseFloat(v)));
        let maxVal = Math.max(...desc.variants.map(v => parseFloat(v)));
        minMaxValues[desc.name] = { min: minVal, max: maxVal };
    });

    // Normalize each scenario
    let normalizedScenarios = [];
    matrixData.forEach(scenario => {
        let normalizedScore = 0;
        let totalWeight = 0;

        descriptors.forEach(desc => {
            let variantValue = parseFloat(scenario.variant);
            let weight = ahpWeights[desc.name];
            let normalizedValue = (variantValue - minMaxValues[desc.name].min) / (minMaxValues[desc.name].max - minMaxValues[desc.name].min);

            normalizedScore += normalizedValue * weight;
            totalWeight += weight;
        });

        normalizedScenarios.push({
            descriptor: scenario.descRow,
            variant: scenario.variantRow,
            score: normalizedScore / totalWeight
        });
    });

    return normalizedScenarios;
}
