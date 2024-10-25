// Define variables for descriptors and variants
let descriptors = [];
let matrixData = [];
let consistencyValue = 0;

// Handle adding descriptors and variants
document.getElementById('add-descriptor').addEventListener('click', addDescriptor);

// Function to add descriptor
function addDescriptor() {
    const descriptorName = prompt('Enter Descriptor Name');
    if (!descriptorName) return;

    const variantCount = prompt('How many variants does this descriptor have?');
    let variants = [];
    for (let i = 0; i < variantCount; i++) {
        const variantName = prompt(`Enter name for Variant ${i + 1}`);
        variants.push(variantName);
    }

    descriptors.push({ name: descriptorName, variants: variants });
    updateDescriptorList();
    generateCrossImpactMatrix();
}

// Update list of descriptors
function updateDescriptorList() {
    const listDiv = document.getElementById('descriptor-list');
    listDiv.innerHTML = '';
    descriptors.forEach((desc, index) => {
        let descDiv = document.createElement('div');
        descDiv.innerText = `${index + 1}. ${desc.name}: ${desc.variants.join(', ')}`;
        listDiv.appendChild(descDiv);
    });
}

// Generate Cross-Impact Matrix dynamically
function generateCrossImpactMatrix() {
    const matrixDiv = document.getElementById('cross-impact-matrix');
    matrixDiv.innerHTML = '';
    
    if (descriptors.length === 0) return;
    
    let table = document.createElement('table');
    let headerRow = document.createElement('tr');
    let emptyCell = document.createElement('th');
    headerRow.appendChild(emptyCell);
    
    // Create headers for the table
    descriptors.forEach(desc => {
        desc.variants.forEach(variant => {
            let headerCell = document.createElement('th');
            headerCell.innerText = `${desc.name}: ${variant}`;
            headerRow.appendChild(headerCell);
        });
    });
    table.appendChild(headerRow);
    
    // Create the matrix cells
    descriptors.forEach(descRow => {
        descRow.variants.forEach(variantRow => {
            let row = document.createElement('tr');
            let rowHeader = document.createElement('th');
            rowHeader.innerText = `${descRow.name}: ${variantRow}`;
            row.appendChild(rowHeader);
            
            descriptors.forEach(descCol => {
                descCol.variants.forEach(variantCol => {
                    let cell = document.createElement('td');
                    let input = document.createElement('input');
                    input.type = 'number';
                    input.value = 0;
                    input.addEventListener('change', (e) => updateMatrixData(descRow.name, variantRow, descCol.name, variantCol, e.target.value));
                    cell.appendChild(input);
                    row.appendChild(cell);
                });
            });
            table.appendChild(row);
        });
    });
    matrixDiv.appendChild(table);
}

// Store impact values in matrixData
function updateMatrixData(descRow, variantRow, descCol, variantCol, value) {
    matrixData.push({ descRow, variantRow, descCol, variantCol, value });
}

// Handle consistency value change
document.getElementById('consistency-value').addEventListener('input', (e) => {
    consistencyValue = e.target.value;
});

// Generate consistent scenarios
document.getElementById('generate-scenarios').addEventListener('click', generateConsistentScenarios);

// Logic for generating consistent scenarios
function generateConsistentScenarios() {
    let scenarios = [];
    descriptors.forEach(descRow => {
        descRow.variants.forEach(variantRow => {
            let isConsistent = true;
            let scenario = { descriptor: descRow.name, variant: variantRow, impactSum: 0 };
            
            // Calculate impact sums
            matrixData.forEach(data => {
                if (data.descRow === descRow.name && data.variantRow === variantRow) {
                    scenario.impactSum += parseInt(data.value);
                }
            });

            // Consistency check
            if (scenario.impactSum < consistencyValue) {
                isConsistent = false;
            }

            if (isConsistent) {
                scenarios.push(scenario);
            }
        });
    });

    displayScenarioTable(scenarios);
}

// Display consistent scenarios in tableau
function displayScenarioTable(scenarios) {
    const scenarioTable = document.getElementById('scenario-table');
    scenarioTable.innerHTML = '';
    
    let headerRow = document.createElement('tr');
    let headerDesc = document.createElement('th');
    headerDesc.innerText = 'Descriptor';
    let headerVariant = document.createElement('th');
    headerVariant.innerText = 'Variant';
    let headerImpact = document.createElement('th');
    headerImpact.innerText = 'Impact Sum';
    
    headerRow.appendChild(headerDesc);
    headerRow.appendChild(headerVariant);
    headerRow.appendChild(headerImpact);
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
