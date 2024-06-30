class Currency {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
}

class CurrencyConverter {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currencies = []; 
    }
    async getCurrencies(apiUrl) {
        try {
            const response = await fetch(`${apiUrl}/currencies`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            // Limpiar el arreglo de currencies antes de agregar nuevas monedas
            this.currencies = [];

            for (const code in data) {
                const currency = new Currency(code, data[code]);
                this.currencies.push(currency);
            }

        } catch (error) {
            console.error('Error al obtener las monedas:', error.message);
        }
    }

    async convertCurrency(amount, fromCurrency, toCurrency) {
        try {
            if (fromCurrency.code === toCurrency.code) {
                return parseFloat(amount); 
            }

            const response = await fetch(`${this.apiUrl}/latest?base=${fromCurrency.code}&symbols=${toCurrency.code}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            const rate = data.rates[toCurrency.code];
            if (rate) {
                const convertedAmount = amount * rate;
                return convertedAmount;
            } else {
                console.error('Conversion no encontrada.');
                return null;
            }
        } catch (error) {
            console.error('Error convirtiendo conversion:', error.message);
            return null;
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("conversion-form");
    const resultDiv = document.getElementById("result");
    const fromCurrencySelect = document.getElementById("from-currency");
    const toCurrencySelect = document.getElementById("to-currency");

    const converter = new CurrencyConverter("https://api.frankfurter.app");

    await converter.getCurrencies(converter.apiUrl);
    populateCurrencies(fromCurrencySelect, converter.currencies);
    populateCurrencies(toCurrencySelect, converter.currencies);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const amount = document.getElementById("amount").value;
        const fromCurrency = converter.currencies.find(
            (currency) => currency.code === fromCurrencySelect.value
        );
        const toCurrency = converter.currencies.find(
            (currency) => currency.code === toCurrencySelect.value
        );

        const convertedAmount = await converter.convertCurrency(
            amount,
            fromCurrency,
            toCurrency
        );

        if (convertedAmount !== null && !isNaN(convertedAmount)) {
            resultDiv.textContent = `${amount} ${
                fromCurrency.code
            } son ${convertedAmount.toFixed(2)} ${toCurrency.code}`;
        } else {
            resultDiv.textContent = "Error al realizar la conversión.";
        }
    });

    function populateCurrencies(selectElement, currencies) {
        if (currencies) {
            currencies.forEach((currency) => {
                const option = document.createElement("option");
                option.value = currency.code;
                option.textContent = `${currency.code} - ${currency.name}`;
                selectElement.appendChild(option);
            });
        }
    }
});
