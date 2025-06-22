document.addEventListener('DOMContentLoaded', () => {
    const smdCodeInput = document.getElementById('smdCode');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultOhmsSpan = document.getElementById('resultOhms');
    const resultKOhmSpan = document.getElementById('resultKOhm');
    const resultMOhmSpan = document.getElementById('resultMOhm');
    const toleranceValueSpan = document.getElementById('toleranceValue');

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

    // Tabela de multiplicadores EIA-96
    const eia96Multipliers = {
        'A': 1, 'B': 10, 'C': 100, 'D': 1000, 'E': 10000, 'F': 100000,
        'S': 0.1, 'R': 0.01
    };

    calculateBtn.addEventListener('click', calculateSmdResistance);
    smdCodeInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            calculateSmdResistance();
        }
    });

    function formatNumber(num, precision) {
        if (typeof num !== 'number') return num;
        let formatted = num.toFixed(precision);
        if (formatted.includes('.')) {
            formatted = formatted.replace(/\.?0+$/, '');
        }
        return formatted;
    }

    function calculateSmdResistance() {
        let code = smdCodeInput.value.trim().toUpperCase();
        let resistanceBaseValue = null;
        let tolerance = '--';

        resultOhmsSpan.textContent = '--';
        resultKOhmSpan.textContent = '--';
        resultMOhmSpan.textContent = '--';
        toleranceValueSpan.textContent = '--';

        if (!code) {
            resultOhmsSpan.textContent = "Por favor, insira um código.";
            resultKOhmSpan.textContent = "N/A";
            resultMOhmSpan.textContent = "N/A";
            return;
        }

        // --- Ordem de verificação aprimorada ---

        // 1. Caso especial com 'R' para ponto decimal (ex: 1R0, R56)
        // Verifica se o código contém 'R' e se o restante é um número válido (para evitar pegar códigos EIA-96 tipo '01R')
        if (code.includes('R') && code.length > 1) {
            const tempNumericPart = code.replace('R', '.');
            if (!isNaN(parseFloat(tempNumericPart))) {
                try {
                    resistanceBaseValue = parseFloat(tempNumericPart);
                    tolerance = '1% (geralmente)';
                } catch (error) {
                    resistanceBaseValue = "Código inválido.";
                    tolerance = "--";
                }
            }
        }

        // 2. Tentativa de decodificar EIA-96
        // Só tenta se 'resistanceBaseValue' ainda for null (não foi tratado pelo 'R' decimal)
        // e se o código tem 3 caracteres, os dois primeiros são dígitos e o terceiro é uma letra
        if (resistanceBaseValue === null && code.length === 3) {
            const codePart = code.substring(0, 2);
            const multiplierLetter = code.substring(2, 3);

            // Verifica se os dois primeiros caracteres são dígitos
            const isCodePartNumeric = !isNaN(parseInt(codePart)) && codePart.length === 2;
            // Verifica se o terceiro caractere é uma letra (multiplicador)
            const isMultiplierLetter = eia96Multipliers[multiplierLetter] !== undefined;

            if (isCodePartNumeric && isMultiplierLetter) {
                const significantValue = eia96Values[codePart];
                const multiplier = eia96Multipliers[multiplierLetter];

                if (significantValue !== undefined && multiplier !== undefined) {
                    resistanceBaseValue = significantValue * multiplier;
                    tolerance = '1%';
                } else {
                    resistanceBaseValue = "Código EIA-96 inválido.";
                    tolerance = "--";
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
                    resistanceBaseValue = "Formato de código não reconhecido.";
                    tolerance = "--";
                }
            } else {
                resistanceBaseValue = "Código inválido ou formato não reconhecido.";
                tolerance = "--";
            }
        }

        if (typeof resistanceBaseValue === 'number') {
            resultOhmsSpan.textContent = formatNumber(resistanceBaseValue, 3);
            resultKOhmSpan.textContent = formatNumber(resistanceBaseValue / 1000, 3);
            resultMOhmSpan.textContent = formatNumber(resistanceBaseValue / 1_000_000, 3);
        } else {
            resultOhmsSpan.textContent = resistanceBaseValue;
            resultKOhmSpan.textContent = "N/A";
            resultMOhmSpan.textContent = "N/A";
        }
        toleranceValueSpan.textContent = tolerance;
    }
});