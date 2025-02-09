
        let cryptoData = [];
        let cryptoChart;

        async function fetchCrypto() {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
            cryptoData = await response.json();
            displayCrypto(cryptoData);
        }

        function displayCrypto(data) {
            const table = document.getElementById('crypto-table');
            table.innerHTML = '';

            data.forEach(coin => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${coin.name}</td>
                                 <td>$${coin.current_price.toFixed(2)}</td>
                                 <td style="color: ${coin.price_change_percentage_24h >= 0 ? 'green' : 'red'}">
                                     ${coin.price_change_percentage_24h.toFixed(2)}%
                                 </td>`;
                row.addEventListener('click', () => displayChart(coin.id, coin.name));
                table.appendChild(row);
            });
            document.getElementById('crypto-table-container').style.display = 'table';
            document.getElementById('chart-container').style.display = 'none';
            document.getElementById('error-message').style.display = 'none';
            document.getElementById('selected-crypto').style.display = 'none';
            document.getElementById('sentiment-container').style.display = 'none';
        }

        async function fetchChartData(coinId) {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7`);
                const data = await response.json();
                return data.prices;
            } catch (error) {
                console.error("Error fetching chart data:", error);
                return null;
            }
        }

        async function displayChart(coinId, coinName) {
            const prices = await fetchChartData(coinId);

            if (!prices || prices.length === 0) {
                document.getElementById('error-message').style.display = 'block';
                document.getElementById('chart-container').style.display = 'none';
                document.getElementById('selected-crypto').style.display = 'none';
                return;
            }

            document.getElementById('crypto-table-container').style.display = 'none';
            document.getElementById('chart-container').style.display = 'block';
            document.getElementById('error-message').style.display = 'none';
            document.getElementById('selected-crypto').textContent = `Chart for: ${coinName}`;
            document.getElementById('selected-crypto').style.display = 'block';
            fetchSentiment();

            const labels = prices.map(price => new Date(price[0]).toLocaleDateString());
            const values = prices.map(price => price[1]);

            const ctx = document.getElementById('price-chart').getContext('2d');

            if (cryptoChart) {
                cryptoChart.destroy();
            }

            cryptoChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Price (USD)',
                        data: values,
                        borderColor: 'blue',
                        fill: false
                    }]
                }
            });
        }

        async function fetchSentiment() {
            try {
                const response = await fetch('https://api.alternative.me/fng/');
                const data = await response.json();
                if (data && data.data && data.data.length > 0) {
                    const sentimentValue = data.data[0].value_classification;
                    document.getElementById('sentiment-value').textContent = sentimentValue;
                    document.getElementById('sentiment-container').style.display = 'block';
                }
            } catch (error) {
                console.error("Error fetching sentiment data:", error);
            }
        }

        document.getElementById('search').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredData = cryptoData.filter(coin => coin.name.toLowerCase().includes(searchTerm));
            displayCrypto(filteredData);
        });

        fetchCrypto();
        setInterval(fetchCrypto, 30000);
    