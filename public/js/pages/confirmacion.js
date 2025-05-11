document.addEventListener('DOMContentLoaded', function() {
    // Generate random order number
    const ordenNumero = document.getElementById('orden-numero');
    if (ordenNumero) {
        ordenNumero.textContent = Math.floor(10000 + Math.random() * 90000);
    }

    // Set current date
    const fechaActual = document.getElementById('fecha-actual');
    if (fechaActual) {
        const fecha = new Date();
        const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' };
        fechaActual.textContent = fecha.toLocaleDateString('es-ES', opciones);
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || 'modofit';
    const descuento = urlParams.get('descuento') === 'true';

    // Plan configuration
    const planes = {
        modofit: { nombre: 'Membresía ModoFit', precio: 49.90, matricula: 0.00 }
    };

    // Update plan information
    const planNombre = document.getElementById('plan-nombre');
    const precioMensualidad = document.getElementById('precio-mensualidad');
    const precioTotal = document.getElementById('precio-total');
    const descuentoRow = document.getElementById('descuento-row');
    const descuentoMonto = document.getElementById('descuento-monto');

    if (planes[plan] && planNombre && precioMensualidad && precioTotal) {
        const planSeleccionado = planes[plan];
        planNombre.textContent = planSeleccionado.nombre;
        precioMensualidad.textContent = `S/. ${planSeleccionado.precio.toFixed(2)}`;

        // Calculate total price
        let total = planSeleccionado.precio + planSeleccionado.matricula;

        // Apply discount if applicable
        if (descuento && descuentoRow) {
            descuentoRow.style.display = 'flex';
            if (descuentoMonto) {
                descuentoMonto.textContent = '- S/. 20.00';
            }
            total -= 20.00;
        } else if (descuentoRow) {
            descuentoRow.style.display = 'none';
        }

        precioTotal.textContent = `S/. ${total.toFixed(2)}`;
    }

    // Share functionality
    const shareButton = document.getElementById('shareButton');
    if (shareButton) {
        shareButton.addEventListener('click', function() {
            Swal.fire({
                title: '¡Comparte tu logro!',
                html: `
                    <p class='mb-4'>Comparte tu nueva membresía con tus amigos y motívalos a unirse a ModoFit.</p>
                    <div class='flex justify-center space-x-4 mt-4'>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class='bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition duration-300'>
                            <i class='fab fa-facebook-f text-xl'></i>
                        </a>
                        <a href="https://www.instagram.com/" target="_blank" class='bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full transition duration-300'>
                            <i class='fab fa-instagram text-xl'></i>
                        </a>
                        <a href="https://wa.me/?text=${encodeURIComponent('¡Me he unido a ModoFit! 💪 Únete tú también: ' + window.location.origin)}" target="_blank" class='bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition duration-300'>
                            <i class='fab fa-whatsapp text-xl'></i>
                        </a>
                    </div>
                `,
                showConfirmButton: false,
                showCloseButton: true
            });
        });
    }

    // Clear form data
    localStorage.removeItem('modofit_datos_formulario');

    // Animations
    gsap.from('.check-icon', {
        scale: 0,
        opacity: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.3)',
        delay: 0.5
    });
    
    gsap.from('.confirmation-title', {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.8
    });
    
    gsap.from('.confirmation-details', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1
    });
    
    gsap.from('.next-steps', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        delay: 1.5
    });
});