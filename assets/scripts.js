document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    const smdCodeInput = document.getElementById('smdCode');
    const calculateSmdBtn = document.getElementById('calculateSmdBtn');
    const smdResistorVisualizer = document.getElementById('smdResistorVisualizer');

    const band1Select = document.getElementById('band1');
    const band2Select = document.getElementById('band2');
    const band3Select = document.getElementById('band3');
    const band4Select = document.getElementById('band4');
    const band5Select = document.getElementById('band5');
    const band6Select = document.getElementById('band6');
    const numBandsRadios = document.querySelectorAll('input[name="numBands"]');
    const fiveBandOptions = document.querySelectorAll('.five-band-option');
    const sixBandOption = document.querySelector('.six-band-option');

    const colorResistorVisualizer = document.getElementById('colorResistorVisualizer');
    const visualBands = {
        'band-1': colorResistorVisualizer.querySelector('.band-1'),
        'band-2': colorResistorVisualizer.querySelector('.band-2'),
        'band-3': colorResistorVisualizer.querySelector('.band-3'),
        'band-4': colorResistorVisualizer.querySelector('.band-4'),
        'band-5': colorResistorVisualizer.querySelector('.band-5'),
        'band-6': colorResistorVisualizer.querySelector('.band-6')
    };
    const calculateColorBtn = document.getElementById('calculateColorBtn');


    const resultOhmsSpan = document.getElementById('resultOhms');
    const resultKOhmSpan = document.getElementById('resultKOhm');
    const resultMOhmSpan = document.getElementById('resultMOhm');
    const toleranceValueSpan = document.getElementById('toleranceValue');
    const tempCoeffValueSpan = document.getElementById('tempCoeffValue');

    const colorValues = {
        'preto': 0, 'marrom': 1, 'vermelho': 2, 'laranja': 3, 'amarelo': 4,
        'verde': 5, 'azul': 6, 'violeta': 7, 'cinza': 8, 'branco': 9
    };

    const colorMultipliers = {
        'preto': 1, 'marrom': 10, 'vermelho': 100, 'laranja': 1000, 'amarelo': 10000,
        'verde': 100000, 'azul': 1000000, 'violeta': 10000000,
        'cinza': 100000000, 'branco': 1000000000,
        'ouro': 0.1, 'prata': 0.01
    };

    const colorTolerances = {
        'marrom': '±1%', 'vermelho': '±2%', 'verde': '±0.5%', 'azul': '±0.25%',
        'violeta': '±0.1%', 'cinza': '±0.05%',
        'ouro': '±5%', 'prata': '±10%', 'nenhuma': '±20%'
    };

    const tempCoefficients = {
        'marrom': '100 ppm/°C', 'vermelho': '50 ppm/°C', 'laranja': '15 ppm/°C',
        'amarelo': '25 ppm/°C', 'azul': '10 ppm/°C', 'violeta': '5 ppm/°C'
    };

    // Mapeamento de nome de cor para código CSS de cor
    const colorCssMap = {
        'preto': 'black', 'marrom': 'saddlebrown', 'vermelho': 'red', 'laranja': 'orange',
        'amarelo': 'yellow', 'verde': 'green', 'azul': 'blue', 'violeta': 'purple',
        'cinza': 'gray', 'branco': 'white', 'ouro': 'gold', 'prata': 'silver',
        'nenhuma': 'transparent',
        '': 'transparent' // Para lidar com opções vazias de dropdown
    };

    // --- Tabelas de Valores para Resistor SMD (já existentes) ---
    const eia96Values = {
        '01': 100, '02': 102, '03': 105, '04': 107, '05': 110, '06': 113, '07': 115, '08': 118, '09': 121, '10': 124,
        '11': 127, '12': 130, '13': 133, '14': 137, '15': 140, '16': 143, '17': 147, '18': 150, '19': 154, '20': 158,
        '21': 162, '22': 165, '23': 169, '24': 174, '25': 178, '26': 182, '27': 187, '28': 191, '29': 196, '30': 200,
        '31': 205, '32': 210, '33': 215, '34': 221, '35': 226, '36': 232, '37': 237, '38': 243, '39': 249, '40': 255,
        '41': 261, '42': 267, '43': 274, '44': 280, '45': 287, '46': 294, '47': 301, '48': 309, '49': 316, '50': 324,
        '51': 332, '52': 340, '53': 348, '54': 357, '55': 365, '56': 374, '57': 383, '58': 392, '59': 402, '60': 412,
        '61': 422, '62': 432, '63': 442, '64': 453, '65': 464, '66': 475, '67': 487, '68': 499, '69': 511, '70': 523,
        '71': 536, '72': 549, '73': 562, '74': 576, '75': 590, '76': 604, '77': 619, '78': 634, '79': 649, '80': 665,
        '81': 681, '82': 698, '83': 715, '84': 732, '85': 750, '86': 768, '87': 787, '88': 806, '89': 825, '90': 845,
        '91': 866, '92': 887, '93': 909, '94': 931, '95': 953, '96': 976
    };

    const eia96Multipliers = {
        'A': 1, 'B': 10, 'C': 100, 'D': 1000, 'E': 10000, 'F': 100000,
        'S': 0.1, 'R': 0.01
    };

    // --- Lógica das Abas ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;

            // Remove a classe 'active' de todos os botões e painéis
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Adiciona a classe 'active' ao botão clicado e ao painel correspondente
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            // Limpa os resultados e os visualizadores ao trocar de aba
            clearResults();
            if (tabId === 'smd') {
                updateColorResistorVisualizer(true); // Limpa o visualizador de cores
                smdCodeInput.value = ''; // Limpa o input SMD
                updateSmdVisualizer(''); // Limpa o visualizador SMD
            } else { // tabId === 'colors'
                updateSmdVisualizer(''); // Limpa o visualizador SMD
                // Re-inicializa a visibilidade e as cores do resistor por cores
                toggleBandVisibility(); // Isso também chama updateColorResistorVisualizer()
            }
        });
    });

    // --- Funções Auxiliares ---

    // Função para popular os dropdowns de cor
    function populateColorDropdown(selectElement, type) {
        let colors = [];
        if (type === 'value') {
            colors = Object.keys(colorValues);
        } else if (type === 'multiplier') {
            colors = Object.keys(colorMultipliers);
        } else if (type === 'tolerance') {
            colors = Object.keys(colorTolerances);
        } else if (type === 'tempCoeff') {
            colors = Object.keys(tempCoefficients);
        }

        selectElement.innerHTML = '<option value="">-- Selecione --</option>';
        colors.forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
            selectElement.appendChild(option);
        });
    }

    populateColorDropdown(band1Select, 'value');
    populateColorDropdown(band2Select, 'value');
    populateColorDropdown(band3Select, 'multiplier');
    populateColorDropdown(band4Select, 'tolerance');
    populateColorDropdown(band5Select, 'tolerance');
    populateColorDropdown(band6Select, 'tempCoeff');

    function toggleBandVisibility() {
        const selectedBands = document.querySelector('input[name="numBands"]:checked').value;

        band5Select.value = '';
        band6Select.value = '';

        populateColorDropdown(band1Select, 'value');
        populateColorDropdown(band2Select, 'value');

        if (selectedBands === '4') {
            fiveBandOptions.forEach(option => option.style.display = 'none');
            sixBandOption.style.display = 'none';

            populateColorDropdown(band3Select, 'multiplier');
            band3Select.previousElementSibling.textContent = 'Faixa 3 (Multiplicador):';
            populateColorDropdown(band4Select, 'tolerance');
            band4Select.previousElementSibling.textContent = 'Faixa 4 (Tolerância):';

        } else if (selectedBands === '5') {
            fiveBandOptions.forEach(option => option.style.display = 'flex');
            sixBandOption.style.display = 'none';

            populateColorDropdown(band3Select, 'value'); // 3ª faixa é dígito
            band3Select.previousElementSibling.textContent = 'Faixa 3 (Dígito):';
            populateColorDropdown(band4Select, 'multiplier'); // 4ª faixa é multiplicador
            band4Select.previousElementSibling.textContent = 'Faixa 4 (Multiplicador):';
            populateColorDropdown(band5Select, 'tolerance'); // 5ª faixa é tolerância
            band5Select.previousElementSibling.textContent = 'Faixa 5 (Tolerância):';

        } else if (selectedBands === '6') {
            fiveBandOptions.forEach(option => option.style.display = 'flex');
            sixBandOption.style.display = 'flex';

            populateColorDropdown(band3Select, 'value'); // 3ª faixa é dígito
            band3Select.previousElementSibling.textContent = 'Faixa 3 (Dígito):';
            populateColorDropdown(band4Select, 'multiplier'); // 4ª faixa é multiplicador
            band4Select.previousElementSibling.textContent = 'Faixa 4 (Multiplicador):';
            populateColorDropdown(band5Select, 'tolerance'); // 5ª faixa é tolerância
            band5Select.previousElementSibling.textContent = 'Faixa 5 (Tolerância):';
            populateColorDropdown(band6Select, 'tempCoeff'); // 6ª faixa é temp. coeff.
            band6Select.previousElementSibling.textContent = 'Faixa 6 (Temperatura):';
        }
        updateColorResistorVisualizer();
    }

    toggleBandVisibility();

    numBandsRadios.forEach(radio => {
        radio.addEventListener('change', toggleBandVisibility);
    });

    [band1Select, band2Select, band3Select, band4Select, band5Select, band6Select].forEach(select => {
        select.addEventListener('change', updateColorResistorVisualizer);
    });

    function formatNumber(num, precision) {
        if (typeof num !== 'number') return num;
        let formatted = num.toFixed(precision);
        if (formatted.includes('.')) {
            formatted = formatted.replace(/\.?0+$/, '');
        }
        return formatted;
    }

    function clearResults() {
        resultOhmsSpan.textContent = '--';
        resultKOhmSpan.textContent = '--';
        resultMOhmSpan.textContent = '--';
        toleranceValueSpan.textContent = '--';
        tempCoeffValueSpan.textContent = '--';
    }

    // --- Funções de Cálculo ---

    // Cálculo Resistor SMD
    calculateSmdBtn.addEventListener('click', calculateSmdResistance);
    smdCodeInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            calculateSmdResistance();
        }
    });

    function calculateSmdResistance() {
        clearResults();
        updateColorResistorVisualizer(true);

        let code = smdCodeInput.value.trim().toUpperCase();
        let resistanceBaseValue = null;
        let tolerance = '--';
        let tempCoeff = '--';

        updateSmdVisualizer(code);

        if (!code) {
            resultOhmsSpan.textContent = "Por favor, insira um código SMD.";
            resultKOhmSpan.textContent = "N/A";
            resultMOhmSpan.textContent = "N/A";
            return;
        }

        // 1. Caso especial com 'R' para ponto decimal (ex: 1R0, R56)
        if (code.includes('R') && code.length > 1) {
            const tempNumericPart = code.replace('R', '.');
            if (!isNaN(parseFloat(tempNumericPart))) {
                try {
                    resistanceBaseValue = parseFloat(tempNumericPart);
                    tolerance = '1% (geralmente)';
                } catch (error) {
                    resistanceBaseValue = "Código inválido.";
                }
            }
        }

        // 2. Tentativa de decodificar EIA-96
        if (resistanceBaseValue === null && code.length === 3) {
            const codePart = code.substring(0, 2);
            const multiplierLetter = code.substring(2, 3);

            const isCodePartNumeric = !isNaN(parseInt(codePart)) && codePart.length === 2;
            const isMultiplierLetter = eia96Multipliers[multiplierLetter] !== undefined;

            if (isCodePartNumeric && isMultiplierLetter) {
                const significantValue = eia96Values[codePart];
                const multiplier = eia96Multipliers[multiplierLetter];

                if (significantValue !== undefined && multiplier !== undefined) {
                    resistanceBaseValue = significantValue * multiplier;
                    tolerance = '1%';
                } else {
                    resistanceBaseValue = "Código EIA-96 inválido.";
                }
            }
        }

        // 3. Casos de 3 ou 4 dígitos numéricos (se ainda não foi decodificado)
        if (resistanceBaseValue === null) {
            const numericCode = parseInt(code);

            if (!isNaN(numericCode) && numericCode >= 0) {
                if (code.length === 3) {
                    const firstTwoDigits = parseInt(code.substring(0, 2));
                    const multiplierDigit = parseInt(code.substring(2, 3));

                    resistanceBaseValue = firstTwoDigits * (10 ** multiplierDigit);
                    tolerance = '5% (geralmente)';

                } else if (code.length === 4) {
                    const firstThreeDigits = parseInt(code.substring(0, 3));
                    const multiplierDigit = parseInt(code.substring(3, 4));

                    resistanceBaseValue = firstThreeDigits * (10 ** multiplierDigit);
                    tolerance = '1% (geralmente)';
                } else {
                    resistanceBaseValue = "Formato de código SMD não reconhecido.";
                }
            } else {
                resistanceBaseValue = "Código SMD inválido ou formato não reconhecido.";
            }
        }

        updateResultDisplay(resistanceBaseValue, tolerance, tempCoeff);
    }

    function updateSmdVisualizer(code) {
        smdResistorVisualizer.textContent = code;
    }


    calculateColorBtn.addEventListener('click', calculateColorResistance);

    function calculateColorResistance() {
        clearResults();
        updateSmdVisualizer('');

        const selectedBands = document.querySelector('input[name="numBands"]:checked').value;
        let resistanceBaseValue = null;
        let tolerance = '--';
        let tempCoeff = '--';

        const b1 = band1Select.value;
        const b2 = band2Select.value;
        const b3 = band3Select.value;
        const b4 = band4Select.value;
        const b5 = band5Select.value;
        const b6 = band6Select.value;

        updateColorResistorVisualizer();

        let missingColors = false;
        if (!b1 || !b2) missingColors = true;

        if (selectedBands === '4') {
            if (!b3) missingColors = true;
        } else if (selectedBands === '5') {
            if (!b3 || !b4 || !b5) missingColors = true;
        } else if (selectedBands === '6') {
            if (!b3 || !b4 || !b5 || !b6) missingColors = true;
        }

        if (missingColors) {
            resultOhmsSpan.textContent = "Selecione todas as faixas obrigatórias.";
            resultKOhmSpan.textContent = "N/A";
            resultMOhmSpan.textContent = "N/A";
            return;
        }

        let significantDigits = '';
        let multiplier = 1;

        if (selectedBands === '4') {
            significantDigits += colorValues[b1];
            significantDigits += colorValues[b2];
            multiplier = colorMultipliers[b3];
            tolerance = colorTolerances[b4] || '±20% (Nenhuma)';

        } else if (selectedBands === '5' || selectedBands === '6') {
            significantDigits += colorValues[b1];
            significantDigits += colorValues[b2];
            significantDigits += colorValues[b3];

            multiplier = colorMultipliers[b4];
            tolerance = colorTolerances[b5]
            tempCoeff = (selectedBands === '6') ? tempCoefficients[b6] : '--';
        }

        if (significantDigits && multiplier !== undefined && !isNaN(parseInt(significantDigits))) {
            resistanceBaseValue = parseInt(significantDigits) * multiplier;
        } else {
            resistanceBaseValue = "Cores inválidas ou combinação não suportada.";
        }

        updateResultDisplay(resistanceBaseValue, tolerance, tempCoeff);
    }

    function updateColorResistorVisualizer(clearOnly = false) {
        const selectedBandsOption = document.querySelector('input[name="numBands"]:checked').value;

        colorResistorVisualizer.classList.remove('four-bands', 'five-bands', 'six-bands');

        if (selectedBandsOption === '4') {
            colorResistorVisualizer.classList.add('four-bands');
        } else if (selectedBandsOption === '5') {
            colorResistorVisualizer.classList.add('five-bands');
        } else if (selectedBandsOption === '6') {
            colorResistorVisualizer.classList.add('six-bands');
        }

        const selectedColors = {
            'band-1': band1Select.value,
            'band-2': band2Select.value,
            'band-3': band3Select.value,
            'band-4': band4Select.value,
            'band-5': band5Select.value,
            'band-6': band6Select.value
        };

        Object.values(visualBands).forEach(band => {
            if (band) band.style.display = 'block';
        });

        visualBands['band-1'].style.backgroundColor = colorCssMap[selectedColors['band-1']] || 'transparent';
        visualBands['band-2'].style.backgroundColor = colorCssMap[selectedColors['band-2']] || 'transparent';
        visualBands['band-3'].style.backgroundColor = colorCssMap[selectedColors['band-3']] || 'transparent';
        visualBands['band-4'].style.backgroundColor = colorCssMap[selectedColors['band-4']] || 'transparent';
        visualBands['band-5'].style.backgroundColor = colorCssMap[selectedColors['band-5']] || 'transparent';
        visualBands['band-6'].style.backgroundColor = colorCssMap[selectedColors['band-6']] || 'transparent';
    }

    // Função para exibir os resultados (usada por SMD e Cores)
    function updateResultDisplay(value, tol, tempCoeff) {
        if (typeof value === 'number') {
            resultOhmsSpan.textContent = formatNumber(value, 3);
            resultKOhmSpan.textContent = formatNumber(value / 1000, 3);
            resultMOhmSpan.textContent = formatNumber(value / 1_000_000, 3);
        } else {
            resultOhmsSpan.textContent = value;
            resultKOhmSpan.textContent = "N/A";
            resultMOhmSpan.textContent = "N/A";
        }
        toleranceValueSpan.textContent = tol;
        tempCoeffValueSpan.textContent = tempCoeff || '--';
    }
});