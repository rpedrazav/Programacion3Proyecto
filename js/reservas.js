document.addEventListener('DOMContentLoaded', function () {
    cargarEventos();
    verificarProximosEventos(); // Verificar eventos al cargar la página
});

function cargarEventos() {
    fetch('obtener_eventos.php')
        .then(response => response.json())
        .then(data => {
            const recordatoriosDiv = document.getElementById('recordatorios');
            recordatoriosDiv.innerHTML = ''; // Limpia el contenido anterior

            if (data.length > 0) {
                data.forEach(evento => {
                    const eventoDiv = document.createElement('div');
                    eventoDiv.className = 'alert alert-primary d-flex justify-content-between align-items-center';
                    eventoDiv.innerHTML = `
                        <div>
                            <strong>Evento:</strong> ${evento.evento}<br>
                            <strong>Fecha:</strong> ${evento.fecha}<br>
                            <strong>Hora:</strong> ${evento.hora_inicio} - ${evento.hora_fin}<br>
                            <strong>Zona de Estacionamiento:</strong> ${evento.zona}<br>
                        </div>
                        <div>
                            <button class="btn btn-warning btn-sm" onclick="editarReserva(${evento.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarReserva(${evento.id})">Eliminar</button>
                        </div>
                    `;
                    recordatoriosDiv.appendChild(eventoDiv);
                });
            } else {
                recordatoriosDiv.innerHTML = '<p class="text-center text-muted">No hay eventos reservados actualmente.</p>';
            }
        })
        .catch(error => console.error('Error al cargar los eventos reservados:', error));
}

function editarReserva(id) {
    fetch(`obtener_reserva.php?id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                document.getElementById('editarReservaId').value = data.id || '';
                document.getElementById('editarEvento').value = data.evento || '';
                document.getElementById('editarFecha').value = data.fecha || '';
                document.getElementById('editarHoraInicio').value = data.hora_inicio || '';
                document.getElementById('editarHoraFin').value = data.hora_fin || '';
                document.getElementById('editarZona').value = data.zona || '';

                const modal = new bootstrap.Modal(document.getElementById('editarReservaModal'));
                modal.show();
            } else {
                alert("Error al cargar los datos de la reserva.");
            }
        })
        .catch(error => console.error('Error al obtener los datos de la reserva:', error));
}

function eliminarReserva(id) {
    if (!id || isNaN(id)) {
        alert('ID de reserva inválido.');
        return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
        fetch(`eliminar_reservas.php?id=${id}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    alert(data.message);
                    cargarEventos(); // Recargar la lista de eventos si se elimina correctamente
                } else {
                    alert(data.message || 'Error desconocido al eliminar la reserva.');
                }
            })
            .catch(error => console.error('Error al eliminar la reserva:', error));
    }
}

document.getElementById('editarReservaForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const id = document.getElementById('editarReservaId').value;
    const evento = document.getElementById('editarEvento').value;
    const fecha = document.getElementById('editarFecha').value;
    const horaInicio = document.getElementById('editarHoraInicio').value;
    const horaFin = document.getElementById('editarHoraFin').value;
    const zona = document.getElementById('editarZona').value;

    fetch('procesar_edicion_reserva.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, evento, fecha, horaInicio, horaFin, zona })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.status === "success") {
                cargarEventos(); // Actualiza la lista de eventos
                const modal = bootstrap.Modal.getInstance(document.getElementById('editarReservaModal'));
                modal.hide();
            }
        })
        .catch(error => console.error('Error al actualizar la reserva:', error));
});

// NUEVO: Verificar eventos próximos
function verificarProximosEventos() {
    fetch('notificar_eventos.php')
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                data.forEach(evento => {
                    alertarEventoProximo(evento);
                });
            }
        })
        .catch(error => console.error('Error al verificar eventos próximos:', error));
}

function alertarEventoProximo(evento) {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = 'alert alert-warning alert-dismissible fade show';
    alertaDiv.innerHTML = `
        <strong>¡Evento Próximo!</strong><br>
        <strong>Evento:</strong> ${evento.evento}<br>
        <strong>Fecha:</strong> ${evento.fecha}<br>
        <strong>Hora:</strong> ${evento.hora_inicio}<br>
        <strong>Zona:</strong> ${evento.zona}<br>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    const container = document.querySelector('.container');
    container.prepend(alertaDiv); // Inserta la alerta al inicio del contenedor
}
