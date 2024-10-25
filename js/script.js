let descriptors = [];
let matrixData = [];
let consistencyValue = 0;
let ahpWeights = {};
let colorPalette = ['#3498db', '#e74c3c', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c', '#34495e'];

// Add a new descriptor
document.getElementById('add-descriptor').addEventListener('click', addDescriptor);

function addDescriptor() {
    const descriptorName = prompt('Enter Descriptor Name');
    if (!descriptorName) return;

    descriptors.push({ name: descriptorName, variants: [] });
    updateDescriptorTable();
}

// Update the descriptor table to allow modification
function updateDescriptorTable() {
    const listDiv = document.getElementById('descriptor-list');
    listDiv.innerHTML = '';
    
    descriptors.forEach((desc, index) => {
        const descDiv = document.createElement('div');
        descDiv.classList.add('descriptor-item');

        const header = document.createElement('h3');
        header.innerText = desc.name;
        descDiv.appendChild(header);

        const variantList = document.createElement('div');
        variantList.classList.add('variant-list');

        const addVariantButton = document.createElement('button');
        addVariantButton.textContent = 'Add Variant';
        addVariantButton.addEventListener('click', () => addVariant(desc, variantList));
        descDiv.appendChild(addVariantButton);

        desc.variants.forEach(variant => {
            addVariantRow(variantList, desc, variant);
        });

        descDiv.appendChild(variantList);
        descDiv.style.backgroundColor = colorPalette[index % colorPalette.length]; // Color by descriptor
        descDiv.classList.add('variant-color');
        listDiv.appendChild(descDiv);
    });

    generateCrossImpactMatrix();
    generateAHPWeights();
}

// Add a new variant row
function addVariant(descriptor, variantList) {
    const variantName = prompt('Enter Variant Name');
    if (!variantName) return;

    descriptor.variants.push(variantName);
    addVariantRow(variantList, descriptor, variantName);
    generateCrossImpactMatrix();
}

function addVariantRow(variantList, descriptor, variantName) {
    const row = document.createElement('div');
    row.classList.add('variant-row');
    row.innerText = variantName;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        const index = descriptor.variants.indexOf(variantName);
        if (index > -1) descriptor.variants.splice(index, 1);
        variantList.removeChild(row);
        generateCrossImpactMatrix();
    });

    row.appendChild(deleteButton);
    variantList.appendChild(row);
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
                        colorMatrixCell(cell, value);
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

// Color the matrix cell based on the value
function colorMatrixCell(cell, value) {
    cell.className = ''; // Reset class
    if (value == 0) {
        cell.classList.add('cross-impact-value0');
    } else if (value > 0) {
        cell.classList.add(`cross-impact-value${Math.min(value, 3)}`);
    } else {
        cell.classList.add(`cross-impact-value${Math.max(value, -3)}`);
    }
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

    // Create scenario cards side-by-side
    scenarios.forEach(scenario => {
        let card = document.createElement('div');
        card.classList.add('scenario-card');
        card.innerText = `${scenario.descriptor}: ${scenario.variant}\nImpact Sum: ${scenario.impactSum}`;
        scenarioTable.appendChild(card);
    });
}
