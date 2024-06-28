class Sensor {
    constructor(id, name, type, value, unit, updatedAt) {
        this.id = id;
        this.name = name;
        this.type = this.conditionType(type);
        this.value = value;
        this.unit = unit;
        this.updatedAt = updatedAt;
    }

    conditionType(type) {
        const conditions = ["temperature", "humidity", "pressure"];
        if (conditions.includes(type)) {
            console.log("Valor ingresado correctamente.");
            return type;
        } else {
            throw new Error(`Tipo invalido en sensor: ${type}. Tipos validos: ${conditions.join(', ')}`);
        }
    }

    set updateValue(value) {
        this.value = value;
        this.updatedAt = new Date().toISOString();
    }
}

class SensorManager {
    constructor() {
        this.sensors = [];
    }

    addSensor(sensor) {
        this.sensors.push(sensor);
    }

    updateSensor(id) {
        const sensor = this.sensors.find((sensor) => sensor.id === id);
        if (sensor) {
            let newValue;
            switch (sensor.type) {
                case "temperature": // Rango de -30 a 50 grados Celsius
                    newValue = (Math.random() * 80 - 30).toFixed(2);
                    break;
                case "humidity": // Rango de 0 a 100%
                    newValue = (Math.random() * 100).toFixed(2);
                    break;
                case "pressure": // Rango de 960 a 1040 hPa (hectopascales o milibares)
                    newValue = (Math.random() * 80 + 960).toFixed(2);
                    break;
                default: // Valor por defecto si el tipo es desconocido
                    newValue = (Math.random() * 100).toFixed(2);
            }
            sensor.updateValue = newValue;

            this.render();
        } else {
            console.error(`Sensor ID ${id} no encontrado`);
        }
    }

    async loadSensors(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error fetching sensors: ${response.statusText}`);
            }
            const sensorsArray = await response.json();
            this.sensors = sensorsArray.map(sensorData => new Sensor(
                sensorData.id,
                sensorData.name,
                sensorData.type,
                sensorData.value,
                sensorData.unit,
                new Date(sensorData.updated_at)
            ));
            this.render();
        } catch (error) {
            console.error('Error loading sensors:', error);
        }
    }

    render() {
        const container = document.getElementById("sensor-container");
        container.innerHTML = "";
        this.sensors.forEach((sensor) => {
            const sensorCard = document.createElement("div");
            sensorCard.className = "column is-one-third";
            sensorCard.innerHTML = `
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">
                            Sensor ID: ${sensor.id}
                        </p>
                    </header>
                    <div class="card-content">
                        <div class="content">
                            <p>
                                <strong>Tipo:</strong> ${sensor.type}
                            </p>
                            <p>
                               <strong>Valor:</strong> 
                               ${sensor.value} ${sensor.unit}
                            </p>
                        </div>
                        <time datetime="${sensor.updatedAt}">
                            Última actualización: ${new Date(sensor.updatedAt).toLocaleString()}
                        </time>
                    </div>
                    <footer class="card-footer">
                        <a href="#" class="card-footer-item update-button" data-id="${sensor.id}">Actualizar</a>
                    </footer>
                </div>
            `;
            container.appendChild(sensorCard);
        });

        const updateButtons = document.querySelectorAll(".update-button");
        updateButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                const sensorId = parseInt(button.getAttribute("data-id"));
                this.updateSensor(sensorId);
            });
        });
    }
}

const monitor = new SensorManager();
monitor.loadSensors("sensors.json");
